const config = require('./../../config/config');
const moment = require('moment');
const logger = require('winster').instance();
const Lib = require('./../../lib/');
const _ = require('lodash');

const UsersBL = require('./../users/users.bl');
const UserHistoryBL = require('./../user-history/user-history.bl');

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
   *
   *
   * @param {Object} opts - Options to pass in
   * @param {String} opts.screen_name - The user's Twitter name.
   */
  static async syncUserHistory(opts) {

    logger.verbose('[syncHistoryUser] Sync interval', UserHistorySyncBl.SYNC_USER_HISTORY_INTERVAL);
    // Todo: Add to the filter to only get items older than SYNC_USER_HISTORY_INTERVAL
    let user = await UsersBL.get({screen_name: opts.screen_name});
    logger.verbose('[syncHistoryUser] Rec:howOld: ', UserHistorySyncBl.howOld(user, 'last_sync_ts', 'hours'));
    if (user === null || UserHistorySyncBl.howOld(user, 'last_sync_ts', 'hours') > UserHistorySyncBl.SYNC_USER_HISTORY_INTERVAL) {
      logger.verbose('[syncHistoryUser] Rec is older or no user', user ? user.last_sync_ts : '<no-user>');
      let twitUser = await UsersBL.getTwitUser({screen_name: opts.screen_name});
      user = UsersBL.twitToModel(twitUser.data);

      // Update the user, too, otherwise we'll always fetch the newest user
      logger.verbose('[syncHistoryUser] Updating user');
      user.last_sync_ts = Lib.nowUtc();
      await UsersBL.upsert(user, false);

    } else {
      // OK, use this rec to save the history, so basically skip and proceed.
      logger.verbose('[syncHistoryUser] Rec is fine', user.last_sync_ts);
    }
    let userHistoryModel = UserHistoryBL.twitUserModelToUserHistory(user);
    return UserHistoryBL.upsert(userHistoryModel);
  }
}

module.exports = UserHistorySyncBl;
