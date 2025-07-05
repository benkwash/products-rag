import 'dotenv/config'
import { app } from './app'
import { connectToMongoDB, disconnectFromMongoDb } from './config/mongo-db'

const startServer = async (): Promise<void> => {
  try {
    await connectToMongoDB()
    console.log('Database connected successfully')

    const PORT = 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    await disconnectFromMongoDb()
    process.exit(1) // Exit the process with failure
  }
}

startServer()
