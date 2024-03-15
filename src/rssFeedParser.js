const axios = require('axios');
const xml2js = require('xml2js');
const { rssFeedUrl } = require('./config');

/**
 * Fetches XML data from the RSS feed URL and converts it to JavaScript objects.
 * Extracts and returns an array of entries with their titles and links.
 */
async function fetchAndParseRSS() {
  try {
    console.log('Fetching RSS feed from URL:', rssFeedUrl);
    // Fetch the RSS feed XML data
    const response = await axios.get(rssFeedUrl);
    const xmlData = response.data;

    console.log('Converting XML data to JavaScript object');
    // Convert XML data to JS object
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    // Extract entries (checking if the feed and its entry exist and are in expected format)
    const entries = result?.rss?.channel?.item || [];
    console.log(`Found ${entries.length} entries in the RSS feed`);

    // Map entries to an array of objects containing title and link
    const formattedEntries = entries.map(entry => ({
      title: entry.title,
      link: entry.link,
    }));

    // Slice to a maximum of 10 entries
    const filteredEntries = formattedEntries.slice(0, 10);

    return filteredEntries;
  } catch (error) {
    console.error('Failed to fetch or parse RSS feed:', error.message, error.stack);
    throw error; // Rethrow to allow caller handling
  }
}

module.exports = { fetchAndParseRSS };