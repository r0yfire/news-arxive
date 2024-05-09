import {S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";

const s3 = new S3Client({});

const BUCKET_NAME = 'autohost-data-science';
const DATABASE_FILE = 'news-arxiv/database.json';

interface Database {
    urls: string[];
}

async function checkEntryExists(entryUrl: string): Promise<boolean> {
    await initializeDatabase();
    try {
        const data = await s3.send(new GetObjectCommand({Bucket: BUCKET_NAME, Key: DATABASE_FILE}));
        if (!data.Body) {
            throw new Error('Empty database file');
        }
        const jsonStr = await data.Body.transformToString();
        const database: Database = JSON.parse(jsonStr);
        const exists = database.urls.includes(entryUrl);
        console.log(`Check if entry exists: ${entryUrl}, Result: ${exists}`);
        return exists;
    } catch (error: any) {
        console.error('Error fetching database from S3:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

async function updateDatabase(entryUrl: string): Promise<void> {
    try {
        let database: Database = {urls: []};
        try {
            const data = await s3.send(new GetObjectCommand({Bucket: BUCKET_NAME, Key: DATABASE_FILE}));
            if (data.Body) {
                const jsonStr = await data.Body.transformToString();
                database = JSON.parse(jsonStr);
            }
        } catch (error: any) {
            if (error.name !== 'NoSuchKey') {
                throw error;
            }
            console.log('Database file does not exist, creating a new one.');
        }

        database.urls.push(entryUrl);

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: DATABASE_FILE,
            Body: JSON.stringify(database),
            ContentType: 'application/json'
        }));

        console.log(`Database updated successfully with new entry URL: ${entryUrl}`);
    } catch (error: any) {
        console.error('Error updating database in S3:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

async function initializeDatabase(): Promise<void> {
    try {
        await s3.send(new HeadObjectCommand({Bucket: BUCKET_NAME, Key: DATABASE_FILE}));
        console.log('Database already exists, skipping initialization.');
    } catch (error: any) {
        if (error.name !== 'NotFound') {
            throw error;
        }
        console.log('Database does not exist, initializing with empty file.');
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: DATABASE_FILE,
            Body: JSON.stringify({urls: []}),
            ContentType: 'application/json'
        }));
    }
}

export {checkEntryExists, updateDatabase, initializeDatabase};