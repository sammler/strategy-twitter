const express = require('express');
const bodyParser = require('body-parser');
const amqpSugar = require('./lib/amqplib-sugar');
const logger = require('winster').instance();
const MongooseConnection = require('mongoose-connection-promise');
const _ = require('lodash');
const routesConfig = require('./config/routes-config');

// Todo: has to be (re)moved ...
const RABBITMQ_URI = process.env.SAMMLER_RABBITMQ_URI || 'amqp://guest:guest@localhost:5672';

const defaultConfig = require('./config/config');

class AppServer {
  constructor(config) {
    this.config = _.defaults(config || {}, defaultConfig);
    this.server = null;
    this.logger = logger;
    // Todo: We should not do that, injecting something here ...
    this.mongooseConnection = new MongooseConnection(this.config.MONGOOSE_CONNECTION || MongooseConnection.DEFAULT_OPTIONS);
    this._initApp();
  }

  _initApp() {
    this.app = express();
    this.app.use(bodyParser.json());

    routesConfig.init(this.app);
  }

  /**
   * Initialize the RabbitMQ subscribers ...
   *
   * If this fails, we'll indefinitely retry to subscribe.
   *
   * @private
   */
  _initSubscribers() {

    const opts = {
      server: this.config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'system'
      },
      key: 'heartbeat'
    };

    amqpSugar.subscribeMessage(opts);
  }

  /**
   * Initializes the Mongoose connection
   * @returns {Promise|Promise.<TResult>}
   */
  _initDB() {
    return this.mongooseConnection.connect()
      .then(connection => this.app.db = connection)
      .catch(err => {
        this.logger.fatal('An error occurred connecting to MongoDB', err);
      })
  }

  start() {
    return new Promise((resolve, reject) => {

      this._initDB()
        .then(() => {
          this.server = this.app.listen(this.config.PORT, err => {
            if (err) {
              this.logger.error('Cannot start express server', err);
              return reject(err);
            }
            this.logger.info(`Express server listening on port ${this.config.PORT} in "${process.env.NODE_ENV}" mode`);
            console.log(`Express server listening on port ${this.config.PORT} in "${process.env.NODE_ENV}" mode`);
            this._initSubscribers();
            return resolve();
          });
        })
        .catch(err => {
          this.logger.fatal('An error happened connecting to MongoDB', err);
          reject(err);
        });
    });
  }

  stop() {
    this.mongooseConnection.disconnect()
      .then(() => {
        if (this.server) {
          this.server.close();
        }
      })
      .catch(err => this.logger.error(err));
  }
}

module.exports = AppServer;