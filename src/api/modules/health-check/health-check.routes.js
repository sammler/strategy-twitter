const Router = require('koa-router');
const pkg = require('./../../../../package.json');

const router = new Router({prefix: '/health-check'});

router.get('/', async(ctx, next) => {
  ctx.body = {
    data: {
      ts: new Date().toJSON(),
      name: pkg.name,
      repository: pkg.repository,
      version: pkg.version
    }
  }
});

module.exports = router;
