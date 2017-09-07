const mongoose = require('mongoose');
const bluebird = require('bluebird');
const logger = require('winster').instance();


let instance;
class Context {
  constructor() {
    this.db = null;
    this.logger = logger;

    if (!this.db) {
      this.dbConnect();
    }
  }

  static instance() {
    if (!instance) {
      instance = new Context();
    }
    return instance;
  }

  dbConnect() {
    const dbUri = process.env.SAMMLER_DB_URI_TWITTER || 'mongodb://localhost:27017';
    this.logger.trace('SAMMLER_STRATEGY_TWITTER => DB URI', dbUri);
    const options = {
      useMongoClient: true
    };
    mongoose.Promise = bluebird;

    mongoose.connection.on('connected', () => {
      logger.trace('Mongoose default connection open to ' + dbUri);
    });

    // If the connection throws an error
    mongoose.connection.on('error', err => {
      logger.error('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      logger.trace('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        logger.trace('Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });

    this.db = mongoose.connect(dbUri, options);
  }

  dbDisconnect() {
    if (this.db) {
      // eslint-disable-next-line capitalized-comments
      // this.db.disconnect();
      mongoose.disconnect();
    }
  }
}

module.exports = Context;
