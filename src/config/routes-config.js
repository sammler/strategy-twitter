const logger = require('winster').instance();
const path = require('path');
const glob = require('glob');

// Load routes based on the pattern './../modules/**/*.routes.js
function init(app) {

  let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
  routes.forEach(r => {
    logger.trace('------ Routes');
    logger.trace('Registering route', r);
    let route = require(r);
    app.use('/', route);
  });
}

module.exports = {
  init
};
