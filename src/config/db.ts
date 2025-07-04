import { Client } from 'pg'
import { env } from './env'

const { user, password, host, name, port } = env.db
const openAIApiKey = env.openAIApiKey

const connectionString = `postgres://${user}:${password}@${host}:${port}/${name}?options=-c%20ai.openai_api_key%3D${openAIApiKey}`

export const client = new Client({
  connectionString
})

export const connectDb = async (): Promise<void> => {
  try {
    await client.connect()
    console.log('Connected to postgres successfully')
  } catch (error) {
    console.log('Error connecting to postgres:', error)
  }
}

export const disconnectDb = async (): Promise<void> => {
  try {
    await client.end()
    console.log('Disconnected from postgres successfully')
  } catch (error) {
    console.log('Error disconnecting from postgres:', error)
  }
}

export const query = async <T>(
  query: string,
  values?: unknown[]
): Promise<T[]> => {
  try {
    const { rows } = await client.query(query, values)
    return rows
  } catch (error) {
    console.log('Error executing query:', error)
    throw error
  }
}
