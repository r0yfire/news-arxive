const OpenAI = require('openai');
const { openaiApiKey } = require("./config");
const { sendEmail } = require('./emailSender');
const MarkdownIt = require('markdown-it');
const md = MarkdownIt();

const openai = new OpenAI({
    apiKey: openaiApiKey
});

/**
 * Generates a summary for the given Markdown content using OpenAI's GPT-4 API.
 * @param {string} markdownContent The Markdown content to summarize.
 * @returns {Promise<string>} The generated summary.
 */
async function generateSummary(markdownContent) {
  try {
    console.log("Generating summary for provided Markdown content.");
    const messages = [{
      role: 'system',
      content: 'You are a highly intelligent AI capable of summarizing research papers.'
    }, {
      role: 'user',
      content: `Summarize the following research paper in Markdown format:\n\n${markdownContent}`
    }];

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
    });

    console.log("Summary generation successful.");
    return response.choices[0]?.message?.content.trim();
  } catch (error) {
    console.error('Error generating summary with OpenAI GPT-4:', error.message, error.stack);
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
async function generateAndSendSummary(markdownContent, subject, pdfLink) {
  try {
    const markdownSummary = await generateSummary(markdownContent);
    console.log(`Converting the Markdown summary to HTML for email: ${subject}`);
    const summary = md.render(markdownSummary);
    console.log(`Sending email with summary for paper: ${subject}`);
    await sendEmail(subject, summary, pdfLink);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error in generating or sending summary:', error.message, error.stack);
    throw error; // Rethrow to allow caller handling
  }
}

if (require.main === module) {
  const testMarkdownContent = "This is a test Markdown content to summarize.";
  const testSubject = "Test Paper Title"; // Provide the actual paper title
  const testPdfLink = "https://arxiv.org/pdf/2403.07916"; // Provide the actual PDF link
  generateAndSendSummary(testMarkdownContent, testSubject, testPdfLink)
    .then(() => console.log("Summary generated and email sent."))
    .catch(error => console.error('Error in generating summary or sending email:', error.message, error.stack));
}

module.exports = { generateSummary, generateAndSendSummary };