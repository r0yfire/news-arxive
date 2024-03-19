# News-Arxive

News-Arxive is an innovative application designed to streamline the process of fetching, summarizing, and emailing new research papers from specified RSS feeds. It operates in a serverless environment, making it both efficient and scalable. Through the use of cutting-edge technologies, News-Arxive automates the summarization of research papers, delivering concise summaries directly to your inbox.

>This app was built using [GPT-Pilot](#gpt-pilot), an AI-powered tool that generates code based on natural language descriptions. The code was then modified and extended to meet the specific requirements of the project.

## Overview

News-Arxive leverages Node.js and various libraries to perform tasks such as parsing XML feeds, handling PDFs, and interacting with APIs (OpenAI's GPT-4 for summarization, AWS S3 for storage). It is structured to run as a command-line interface (CLI) tool within a serverless architecture, notably AWS Lambda. The application is comprised of several key components including RSS Feed Parser, Database Interactor, PDF Downloader and Converter, Summary Generator, and Email Sender, orchestrating the flow from fetching new entries to sending out email summaries.

## Features

- **Automated Fetching:** Automatically fetches new research papers from specified RSS feeds.
- **Intelligent Summarization:** Utilizes OpenAI's GPT-4 API to generate comprehensive summaries of research papers.
- **Email Integration:** Summaries are emailed to a predefined address, keeping users informed with the latest research.
- **Serverless Architecture:** Designed to run in a serverless environment, ensuring scalability and efficiency.

## Getting started

### Requirements

- Node.js installed on your machine.
- An AWS account for accessing AWS S3.
- Access to OpenAI's GPT-4 API.
- An email service setup for sending emails (e.g., AWS SES).

### Deployment

Install packages:

```bash
npm install
```

Create and edit config file for the environment you want to deploy to:

```bash
cp configs/env-config-example.yml configs/prod.yml
```

Deploy to production:

```bash
npx sls deploy --verbose --stage prod
```

Invoke the function (on AWS):

```bash
npx sls invoke --function scanPapers --stage prod
```

View logs:

```bash
npx sls logs --function scanPapers --stage prod
```

### Invoke locally

Execute the following command to invoke the function locally:

```bash
npx sls invoke local -f scanPapers -s prod
```

## GPT-Pilot

The following [GPT-Pilot](https://github.com/Pythagora-io/gpt-pilot) **prompt** was used to generate most of the code in this repository:

>Create an app that will look for new research papers every day, and send me summaries for each via email. This app does not have a web interface, it is executed using the command line. The final app is expected to run in a serverless environment, such as AWS Lambda.
>
>The app, when run, will load an RSS feed from a URL defined as the environment variable `RSS_FEED_URL`. The app will then look to find new entries in the XML-formatted RSS feed by comparing the URL in each entry (e.g. `<link>https://arxiv.org/abs/2403.07916</link>`) with our database. The database is a simple JSON file stored on S3.
>
>For new entries, the app will replace the substring `/abs/` with `/pdf/` in the URL, open the URL to download the binary file (PDF format), convert the PDF to Markdown, create a prompt to summarize the contents (with details and examples), send the summary request to OpenAI’s GPT-4, and email the results to an email address defined as the environment variable `EMAIL_ADDRESS`. The final email for each entry should contain the detailed summary, a link to the original PDF, and the email subject should be the paper title.
>
>The default RSS feed URL is: `https://rss.arxiv.org/rss/cs.ai`.

