const config = {
  rssFeedUrl: process.env.RSS_FEED_URL,
  emailAddress: process.env.EMAIL_ADDRESS,
  openaiApiKey: process.env.OPENAI_API_KEY,
};

console.log("Configurations loaded.");

module.exports = config;
