'use strict'

import { EventEmitter } from 'events'
import mongoose from 'mongoose'
import { env } from './env'

const { url } = env.mongoDb

export const connectToMongoDB = async () => {
  mongoose.connect(url)
  return new Promise((resolve, reject) => {
    mongoose.connection
      .on('open', () => {
        console.log(`Connected to MongoDB successfully`)
        resolve(true)
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

export const disconnectFromMongoDb = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    console.log('Disconnected from mongodb successfully')
  } catch (error) {
    console.log('Error disconnecting from mongodb:', error)
  }
}
