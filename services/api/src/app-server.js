const express = require('express');
const bodyParser = require('body-parser');
const logger = require('winster').instance();
const MongooseConnection = require('mongoose-connection-promise');
const _ = require('lodash');
const routesConfig = require('./config/routes-config');
const configDefault = require('./config/config-default');

class AppServer {
  constructor(config) {
    // console.log('config:before', config);
    this.config = _.defaults(config, configDefault);
    // console.log('config:after', this.config);
    this.server = null;
    this.logger = logger;
    this.mongooseConnection = new MongooseConnection(this.config.MONGOOSE_CONNECTION || MongooseConnection.DEFAULT_OPTIONS);
    this._initApp();
  }

  _initApp() {
    this.app = express();
    this.app.use(bodyParser.json());

    routesConfig.init(this.app);
  }

  start() {
    return new Promise((resolve, reject) => {

      this.mongooseConnection.connect()
        .then(connection => {
          this.app.db = connection;
          this.server = this.app.listen(this.config.PORT, err => {
            if (err) {
              this.logger.error('Cannot start express server', err);
              return reject(err);
            }
            this.logger.info(`Express server listening on port ${this.config.PORT} in "${process.env.NODE_ENV}" mode`);
            return resolve();
          });
        })
        .catch(err => reject(err));
    });
  }

  stop() {
    this.mongooseConnection.disconnect()
      .then(() => {
        this.server.close();
      })
      .catch(err => this.logger.error(err));
  }
}

module.exports = AppServer;
