import { connectDb, disconnectDb, query } from '../config/db'
import { data as biegeAssure } from './data/biege-assure'
import { data as enterprise } from './data/enterprise'
import { data as glico } from './data/glico'
import { data as impact } from './data/impact-life'
import { data as miLife } from './data/mi-life'
import { data as prudential } from './data/prudential'
import { data as sic } from './data/sic'
import { data as starlife } from './data/starlife'
import { data as vanguard } from './data/vanguard'

export const products = [
  ...biegeAssure,
  ...enterprise,
  ...glico,
  ...impact,
  ...miLife,
  ...prudential,
  ...sic,
  ...starlife,
  ...vanguard
]

const seedDatabase = async () => {
  try {
    await connectDb()
    console.log('Seeding database...')

    for (const product of products) {
      const queryString = `
        INSERT INTO products (name, description, details_text, embeddings)
        VALUES ($1, $2, $3, ai.openai_embed('text-embedding-3-small', $4));
      `
      const values = [
        product.name,
        product.description,
        product.text,
        product.details_text.replace(/\n/g, ' ')
      ]

      await query(queryString, values)
    }

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await disconnectDb()
  }
}

seedDatabase()
