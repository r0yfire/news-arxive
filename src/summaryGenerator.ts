import {ChatVertexAI} from '@langchain/google-vertexai';
import {HarmBlockThreshold, HarmCategory} from '@google/generative-ai';
import {ChatAnthropic} from '@langchain/anthropic';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {sendEmail} from '@/src/emailSender';
import {countTokens} from '@/src/tiktoken';
import {Marked, Renderer} from '@ts-stack/markdown';

Marked.setOptions({
    renderer: new Renderer,
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
});


/**
 * Generates a summary for the given Markdown content using an LLM.
 * @param {string} markdownContent The Markdown content to summarize.
 * @returns {Promise<string>} The generated summary.
 */
async function generateSummary(markdownContent: string): Promise<string> {
    try {
        console.log("Generating summary for provided Markdown content.");

        // Determine the LLM to use based on the token count
        const tokens = countTokens(markdownContent);
        const llm = (tokens < 190000) ?
            new ChatAnthropic({model: 'claude-3-opus-20240229', maxTokens: 4000, temperature: 0.2}) :
            new ChatVertexAI({
                model: 'gemini-1.5-pro-preview-0409',
                maxOutputTokens: 4000,
                temperature: 0.2,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    },
                ],
            });

        // Create the system prompt
        const systemPrompt = 'You are an expert researcher in AI and have been asked to summarize a research paper. Make sure you capture the key ideas, experiments, and findings from the paper in a way that is easy to understand for people outside the field. Avoid using academic jargon and keep the summary concise. Assume the reader has a basic understanding of AI concepts.\n' +
            '\n' +
            'Include the following sections in your response:\n' +
            '\n' +
            '1. **Summary**: Summarize the key ideas, experiments, and findings of the paper.\n' +
            '2. **Opinion**: Provide your opinion on the paper.\n' +
            '3. **Applicability to Autohost (if any)**: Provide a short analysis of whether the research has strong potential benefits for Autohost, a company that provides identity verification and fraud detection solutions using AI. Some example projects Autohost is interested in include:\n' +
            '   - Using large language models (LLMs) to review fraud telemetry with user-submitted information to find inconsistencies.\n' +
            '   - Using AI to generate synthetic data for training models (e.g., realistic passport photos).\n' +
            '   - Using graph neural networks (GNNs) to detect patterns of fraud in online user behavior and relationships between data points.\n' +
            '   - Using AI agents to perform advanced fraud investigations.\n' +
            '   - Using artificial general intelligence (AGI) to find novel ways to detect fraud and verify identities.\n' +
            '\n' +
            'Focus the analysis on areas where the research could strongly benefit these specific projects. ' +
            'If there is no applicability to Autohost, state that clearly.';

        // Create the prompt
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemPrompt],
            ["user", `Please summarize the following research paper in Markdown format (no pre-amble):\n\n{markdownContent}`]
        ]);

        // Create the chain
        const chain = prompt.pipe(llm);

        // Invoke the chain
        const response = await chain.invoke({
            markdownContent: markdownContent
        });

        console.log("Summary generation successful.");
        return response.content as string;
    } catch (error: any) {
        console.error('Error generating summary with LLM:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

/**
 * Generates a summary and sends an email with the summary.
 * @param {string} markdownContent The Markdown content to summarize.
 * @param {string} subject The subject of the email, typically the paper title.
 * @param {string} pdfLink The direct link to the PDF of the paper.
 * @returns {Promise<void>} Nothing.
 */
async function generateAndSendSummary(markdownContent: string, subject: string, pdfLink: string): Promise<void> {
    try {

        const markdownSummary = await generateSummary(markdownContent);
        console.log(`Converting the Markdown summary to HTML for email: ${subject}`);
        const summary = Marked.parse(markdownSummary);
        console.log(`Sending email with summary for paper: ${subject}`);
        await sendEmail(subject, summary, pdfLink);
        console.log('Email sent successfully.');
    } catch (error: any) {
        console.error('Error in generating or sending summary:', error.message, error.stack);
        throw error; // Rethrow to allow caller handling
    }
}

export {generateSummary, generateAndSendSummary};