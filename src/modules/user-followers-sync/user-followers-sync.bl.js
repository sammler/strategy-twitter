
const UsersBl = require('./../users/users.bl');
const logger = require('winster').instance();

class UserFollowersSyncBl {

  /**
   * @typedef {Object} TwitterFollowersResult
   * @param {Object} data
   * @param {Object} resp
   */

  /**
   * Fetch the followers ...
   *
   * @param opts
   * @param opts.screen_name - The Twitter screen_name.
   * @param opts.[user_id] - The Twitter User Id to get the followers for. If not provided, this will be resolved by the given `screen_name`.
   * @param opts.count - The Twitter count option.
   *
   * @returns {Promise.<TwitterFollwersResult>}
   */
  static async syncUserFollowers(opts, config) {

    // If we don't have a twitter_id, let's fetch it
    if (!opts.user_id) {
      logger.verbose('Fetching the user_id for ', opts.screen_name);
      opts.user_id = await UsersBl.getTwitterId(opts.screen_name);
    }
    return await UsersBl.getTwitFollowersIds(opts, config);
  }
}

module.exports = UserFollowersSyncBl;
