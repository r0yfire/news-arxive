const { fetchAndParseRSS } = require('./rssFeedParser');
const { checkEntryExists, updateDatabase } = require('./databaseInteractor');
const { downloadAndConvertPDFToText } = require('./pdfConverter');
const { generateAndSendSummary } = require('./summaryGenerator');

async function processEntries() {
  try {
    console.log('Starting to process entries from RSS feed...');
    const entries = await fetchAndParseRSS();
    for (let entry of entries) {
      const exists = await checkEntryExists(entry.link);
      if (!exists) {
        console.log(`Processing new entry: ${entry.title}`);
        const pdfUrl = entry.link.replace('/abs/', '/pdf/') + '.pdf'; // appending '.pdf' as per arXiv convention
        const pdfContent = await downloadAndConvertPDFToText(pdfUrl);
        await generateAndSendSummary(pdfContent, entry.title, pdfUrl);
        await updateDatabase(entry.link);
      } else {
        console.log(`Entry already processed: ${entry.title}`);
      }
    }
    console.log('Finished processing entries.');
  } catch (error) {
    console.error('Error processing entries:', error.message, error.stack);
  }
}

if (require.main === module) {
  processEntries().then(() => console.log('News-Arxive app execution completed.'))
                  .catch(error => console.error('Execution error in News-Arxive app:', error.message, error.stack));
}

module.exports = { processEntries };