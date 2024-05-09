import nodemailer from 'nodemailer';
import {config} from './config';

const emailAddress = config.emailAddress;


/**
 * Sends an email with the provided subject, summary content, and original PDF link.
 * @param {string} subject The subject of the email (paper title).
 * @param {string} summaryContent The generated summary content.
 * @param {string} pdfLink The link to the original PDF.
 */
async function sendEmail(subject: string, summaryContent: string, pdfLink: string): Promise<void> {
    try {
        console.log(`Preparing to send email: ${subject}`);
        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // Use the SMTP password from the .env file
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: emailAddress, // Recipient address, for demonstration purposes it's the same as sender
            subject: subject, // Subject line
            html: `<div>${summaryContent}</div><div><p><b>Original Paper Link</b>:<br/><a href="${pdfLink}">${pdfLink}</a></p></div>`, // HTML body
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error: any) {
        console.error('Failed to send email:', error.message, error.stack);
    }
}

export {sendEmail};