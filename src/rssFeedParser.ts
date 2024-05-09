import axios from 'axios';
import {parseStringPromise, ParserOptions} from 'xml2js';
import {config} from '@/src/config';

const rssFeedUrl = config.rssFeedUrl;

export interface Entry {
    title: string;
    link: string;
}

/**
 * Fetches XML data from the RSS feed URL and converts it to JavaScript objects.
 * Extracts and returns an array of entries with their titles and links.
 */
async function fetchAndParseRSS(): Promise<Entry[]> {
    if (!rssFeedUrl) {
        throw new Error('RSS feed URL is not configured');
    }
    try {
        console.log('Fetching RSS feed from URL:', rssFeedUrl);
        // Fetch the RSS feed XML data
        const response = await axios.get(rssFeedUrl);
        const xmlData = response.data;

        console.log('Converting XML data to JavaScript object');
        // Convert XML data to JS object
        const parserOptions: ParserOptions = {explicitArray: false};
        const result = await parseStringPromise(xmlData, parserOptions);

        // Extract entries (checking if the feed and its entry exist and are in expected format)
        const entries = result?.rss?.channel?.item || [];
        console.log(`Found ${entries.length} entries in the RSS feed`);

        // Map entries to an array of objects containing title and link
        const formattedEntries: Entry[] = entries.map((entry: any) => ({
            title: entry.title,
            link: entry.link,
        }));

        return formattedEntries;
    } catch (error: any) {
        console.error('Failed to fetch or parse RSS feed:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

export {fetchAndParseRSS};