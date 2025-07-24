import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { PromptTemplate } from '@langchain/core/prompts'
import {
  RunnableSequence,
  RunnablePassthrough
} from '@langchain/core/runnables'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { MongoClient } from 'mongodb'
import { env } from '../config/env'
import { getProducts } from '../models/products'
import { setCache, getCache } from '../utils/cache'
import { z } from 'zod'

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

const responseSchema = z.object({
  productIds: z.array(z.string()),
  summary: z.string(),
  details: z.string()
})

const productParser = StructuredOutputParser.fromZodSchema(responseSchema)

const productPrompt = PromptTemplate.fromTemplate(`
  You are an expert AI insurance analyst. Your purpose is to precisely match a user's needs to the right insurance products and clearly explain your recommendations.

  Analyze the user's question and the provided context. Identify all relevant products and rank them by relevance, from most to least relevant.

  Return ONLY a valid Javascript object in this format:

  {{
    "productIds": ["best_match_id", "good_match_id1"],
    "summary": "A brief, encouraging summary that names the top recommended product and its main benefit for the user in the \`productIds\` array.",
    "details": "A single string containing a markdown-formatted list explaining the reason for each product recommendation."
  }}

  **Instructions:**

  1.  **\`productIds\`**: The array should be ordered by relevance (most to least). The first ID MUST be the single best match. 
  2.  **\`summary\`**: 
      * This should be a short, engaging sentence. Start by highlighting the top product and how it addresses the user's primary need.
      * The information provided in the summary should always be based on the products returned in the \`productIds\` array. Do not include any products that are not in the productIds array.
  3.  **\`details\`**: This must be a single string formatted with markdown.
      * Create a bulleted list using asterisks (\`*\`) or hyphens (\`-\`).
      * For each bullet point, briefly state the key benefit of a recommended product that addresses the user's query. It's helpful to bold the product name or key feature.
      * Ensure the order of reasons in the list matches the order of IDs in \`productIds\`.
      * The information provided in the details should always be based on the products returned in the \`productIds\` array. Do not include any products that are not in the productIds array.

  **Example Scenario:**
  * **Question**: "I need car insurance for my new electric vehicle. I'm worried about battery issues."
  * **Context**: Product A has specific EV battery coverage. Product B has a great roadside assistance program.

  **Example Javascript Object Output:**

  \`\`\`js object
  {{
    "productIds": ["EV_Ultra_88", "Auto_Plus_55"],
    "summary": "The EV Ultra plan is the perfect fit for your new electric vehicle, offering specialized coverage for peace of mind.",
    "details": "* **EV Ultra Plan**: Includes specific coverage for **EV battery failure**, which directly addresses your concern.\n* **Auto Plus Plan**: Offers our top-rated **24/7 roadside assistance** program and comprehensive accident coverage."
  }}

  Context:
  {context}

  Question:
  {question}
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

export const getBestProduct = async (
  question: string
): Promise<FinalResponse> => {
  const cachedResults = getCache(question)
  if (cachedResults) {
    return cachedResults as FinalResponse
  }

  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: collection,
    indexName: 'products_vector_index',
    embeddingKey: 'embeddings'
  })

  const retriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 10
  })

  const productsChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
      format_instructions: () => productParser.getFormatInstructions()
    },
    productPrompt,
    llm,
    productParser
  ])

  const result = await productsChain.invoke(question)

  console.log({ result })

  const products = await getProducts(result.productIds)

  const summary = result.summary + `\n\n` + result.details

  const finalResponse: FinalResponse = {
    summary,
    products
  }

  setCache(question, finalResponse)

  return finalResponse
}
