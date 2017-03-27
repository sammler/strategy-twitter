const Koa = require('koa');
const routes = require('./config/routes-config');

class App {
  constructor( config ) {
    this.config = config;
    this.app = new Koa();
    this.app.use(routes);
    this.server = null;
  }

  start() {
    this.server = this.app.listen(this.config.PORT);
  }

  stop() {
    this.server.close();
  }
}

module.exports = App;
