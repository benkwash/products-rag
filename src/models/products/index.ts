import { ProductModel, Product } from './schema'
import { Types } from 'mongoose'

type NewProduct = Omit<Product, 'createdAt' | 'updatedAt'>

export const create = async (document: NewProduct) => {
  const result = await ProductModel.create(document)
  return result.toObject()
}

export const createMany = async (documents: Array<NewProduct>) => {
  const result = await ProductModel.insertMany(documents)
  return result.map((doc) => doc.toObject())
}

export const getProduct = async (id: string) => {
  const [product] = await ProductModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(id)
      }
    },
    {
      $lookup: {
        from: 'businesses_rags',
        localField: 'businessId',
        foreignField: '_id',
        as: 'business',
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              image: 1,
              description: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$business'
    },
    {
      $project: {
        _id: 1,
        name: 1,
        business: 1,
        description: 1
      }
    }
  ])

  return product
}
export const getProducts = async (ids: Array<string>) => {
  const products = await ProductModel.aggregate([
    {
      $match: {
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) }
      }
    },
    {
      $lookup: {
        from: 'businesses_rags',
        localField: 'businessId',
        foreignField: '_id',
        as: 'business',
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              image: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$business'
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        business: 1
      }
    }
  ])
  return products
}
