import { getProduct } from 'src/models/products'

export const getProductService = async (id: string) => {
  return getProduct(id)
}
