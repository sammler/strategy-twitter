const Twit = require('twit');

const defaultTwitterConfig = require('./../../config/twitter-config');
const Lib = require('./../../lib');

class RateLimitStatus {

  /**
   * @typedef {Object} rate_limit
   *
   * @property {Object} rate_limit_context
   * @property {String} rate_limit_context.access_token
   *
   * @property {Object} resources
   * @property
   *
   */

  /**
   * Get the status of Twitters rate-limit
   *
   * @see https://dev.twitter.com/rest/reference/get/application/rate_limit_status
   *
   * @param twitQuery
   * @param twitConfig
   *
   * @returns Promise<rate_limit>
   */
  static getTwitRateLimitStatus(twitQuery = {}, twitConfig) {

    let c = twitConfig || defaultTwitterConfig;
    let twit = new Twit(c);

    return twit.get('application/rate_limit_status', twitQuery)
      .then(res => {
        let r = {
          rate_limit_context: res.data.rate_limit_context,
          resources: res.data.resources,
          rate_limit: {
            'x-rate-limit-limit': res.resp.headers['x-rate-limit-limit'],
            'x-rate-limit-remaining': res.resp.headers['x-rate-limit-remaining'],
            'x-rate-limit-reset': res.resp.headers['x-rate-limit-reset'],
            limitResetUtc: Lib.posixTimeToUtc(res.resp.headers['x-rate-limit-reset'])
          }
        };
        return Promise.resolve(r);
      });
  }

}

module.exports = RateLimitStatus;
