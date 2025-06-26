const { DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, OPENAI_API_KEY } =
  process.env

if (
  !DB_NAME ||
  !DB_HOST ||
  !DB_PORT ||
  !DB_USER ||
  !DB_PASSWORD ||
  !OPENAI_API_KEY
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
  openAIApiKey: OPENAI_API_KEY
}
