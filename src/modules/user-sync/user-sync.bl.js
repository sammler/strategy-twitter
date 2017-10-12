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
   * @returns {*}
   */
  // eslint-disable-next-line
  static async syncUser(opts) {

    const logPrefix = `[syncUser:${opts.screen_name}]`;
    let status = null;
    // logger.verbose('syncUser.args: ', opts);

    let user = await UsersBl.get({screen_name: opts.screen_name});

    // Only fetch an update of the user if the user's record is older than SYNC_USER_INTERVAL
    if (!user ) {

      // logger.verbose(`${logPrefix} OK, we don't have a user, we have to create one ...`);
      let twitUser = await UsersBl.getTwitUser({screen_name: opts.screen_name});
      // Todo(AA): Here we have to handle the case that the rate-limit is exceeded ...
      user = await UsersBl.upsert(twitUser.data);

      status = 'created';
    }
    else if (UserSyncBl.howOld(user, 'last_sync_ts', 'hours') >= UserSyncBl.SYNC_USER_INTERVAL) {


      let twitUser = await UsersBl.getTwitUser({screen_name: opts.screen_name});
      // Todo(AA): Here we have to handle the case that the rate-limit is exceeded ...
      user = await UsersBl.upsert(twitUser.data);

      logger.verbose('updated user', user);

      status = 'updated';

    } else {
      // logger.verbose(`${logPrefix} We already have a user`);
      status = 'no-action';
    }

    return {
      user,
      status
    }
  }

}

module.exports = UserSyncBl;
