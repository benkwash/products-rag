export const env = {
  db: {
    name: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  openAIApiKey: process.env.OPENAI_API_KEY
}
