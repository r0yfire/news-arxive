const { fetchAndParseRSS } = require('./rssFeedParser');
const { checkEntryExists, updateDatabase } = require('./databaseInteractor');
const { downloadAndConvertPDFToText } = require('./pdfConverter');
const { generateAndSendSummary } = require('./summaryGenerator');

const MAX_ENTRIES = 5;

async function processEntries() {
  let counter = 0;
  try {
    console.log('Starting to process entries from RSS feed...');

    // Fetch and parse RSS feed
    const entries = await fetchAndParseRSS();

    // Create unique entries by link
    const entriesMap = entries.reduce((acc, entry) => {
      acc[entry.link] = entry;
      return acc;
    }, {});
    const uniqueEntries = Object.values(entriesMap);

    // Process each unique entry
    for (let entry of uniqueEntries) {
      const exists = await checkEntryExists(entry.link);
      if (!exists) {

        // Limit the number of entries processed
        if (counter >= MAX_ENTRIES) {
          console.log(`Reached maximum number of entries to process: ${MAX_ENTRIES}`);
          break;
        }

        // Process entry
        console.log(`Processing new entry: ${entry.title}`);
        const pdfUrl = entry.link.replace('/abs/', '/pdf/') + '.pdf'; // appending '.pdf' as per arXiv convention
        const pdfContent = await downloadAndConvertPDFToText(pdfUrl);
        await generateAndSendSummary(pdfContent, entry.title, pdfUrl);
        await updateDatabase(entry.link);
        counter++;
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