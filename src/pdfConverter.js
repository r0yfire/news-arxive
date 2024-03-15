const axios = require('axios');
const PDFParse = require('pdf-parse');

/**
 * Downloads a PDF from a given URL and converts it to Markdown format.
 * @param {string} url The URL of the PDF (with '/abs/' already replaced by '/pdf/').
 * @returns {Promise<string>} The text extracted from the PDF.
 */
async function downloadAndConvertPDFToText(url) {
  try {
    console.log(`Starting download of PDF from: ${url}`);
    // Download PDF
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    console.log('PDF download completed. Extracting text...');
    // Extract text from PDF
    const data = await PDFParse(response.data);
    return data.text;
  } catch (error) {
    console.error('Error downloading or parsing PDF:', error.message, error.stack);
    throw error; // Rethrow to allow caller handling
  }
}

module.exports = { downloadAndConvertPDFToText };