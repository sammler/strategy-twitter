module.exports = {
  // Todo: not being reflected right now !!!
  SERVER: {
    PORT: 3000
  },
  MONGOOSE_CONNECTION: {
    debug: false,
    host: process.env.MONGODB_HOST || 'localhost',
    port: process.env.MONGODB_PORT | 27017,
    database: 'SAMMLER_STRATEGY_GITHUB--TEST',
    connectOptions: {
      db: {},
      server: {
        auto_reconnect: true
      },
      replset: {},
      user: {},
      pass: {},
      auth: {},
      mongos: {}
    }
  }
};
