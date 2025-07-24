import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: 60 * 60, // 1 hour
  checkperiod: 60 * 60 // 1 hour
})

export const setCache = (key: string, value: any) => {
  cache.set(key, value)
}

export const getCache = (key: string) => {
  return cache.get(key)
}

export const deleteCache = (key: string) => {
  cache.del(key)
}
