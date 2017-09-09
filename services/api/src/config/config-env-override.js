// All config options which can be set/overruled by environment variables

const defaultConfig = require('./config-default');

module.exports = {
  MONGOOSE_CONNECTION: {
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    database: process.env.MONGODB_DATABASE
  },
  SERVER: {
    PORT: process.env.port || defaultConfig.PORT
  }
};
