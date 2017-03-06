const combineRouters = require('koa-combine-routers');

const healthCheckRouter = require('./../health-check/health-check.routes');

const router = combineRouters([
  healthCheckRouter
]);

module.exports = router;
