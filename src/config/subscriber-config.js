const logger = require('winster').instance();
const path = require('path');
const glob = require('glob');

function init() {

  let subscribers = glob.sync(path.join(__dirname, './../modules/**/*.subscriber.js'));
  logger.trace('------ Subscribers');
  subscribers.forEach(s => {
    logger.trace('Registering subscriber', s);
    let subscriber = require(s);
    subscriber.init();
  });
}

module.exports = {
  init
};
