import { app } from './app.js'
import { connectDb, disconnectDb } from './config/db.js'

const startServer = async () => {
  try {
    await connectDb()
    console.log('Database connected successfully')

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    await disconnectDb()
    process.exit(1) // Exit the process with failure
  }
}

startServer()
