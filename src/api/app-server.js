const Koa = require('koa');
const routes = require('./config/routes-config');
const app = new Koa();

app.use(routes);

app.listen(3000);
