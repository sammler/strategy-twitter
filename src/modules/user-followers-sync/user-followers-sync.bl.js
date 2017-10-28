const UsersBl = require('./../users/users.bl');
const logger = require('winster').instance();
// const twitLib = require('./../../lib/twit-lib');
const _ = require('lodash');

class UserFollowersSyncBl {

  /**
   * @typedef {Object} TwitterFollowersResult
   * @param {String} status - Status of the operation, can be any of "error-rate-limit-hit", "next-cursor", "finished"
   * @param {Object} result
   * @param {Object} errors
   * @param {Object} opts - The passed in options.
   * @param {Object} twitConfig - The passed in twitConfig.
   */

  /**
   * Fetch the followers from Twitter.
   *
   * @param opts
   * @param opts.screen_name - The Twitter screen_name.
   * @param opts.[user_id] - The Twitter User Id to get the followers for. If not provided, this will be resolved by the given `screen_name`.
   * @param opts.count - The Twitter count option.
   *
   * @param {Object} [twitConfig] - The twitter configuration.
   *
   * @returns {Promise.<TwitterFollowersResult>}
   */
  static async syncUserFollowers(opts, twitConfig) {

    let result = {
      status: 'unknown'
    };

    // If we don't have a twitter_id, let's fetch it
    opts = await UserFollowersSyncBl.ensureUserId(opts);

    let followers = await UsersBl.getTwitFollowersIds(opts, twitConfig); // eslint-disable-line no-unused-vars

    // Todo: Upsert the users

    // UserFollowersSyncBl.handleRateLimit(followers);

    return result;
  }

  /**
   * If we don't have a property user_id, let's either fetch it from the existing user in the DB or let's fetch it from Twitter.
   *
   * @param opts
   * @param opts.screen_name
   * @param [opts.user_id]
   *
   * @returns {Object} opts
   */
  static async ensureUserId(opts) {
    if (!opts.user_id) {
      logger.verbose('Fetching the user_id for ', opts.screen_name);

      // Todo: Here we could already have hit the rate-limit
      opts.user_id = await UsersBl.getTwitterId(opts.screen_name);
    }
    return opts;
  }
}

module.exports = UserFollowersSyncBl;
