import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PDFExtract } from 'pdf.js-extract'
import { connectDb, disconnectDb, query } from '../config/db.js'

const readDataFromPDF = async (fileName) => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const filePath = join(__dirname, 'data', fileName)
  try {
    const pdfExtract = new PDFExtract()
    const data = await pdfExtract.extract(filePath, {})
    let textContent = ''
    data.pages.forEach((page) => {
      let lineText = ''
      page.content.forEach((item) => {
        if (item.str.trim()) {
          lineText += item.str + ' '
        }
      })
      textContent += lineText.trim() + '\n'
    })
    return textContent.trim()
  } catch (err) {
    console.error('Error extracting structured text:', err)
    return null
  }
}

const getProductsData = async () => {
  const [
    // uppData,
    // clpData
    // wmpData,
    fppData,
    cpfData,
    shpData
  ] = await Promise.all([
    // readDataFromPDF('upp.pdf')
    // readDataFromPDF('clp.pdf'),
    // readDataFromPDF('wmp.pdf')
    readDataFromPDF('fpp.pdf'),
    readDataFromPDF('shp.pdf'),
    readDataFromPDF('cpf.pdf')
  ])

  return [
    // {
    //   name: 'Ultimate Protection Plus',
    //   description:
    //     'StarLife Ultimate Protection Plus \n With your best interest at heart, the StarLife Ultimate Protection Plan offers you and your dependants with vital protection in the unfortunate event of disability or death. The policy also offers benefits applicable to 13 critical illnesses. \n●  Minimum age at entry is 18 years and maximum age is 57 years. \n●  This policy has a minimum term of 8 years, and a maximum of 20 years. The age of the assured at the end of the term shall not exceed 65 years.\n●  Premiums are returned to you at the end of the policy term if you do not benefit from any claim for your loyalty.\nGet the Ultimate Protection Plan and enjoy absolute peace of mind, protecting the people you love!',
    //   details_text: uppData
    // },
    // {
    //   name: 'Child Lifeline Plus',
    //   description:
    //     'Child Lifeline Plus\nGiving your child a head start in life\nThe dream of providing quality education for your children will only be attained if you make adequate provision towards financing their education from the cradle to the highest level. The Child Lifeline Plus gives you a life insurance cover which will help you fulfil that dream by assisting you plan financially to ensure that your children receive quality education even in the event of your permanent disability or pre-mature demise.\n●  Minimum age at entry is 18 years and maximum age is 51 years.\n●  This policy has a minimum term of 8 years, and a maximum of 25 years.\n●  Competitive returns on savings.\nGet the Child Lifeline Plus and meet your child or family’s education financing needs now and in the future.!',
    //   details_text: clpData
    // },
    // {
    //   name: 'WealthMaster Plus',
    //   description:
    //     'WealthMaster Plus\nFinancial planning plays an integral part in alleviating life contingencies.\nThe WealthMaster Plus offers you a life insurance cover and a unique opportunity to create wealth to meet your medium and long term goals. It provides you absolute peace of mind by ensuring your dreams and aspirations are met with ease.\n●  Minimum age at entry is 18 years and maximum age is 59 years. \n●  This policy has a minimum term of 4 years, and a maximum of 10 years.\n●  Competitive returns on investment.\nGet the WealthMaster Plus to provide a convenient and flexible approach to the realisation of your individual and family goals.',
    //   details_text: wmpData
    // },
    {
      name: 'Family Protection Plan',
      description:
        'Thus the family plays a very important role in our lives and such its interest needs to be safeguard. Unfortunately, the ‘’life’’ of a family is taken away with the demise of the bread winner. This is where the StarLife Family Protection Policy steps in to ensure that in the absence of the breadwinner the Family continues to enjoy life.',
      details_text: fppData
    },
    {
      name: 'Supreme HomeCall Plan',
      description:
        'Supreme HomeCall Plan\nThe Supreme HomeCall Plan is a comprehensive home insurance policy that provides coverage for your home and its contents against various risks. It offers financial protection in the event of fire, theft, natural disasters, and other unforeseen circumstances that may cause damage to your property.\n●  Minimum age at entry is 18 years and maximum age is 65 years.\n●  This policy has a minimum term of 1 year, and a maximum of 20 years.\n●  Competitive premiums with flexible payment options.\nGet the Supreme HomeCall Plan to protect your home and belongings from unexpected events.',
      details_text: cpfData
    },
    {
      name: 'Cashbuilder Plus',
      description:
        'Cashbuilder Plus\nThe Cashbuilder Plus is a savings and investment plan that helps you build wealth over time. It allows you to save regularly and earn competitive returns on your investments. The plan is designed to help you achieve your financial goals, whether it’s for retirement, education, or any other long-term objective.\n●  Minimum age at entry is 18 years and maximum age is 65 years.\n●  This policy has a minimum term of 5 years, and a maximum of 30 years.\n●  Flexible contribution options with the potential for high returns.\nGet the Cashbuilder Plus to secure your financial future and achieve your dreams.',
      details_text: shpData
    }
  ]
}

const seedDatabase = async () => {
  try {
    const products = await getProductsData()
    await connectDb()
    console.log('Seeding database...')

    // const openai = new OpenAI({
    //   apiKey: env.openAIApiKey
    // })
    for (const product of products) {
      const queryString = `
        INSERT INTO products (name, description, details_text, embeddings)
        VALUES ($1, $2, $3, ai.openai_embed('text-embedding-3-small', $4));
      `
      // const response = await openai.embeddings.create({
      //   model: 'text-embedding-3-small',
      //   input: product.details_text.replace(/\n/g, ' ')
      // })

      // const embeddings = response.data[0].embedding
      const values = [
        product.name,
        product.description,
        product.details_text,
        product.details_text.replace(/\n/g, ' ')
      ]

      console.log({ values })
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
