
// Todo: leaving this in a separate file, as we anyhow have to remove this ... I guess.
module.exports = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY || process.env.S5R_STRATEGY_TWITTER__CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || process.env.S5R_STRATEGY_TWITTER__CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN || process.env.S5R_STRATEGY_TWITTER__ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || process.env.S5R_STRATEGY_TWITTER__ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  app_only_auth: false
};
