const config = require('./../../config/config');
const moment = require('moment');

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

    // Todo: Add to the filter to only get items older than SYNC_USER_HISTORY_INTERVAL
    let user = await UsersBL.get({screen_name: opts.screen_name});

    console.log('Rec:howOld: ', UserHistorySyncBl.howOld(user, 'last_sync_ts', 'hours'));
    if (user && UserHistorySyncBl.howOld(user, 'last_sync_ts', 'hours') > UserHistorySyncBl.SYNC_USER_HISTORY_INTERVAL) {
      console.log('Rec is older', user.last_sync_ts);
      // Todo: OK, get rec from twitter
      user = UsersBL.getTwitUser({screen_name: opts.screen_name});
    } else {
      console.log('Rec is fine', user.last_sync_ts);
      // Todo: OK, use this rec to save the history
    }
    let userHistoryModel = UserHistoryBL.twitUserModelToUserHistory(user);
    return UserHistoryBL.upsert(userHistoryModel);
  }

}

module.exports = UserHistorySyncBl;
