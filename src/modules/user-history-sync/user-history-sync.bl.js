const config = require('./../../config/config');
const moment = require('moment');
const logger = require('winster').instance();
const Lib = require('./../../lib/');
const _ = require('lodash');

const UsersBl = require('./../users/users.bl');
const UserHistoryBl = require('./../user-history/user-history.bl');

class UserHistorySyncBl {

  static get SYNC_USER_HISTORY_INTERVAL() {
    return config.intervals.SYNC_USER_HISTORY_INTERVAL;
  }

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
   * @typedef UserHistorySyncResult
   * @parameter {MongooseDocument} user_history
   * @parameter {string} status - Status of the sync operation, can be `user_existing_rec` (use the date from the existing
   * user record), `fetch` (fetch updates from Twitter)
   */

  /**
   * Sync the user's history (per day).
   *
   * @description
   *
   * 1) See if there is a record not older than SYNC_USER_HISTORY_INTERVAL
   *  a) If so, take this
   *  b) Else, proceed
   * 2) Get the user from Twitter
   *  a) Save the user to the User table
   *  b) Fetch the history
   *
   * @param {Object} opts - Options to pass in
   * @param {String} opts.screen_name - The user's Twitter name.
   * @return {Promise.<UserHistorySyncResult>}
   */
  static async syncUserHistory(opts) {

    let status = null;

    logger.trace('[syncHistoryUser] Sync interval', UserHistorySyncBl.SYNC_USER_HISTORY_INTERVAL);

    let user = await UsersBl.get({screen_name: opts.screen_name});

    // logger.verbose('User existing', existingUser ? existingUser._doc : '<no-user>');
    // logger.verbose('[syncHistoryUser] Rec:howOld: ', UserHistorySyncBl.howOld(existingUser, 'last_sync_utc_ts', 'hours'));

    if (user === null || UserHistorySyncBl.howOld(user, 'last_sync_utc_ts', 'hours') > UserHistorySyncBl.SYNC_USER_HISTORY_INTERVAL) {

      status = 'fetch';
      // logger.verbose('[syncHistoryUser] Rec is older or no user', existingUser ? existingUser.last_sync_utc_ts : '<no-user>');
      user = await UserHistorySyncBl._fetchUser(opts);

      // Update the user, too, otherwise we'll always fetch the newest user
      // logger.verbose('[syncHistoryUser] Updating user');
      user.last_sync_utc_ts = Lib.nowUtc();
      await UsersBl.upsert(user);

    } else {
      // OK, use this rec to save the history, so basically skip and proceed.
      status = 'use_existing_rec';
      logger.verbose('[syncHistoryUser] Rec is fine', user.last_sync_utc_ts);
    }

    let userHistoryModel = UserHistoryBl.twitUserModelToUserHistory(user);
    let user_history = await UserHistoryBl.upsert(userHistoryModel);

    return {
      status,
      user_history
    }
  }

  static async _fetchUser(opts) {
    let twitUser = await UsersBl.getTwitUser({screen_name: opts.screen_name});
    return UsersBl.twitToModel(twitUser.data);
  }

}

module.exports = UserHistorySyncBl;
