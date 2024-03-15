const AWS = require('aws-sdk');
const {S3} = AWS;
const s3 = new S3();

const BUCKET_NAME = 'autohost-data-science';
const DATABASE_FILE = 'news-arxiv/database.json';

/**
 * Checks if an entry URL exists in the JSON database stored in S3.
 * @param {string} entryUrl The URL of the entry to check.
 * @returns {Promise<boolean>} Promise that resolves to true if exists, false otherwise.
 */
async function checkEntryExists(entryUrl) {
    await initializeDatabase();
    try {
        const data = await s3.getObject({Bucket: BUCKET_NAME, Key: DATABASE_FILE}).promise();
        const database = JSON.parse(data.Body.toString());
        const exists = database.urls.includes(entryUrl);
        console.log(`Check if entry exists: ${entryUrl}, Result: ${exists}`);
        return exists;
    } catch (error) {
        console.error('Error fetching database from S3:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

/**
 * Updates the database in S3 with a new entry URL.
 * @param {string} entryUrl The URL of the new entry to add.
 * @returns {Promise<void>}
 */
async function updateDatabase(entryUrl) {
    try {
        let database = {urls: []};
        try {
            const data = await s3.getObject({Bucket: BUCKET_NAME, Key: DATABASE_FILE}).promise();
            database = JSON.parse(data.Body.toString());
        } catch (error) {
            if (error.code !== 'NoSuchKey') {
                throw error;
            }
            console.log('Database file does not exist, creating a new one.');
        }

        database.urls.push(entryUrl);

        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: DATABASE_FILE,
            Body: JSON.stringify(database),
            ContentType: 'application/json'
        }).promise();

        console.log(`Database updated successfully with new entry URL: ${entryUrl}`);
    } catch (error) {
        console.error('Error updating database in S3:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

/**
 * Initialize empty database in S3 if it does not exist.
 * @returns {Promise<void>}
 *
 */
async function initializeDatabase() {
    try {
        await s3.headObject({Bucket: BUCKET_NAME, Key: DATABASE_FILE}).promise();
        console.log('Database already exists, skipping initialization.');
    } catch (error) {
        if (error.code !== 'NotFound') {
            throw error;
        }
        console.log('Database does not exist, initializing with empty file.');
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: DATABASE_FILE,
            Body: JSON.stringify({urls: []}),
            ContentType: 'application/json'
        }).promise();
    }
}

module.exports = {checkEntryExists, updateDatabase, initializeDatabase};
