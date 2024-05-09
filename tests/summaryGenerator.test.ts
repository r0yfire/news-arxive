import {generateSummary, generateAndSendSummary} from '@/src/summaryGenerator';

describe('Summary Generator', () => {
    test('generateSummary function', async () => {
        const markdownContent = "This is a test Markdown content to summarize.";
        const summary = await generateSummary(markdownContent);
        expect(summary).toBeDefined();
        // Add more assertions based on your expected output
    });

    // test('generateAndSendSummary function', async () => {
    //     const markdownContent = "This is a test Markdown content to summarize.";
    //     const subject = "Test Paper Title";
    //     const pdfLink = "https://arxiv.org/pdf/2403.07916";
    //     await generateAndSendSummary(markdownContent, subject, pdfLink);
    //     // This function does not return anything, so you might need to mock the sendEmail function to test it properly
    // });
});