const _ = require('lodash');

class TwitLib {

  static handleRateLimit(result) {
    if (result.errors) {
      if (_.find(result.data.errors, {code: 88})) {
        throw new Error({message: 'Rate limit exceeded', code: 88});
      } else {
        throw new Error(result.data.errors);
      }
    }
  }
}

module.exports = TwitLib;
