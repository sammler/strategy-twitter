const express = require('express');
const bodyParser = require('body-parser');
const routesConfig = require('./config/routes-config');
const context = require('./config/context');
const logger = require('winster').instance();

class AppServer {
  constructor(config) {
    this.config = config;
    this.server = null;
    this.logger = logger;
    this.context = context.instance();
    this._initApp();
  }

  _initApp() {
    this.app = express();
    this.app.use(bodyParser.json());

    routesConfig.init(this.app);
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.PORT, err => {
        if (err) {
          this.logger.error('Cannot start express server', err);
          return reject(err);
        }
        this.logger.info(`Express server listening on port ${this.config.PORT} in "${process.env.NODE_ENV}" mode`);
        return resolve();
      });
    });
  }

  stop() {
    this.server.close();
  }
}

module.exports = AppServer;
