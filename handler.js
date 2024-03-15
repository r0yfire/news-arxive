const { processEntries } = require('./src/app');


const scanPapers = async (event, context) => {
    try {
        await processEntries();
        return {
            statusCode: 200,
            body: JSON.stringify('Papers scanned and processed successfully!')
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify('Error scanning papers: ' + error.message)
        };
    }
};

module.exports = { scanPapers };