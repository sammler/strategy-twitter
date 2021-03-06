module.exports = {
  PORT: process.env.PORT || 3000,
  MONGOOSE_CONNECTION: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: process.env.MONGODB_PORT || 27017,
    database: process.env.MONGODB_DATABASE || 'SAMMLER_STRATEGY_TWITTER--DEV'
  },
  RABBITMQ_URI: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
  intervals: {
    // Sync interval in minutes
    SYNC_USER_INTERVAL: process.env.SYNC_USER_INTERVAL || 24,

    // Sync interval in minutes
    SYNC_USER_HISTORY_INTERVAL: process.env.SYNC_USER_HISTORY_INTERVAL || 24
  }
};
