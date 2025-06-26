import express from 'express'
import { query } from './config/db'

export const app = express()
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .get('/health', (req, res) => {
    res.status(200).send('OK')
  })
  .get('/search', async (req, res) => {
    const searchQuery = req.query.search
    try {
      const queryString = `
          SELECT id, name
          FROM products
          ORDER BY embeddings <=> ai.openai_embed('text-embedding-3-small', $1)
          LIMIT 10;
        `
      const values = [searchQuery]
      const results = await query(queryString, values)

      res.status(200).json(results)
    } catch (error) {
      console.error('Error processing search:', error)
      res.status(500).send('Internal Server Error')
    }
  })
