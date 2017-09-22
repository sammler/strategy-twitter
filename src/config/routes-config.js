const express = require('express');

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

  app.use('/', router);
}

module.exports = {
  init
};
