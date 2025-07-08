import express from 'express'
import { getBestProduct } from './services/rag.service'
import { getProductService } from './services/get-products'

export const app = express()
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .get('/health', (req, res) => {
    res.status(200).send('OK')
  })
  .get('/search', async (req, res) => {
    const searchQuery = req.query.search
    try {
      if (!searchQuery || typeof searchQuery !== 'string') {
        res.status(400).send('Invalid search query')
        return
      }
      const results = await getBestProduct(searchQuery as string)

      res.status(200).json(results)
    } catch (error) {
      console.error('Error processing search:', error)
      res.status(500).send('Internal Server Error')
    }
  })
  .get('/products/:id', async (req, res) => {
    const id = req.params.id

    try {
      const product = await getProductService(id)

      res.status(200).json(product)
    } catch (error) {
      console.error('Error processing search:', error)
      res.status(500).send('Internal Server Error')
    }
  })
