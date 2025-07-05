import { Business, BusinessModel } from './schema'

type NewBusiness = Omit<Business, 'createdAt' | 'updatedAt'>

export const create = async (document: NewBusiness) => {
  const result = await BusinessModel.create(document)
  return result.toObject()
}

export const createMany = async (documents: Array<NewBusiness>) => {
  const result = await BusinessModel.insertMany(documents)
  return result.map((doc) => doc.toObject())
}
