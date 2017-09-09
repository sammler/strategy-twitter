// All configuration options, consolidates
const mongooseConnectionDefault = require('mongoose-connection-promise').DEFAULT_CONFIG;

module.exports = {
  MONGOOSE_CONNECTION: mongooseConnectionDefault,
  SERVER: {
    PORT: 3000
  }
};
