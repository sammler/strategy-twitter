const Koa = require('koa');
const routes = require('./config/routes-config');
const app = new Koa();

class App {
  constructor() {
    this.app = new Koa();
    this.app.use(routes);
    this.server = null;
  }

  start() {
    this.server = this.app.listen(3000);
  }

  stop() {
    this.server.close();
  }
}

module.exports = App;
