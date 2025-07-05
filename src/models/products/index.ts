import { ProductModel, Product } from './schema'

type NewProduct = Omit<Product, 'createdAt' | 'updatedAt'>

export const create = async (document: NewProduct) => {
  const result = await ProductModel.create(document)
  return result.toObject()
}

export const createMany = async (documents: Array<NewProduct>) => {
  const result = await ProductModel.insertMany(documents)
  return result.map((doc) => doc.toObject())
}

export const find = async (query) => {
  const result = await ProductModel.find(query)
  return result.map((doc) => doc.toObject())
}

export const findById = async (id) => {
  const result = await ProductModel.findById(id)
  return result.toObject()
}
