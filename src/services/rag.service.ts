import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { PromptTemplate } from '@langchain/core/prompts'
import {
  RunnableSequence,
  RunnablePassthrough
} from '@langchain/core/runnables'
import {
  JsonOutputParser,
  StringOutputParser
} from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { MongoClient } from 'mongodb'
import { env } from '../config/env'
import { getProducts } from '../models/products'
import { setCache, getCache } from '../utils/cache'

interface FinalResponse {
  summary: string
  products: any[]
}

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small'
})

const client = new MongoClient(env.mongoDb.url)
const collection = client
  .db(env.mongoDb.dbName)
  .collection(env.mongoDb.vectorCollectionName)

const llm = new ChatOpenAI({ openAIApiKey: env.openAIApiKey })

const productParser = new JsonOutputParser<Array<string>>()
const summaryParser = new StringOutputParser()

const productPrompt = PromptTemplate.fromTemplate(`
  You are an expert assistant for an insurance company.

  Based on the user's question and the provided list of insurance products, identify which products match the user's needs.

  Return ONLY a valid JSON object in this format:

  ["id1", "id2", "id3"]
  

  - Only include product IDs that are relevant.
  - If no products are relevant, return an empty array: []
  - Do NOT include any text or explanation outside the JSON object.

  Context:
  {context}

  Question:
  {question}
`)

const summaryPrompt = PromptTemplate.fromTemplate(`
  You are a helpful assistant working for an insurance company.

  You are given a list of insurance products and a user question. Your task is to generate a well-structured **Markdown summary** in this exact format:

  - Begin with 1–2 paragraphs that:
    - Explain how the listed insurance products **(mention each by name)** address the user's needs
    - Refer directly to the **user’s question**

  - Then list the products in Markdown bullets:
    - Each **product name should be bolded**
    - Follow with 2–4 key features as sub-bullets (keep them concise)

  Your response **must include all products provided**.

  Return the summary string and Nothing else.

  User Question:
  {question}

  Products:
  {formattedProducts}
`)

const formatDocs = (docs: Document[]) => {
  return docs
    .map((doc) => {
      return `
        Product ID: ${doc.metadata._id.toString()}
        Product Name: ${doc.metadata.name}
        Description: ${doc.metadata.description}
      `
    })
    .join('\n\n')
}

const formatProducts = (products: any[]) => {
  return products
    .map((product, index) => {
      // console.log({ product: product._id, index })
      return `
        Product ID: ${product._id.toString()}
        Product Name: ${product.name}
        Description: ${product.description}
      `
    })
    .join('\n\n')
}

export const getBestProduct = async (
  question: string
): Promise<FinalResponse> => {
  // const cachedResults = getCache(question)
  // if (cachedResults) {
  //   return cachedResults as FinalResponse
  // }

  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: collection,
    indexName: 'products_vector_index',
    embeddingKey: 'embeddings'
  })

  const retriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 10
  })

  const docs = await retriever.invoke(question)
  const context = formatDocs(docs)

  const productsChain = RunnableSequence.from([
    productPrompt,
    llm,
    productParser
  ])

  const result = await productsChain.invoke({ question, context })

  // console.log({ result })
  const products = await getProducts(result)

  let summary =
    "No matching products were identified based on the user's question."

  if (products && products.length > 0) {
    const summaryChain = RunnableSequence.from([
      summaryPrompt,
      llm,
      summaryParser
    ])

    const summaryResult = await summaryChain.invoke({
      formattedProducts: formatProducts(products),
      question
    })

    // console.log({ summaryResult })
    summary = summaryResult
  }

  const finalResponse: FinalResponse = {
    summary,
    products
  }
  setCache(question, finalResponse)

  return finalResponse
}
