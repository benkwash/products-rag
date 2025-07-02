import { connectDb, disconnectDb } from 'src/config/db'
import { getBestProduct } from 'src/services/rag.service'

const searchDatabase = async () => {
  try {
    await connectDb()
    const results = getBestProduct(
      'What is the best product for child education?'
    )

    console.log({ results })
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await disconnectDb()
  }
}

searchDatabase()
