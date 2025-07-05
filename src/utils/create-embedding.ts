import { OpenAIEmbeddings } from '@langchain/openai'
import { env } from '../config/env'

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.openAIApiKey,
  modelName: 'text-embedding-3-small',
  dimensions: 1536
})

export const createEmbedding = async (text) => {
  try {
    const embedding = await embeddings.embedQuery(text)
    return embedding
  } catch (err) {
    console.log('Error generating embedding: ', err)
    throw new Error('Failed to generate embedding for text.')
  }
}
