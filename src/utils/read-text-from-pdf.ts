import { join } from 'path'
import { PDFExtract } from 'pdf.js-extract'

export const readDataFromPDF = async (fileName) => {
  const __dirname = process.cwd()
  const filePath = join(__dirname, 'src', 'scripts', 'data', fileName)
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
