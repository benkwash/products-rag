import { getProduct } from 'src/models/products'
import { setCache, getCache } from '../utils/cache'
import { get } from 'http'

export const getProductService = async (id: string) => {
  const cachedProduct = getCache(id)
  if (cachedProduct) {
    return cachedProduct
  }

  const product = await getProduct(id)

  setCache(id, product)

  return product
}
