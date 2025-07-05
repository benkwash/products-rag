const {
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  OPENAI_API_KEY,
  MONGODB_CONNECTION_URI,
  MONGODB_DB_NAME,
  MONGODB_VECTOR_COLLECTION_NAME
} = process.env

if (
  !DB_NAME ||
  !DB_HOST ||
  !DB_PORT ||
  !DB_USER ||
  !DB_PASSWORD ||
  !OPENAI_API_KEY ||
  !MONGODB_CONNECTION_URI ||
  !MONGODB_DB_NAME ||
  !MONGODB_VECTOR_COLLECTION_NAME
) {
  throw new Error('Missing environment variables')
}

export const env = {
  db: {
    name: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  },
  mongoDb: {
    url: MONGODB_CONNECTION_URI,
    dbName: MONGODB_DB_NAME,
    vectorCollectionName: MONGODB_VECTOR_COLLECTION_NAME
  },
  openAIApiKey: OPENAI_API_KEY
}
