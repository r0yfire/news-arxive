import {fetchAndParseRSS} from './rssFeedParser';
import {checkEntryExists, updateDatabase} from './databaseInteractor';
import {downloadAndConvertPDFToText} from './pdfConverter';
import {generateAndSendSummary} from './summaryGenerator';
import type {Entry} from './rssFeedParser';

const MAX_ENTRIES = 6;

async function processEntries(): Promise<void> {
    let counter = 0;
    try {
        console.log('Starting to process entries from RSS feed...');

        // Fetch and parse RSS feed
        const entries = await fetchAndParseRSS();

        // Create unique entries by link
        const entriesMap: { [key: string]: Entry } = entries.reduce((acc: any, entry: any) => {
            acc[entry.link] = entry;
            return acc;
        }, {});
        const uniqueEntries = Object.values(entriesMap);

        // Process each unique entry
        for (const entry of uniqueEntries) {
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
                let pdfContent = '';
                try {
                    pdfContent = await downloadAndConvertPDFToText(pdfUrl);
                } catch (error: any) {
                    console.error(`Error processing PDF content for entry: ${entry.title}`, error.message, error.stack);
                    continue;
                }
                await generateAndSendSummary(pdfContent, entry.title, pdfUrl);
                await updateDatabase(entry.link);
                counter++;
            } else {
                console.log(`Entry already processed: ${entry.title}`);
            }
        }
        console.log('Finished processing entries.');
    } catch (error: any) {
        console.error('Error processing entries:', error.message, error.stack);
    }
}

export {processEntries};