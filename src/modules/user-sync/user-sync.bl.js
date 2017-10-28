const UsersBl = require('./../../modules/users/users.bl');
const moment = require('moment');
const config = require('./../../config/config');
const _ = require('lodash');

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
   * @typedef {Object} SyncUserResult
   * @property {String} status - The status of the sync operation, can be 'created', 'updated', 'no-action' or 'rate-limit-hit'.
   * @property {Object} data - The result object.
   * @property {Object} data.user - The user object (after upserting to the database).
   * @property {Object} data.twit-response - The Twitter response.
   */

  /**
   * Sync a given user.
   *
   * 1) Check if the user exists, if not, fetch the user from Twitter and store it. Will then return `status: 'created'`.
   * 2) If a user exists and wasn't updated within the last 24 hours (`SYNC_USER_INTERVAL`), then the user will be updated. Will then return `status: 'updated'`
   * 3) If a user exists and was updated within the last 24 hours (`SYNC_USER_INTERVAL`), then `status: 'no-action'` will be returned.
   *
   * @param {object} opts - Arguments to pass to syncUser.
   * @param {string} opts.screen_name - The Twitter screen name of the user.
   *
   * @returns {SyncUserResult} result - The result of the sync process.
   */
  // eslint-disable-next-line
  static async syncUser(opts) {

    let status = 'no-action';
    let errors = null;
    let user = await UsersBl.get({screen_name: opts.screen_name});

    if (!user) {
      status = 'created';
      // Only fetch an update of the user if the user's record is older than SYNC_USER_INTERVAL
    } else if (UserSyncBl.howOld(user, 'last_sync_utc_ts', 'hours') >= UserSyncBl.SYNC_USER_INTERVAL) {
      status = 'updated';
    }

    if (['created', 'updated'].indexOf(status) > -1) {
      try {
        user = await UserSyncBl._twitUpdateUser(opts.screen_name);
      } catch (ex) {
        status = 'error';
        errors = ex.data.errors;
        if (_.find(ex.data.errors, {code: 88})) {
          status = 'error-rate-limit-hit';
        }
      }
    }

    return {
      errors,
      user,
      status
    };
  }

  /**
   * Fetch the user from Twitter, convert to the model and upsert to the DB.
   *
   * @param {string} screen_name - Twitter's screen_name.
   * @returns {Promise.<*|ErrorObject>}
   *
   * @private
   */
  static async _twitUpdateUser(screen_name) {
    let twitUserResult = await UsersBl.getTwitUser({screen_name});

    // Here we have to check, whether the rate limit has been hit
    if (twitUserResult.data.errors) {
      throw twitUserResult.data.errors;
    }

    let userObj = UsersBl.twitToModel(twitUserResult.data);
    return await UsersBl.upsert(userObj);
  }

}

module.exports = UserSyncBl;
