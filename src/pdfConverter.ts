import axios from 'axios';
import PDFParse from 'pdf-parse-debugging-disabled';

/**
 * Downloads a PDF from a given URL and converts it to Markdown format.
 * @param {string} url The URL of the PDF (with '/abs/' already replaced by '/pdf/').
 * @returns {Promise<string>} The text extracted from the PDF.
 */
async function downloadAndConvertPDFToText(url: string): Promise<string> {
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
    } catch (error: any) {
        console.error('Error downloading or parsing PDF:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

export {downloadAndConvertPDFToText};