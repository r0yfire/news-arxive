export const config: { rssFeedUrl: string | undefined, emailAddress: string | undefined, openaiApiKey?: string } = {
    rssFeedUrl: process.env.RSS_FEED_URL,
    emailAddress: process.env.EMAIL_ADDRESS,
    openaiApiKey: process.env.OPENAI_API_KEY,
};

