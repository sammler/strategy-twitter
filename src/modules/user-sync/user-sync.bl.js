const logger = require('winster').instance();
// const Lib = require('./../../lib');
const UsersBl = require('./../../modules/users/users.bl');
const moment = require('moment');
// eslint-disable-next-line no-unused-vars
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');

class UserSyncBl {

  static get SYNC_USER_INTERVAL() {
    return config.intervals.SYNC_USER_INTERVAL;
  }

  // Todo: Should be move to somewhere else, that's re-usable for many other areas.
  /**
   * Returns how old a record is (expressed in hours).
   *
   * @param {object} model - The mongoose model.
   * @param {string} field - The field to compare
   * @param {string} level - See moment.add, so either 'hours', 'minutes', etc.
   *
   * @returns {number} - Returns how old a record actually is.
   */
  static howOld(model, field, level = 'hours') {
    let now = moment();
    if (model) {
      let comparison = moment(model[field]);
      return now.diff(comparison, level);
    }
    return -1;
  }

  /**
   * Sync a given user.
   *
   * @description
   *
   * 1) Check if the user exists, if not, fetch the user from Twitter and store it.
   * 2)
   *
   * @param {object} opts - Arguments to pass to syncUser.
   * @param {string} opts.screen_name - The Twitter screen name of the user.
   *
   * @returns {Object} result - The result of the sync process.
   */
  // eslint-disable-next-line
  static async syncUser(opts) {

    const logPrefix = `[syncUser:${opts.screen_name}]`;
    let status = null;

    let user = await UsersBl.get({screen_name: opts.screen_name});

    // Only fetch an update of the user if the user's record is older than SYNC_USER_INTERVAL
    if (!user) {

      user = await UserSyncBl._updateUser(opts.screen_name);
      status = 'created';

    } else if (UserSyncBl.howOld(user, 'last_sync_utc_ts', 'hours') >= UserSyncBl.SYNC_USER_INTERVAL) {

      user = await UserSyncBl._updateUser(opts.screen_name);
      status = 'updated';

    } else {
      // logger.verbose(`${logPrefix} We already have a user`);
      status = 'no-action';
    }

    return {
      user,
      status
    };
  }

  static async _updateUser(screen_name) {
    let twitUser = await UsersBl.getTwitUser({screen_name});
    let userObj = UsersBl.twitToModel(twitUser.data);
    return await UsersBl.upsert(userObj);
  }

}

module.exports = UserSyncBl;
