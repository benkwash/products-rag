import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { PromptTemplate } from '@langchain/core/prompts'
import {
  RunnableSequence,
  RunnablePassthrough
} from '@langchain/core/runnables'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { MongoClient } from 'mongodb'
import { env } from '../config/env'

interface ProductResponse {
  id: string
  name: string
}

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small'
})

const client = new MongoClient(env.mongoDb.url)
const collection = client
  .db(env.mongoDb.dbName)
  .collection(env.mongoDb.vectorCollectionName)

const llm = new ChatOpenAI({ openAIApiKey: env.openAIApiKey })

const parser = new JsonOutputParser<ProductResponse>()

const prompt = PromptTemplate.fromTemplate(`
  You are an expert assistant for an insurance company.
  Based on the following context of available insurance products, identify ALL products that are a good match for the user's question.
  
  If no relevant product is found in the context, return an empty JSON array.
  Otherwise, return a JSON array of objects. Each object in the array should have the "id" and "name" of a matching product.
  Include all products from the context that reasonably match the user's query.

  Return ONLY the JSON object and nothing else.

  {format_instructions}

  Context: {context}

  Question: {question}
`)

const formatDocs = (docs: Document[]) => {
  return docs
    .map((doc) => {
      console.log(doc)
      return `
        Product ID: ${doc.metadata._id}
        Product Name: ${doc.metadata.name}
        Description: ${doc.pageContent}
        `
    })
    .join('\n\n')
}

export const getBestProduct = async (
  question: string
): Promise<ProductResponse> => {
  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: collection,
    indexName: 'products_vector_index',
    embeddingKey: 'embeddings'
  })

  const retriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 10
  })

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
      format_instructions: () => parser.getFormatInstructions()
    },
    prompt,
    llm,
    parser
  ])

  const result = await chain.invoke(question)

  return result
}
