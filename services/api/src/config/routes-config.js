const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const findPkg = require('find-pkg');
const pkg = findPkg.sync(findPkg.sync('.'));

// Todo: If we continue to follow the pattern, we could start doing this automatically.
const healthCheckRoutes = require('./../modules/health-check/health-check.routes');
const followerRoutes = require('./../modules/followers/followers.routes');
const usersRoutes = require('./../modules/users/users.routes');

function init(app) {
  const router = express.Router(); // eslint-disable-line new-cap

  // /health-check
  app.use('/', healthCheckRoutes);

  app.use('/', followerRoutes);

  app.use('/', usersRoutes);

  // /api-docs
  // const swaggerDoc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './api-docs.yml'), 'utf8'));
  // swaggerDoc.info.version = pkg.version;
  // app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.use('/', router);
}

module.exports = {
  init
};
