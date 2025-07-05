import { connectDb, disconnectDb, query } from '../config/db'
import { connectToMongoDB, disconnectFromMongoDb } from '../config/mongo-db'
import { data as biegeAssure } from './data/biege-assure'
import { data as enterprise } from './data/enterprise'
import { data as glico } from './data/glico'
import { data as impact } from './data/impact-life'
import { data as miLife } from './data/mi-life'
import { data as prudential } from './data/prudential'
import { data as sic } from './data/sic'
import { data as starlife } from './data/starlife'
import { data as vanguard } from './data/vanguard'
import { data as businesses } from './data/businesses'

import { create as createBusiness } from '../models/businesses'
import { createMany as createProducts } from '../models/products'

import { createEmbedding } from '../utils/create-embedding'

export const products = {
  biege_assure: biegeAssure,
  impact_life: impact,
  mi_life: miLife,
  enterprise,
  glico,
  prudential,
  sic,
  starlife,
  vanguard
}

const seedDatabase = async () => {
  try {
    await connectToMongoDB()
    console.log('Seeding database...')

    for (const business of businesses) {
      const createdBusiness = await createBusiness({
        name: business.name,
        description: business.description,
        image: business.image
      })

      console.log({ createdBusiness })

      const businessProducts = products[business.slug].map(
        async ({ name, description, details_text }) => ({
          name,
          description,
          businessId: createdBusiness._id,
          embeddings: await createEmbedding(details_text)
        })
      )

      const results = await Promise.all(businessProducts)
      // console.log({ results })
      const createdProducts = await createProducts(results)
    }

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await disconnectFromMongoDb()
  }
}

seedDatabase()
