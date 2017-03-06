const combineRouters = require('koa-combine-routers');

const healthCheckRouter = require('./../modules/health-check/health-check.routes');

const router = combineRouters([
  healthCheckRouter
]);

module.exports = router;
