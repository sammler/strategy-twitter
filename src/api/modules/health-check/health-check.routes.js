const Router = require('koa-router');
const pkg = require('./../../../../package.json');

const router = new Router({prefix: '/health-check'});

/**
 * @swagger
 * /health-check:
 *   get:
 *     description: Get the service' status.
 *     produces:
 *       - application/json
 *     tags:
 *       - health-check
 *     responses:
 *       200:
 *         description: Returned health-check status.
 *         parameters:
 *           ts:
 *             type: Date
 *           name:
 *             type: String
 *           repository:
 *             type: String
 *           version:
 *             type: String
 *             description: "The name of the service: auth-service"
 */
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
