import { connectDb, disconnectDb, query } from '../config/db.js'

const searchDatabase = async () => {
  try {
    await connectDb()

    const searchQuery =
      'I want to increase my wealth. Which product is best for me?'
    const queryString = `
      SELECT id, name
      FROM products
      ORDER BY embeddings <=> ai.openai_embed('text-embedding-3-small', $1)
      LIMIT 10;
    `
    const values = [searchQuery]
    const results = await query(queryString, values)

    console.log({ results })
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await disconnectDb()
  }
}

searchDatabase()
