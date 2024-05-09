import {processEntries} from '@/src/app';


export const scanPapers = async (event: any, context: any): Promise<any> => {
    try {
        await processEntries();
        return {
            statusCode: 200,
            body: JSON.stringify('Papers scanned and processed successfully!')
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify('Error scanning papers: ' + error.message)
        };
    }
};
