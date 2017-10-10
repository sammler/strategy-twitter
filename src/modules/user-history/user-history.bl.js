
const UserHistoryModel = require('./user-history.model').Model;
const Lib = require('./../../lib/');
const logger = require('winster').instance();

class UserHistoryBL {

  /**
   * Update or Insert a new user-history item.
   *
   * @param {Object} item - The user-history object to store.
   * @param {Number} item.twitter_id - The twitter id.
   * @param {Date} item.date
   * @param {Number} item.friends_count
   * @param {Number} item.statuses_count
   * @param {Number} item.listed_count
   * @param {Number} item.followers_count
   *
   * @returns {Promise<MongooseDocument>}
   * @api public
   */
  static upsert(item) {

    const opts = {
      new: true,
      upsert: true,
      setDefaultOnInsert: true,
      runValidators: true
    };

    return UserHistoryModel
      .findOneAndUpdate({twitter_id: item.twitter_id, date_utc: item.date_utc}, item, opts)
      .exec();
  }

  /**
   * Returns the total amount of records in the UserHistory table
   */
  static count() {
    return UserHistoryModel
      .count()
      .exec();
  }

  /**
   * Converts the Twitter user model to a user-history record.
   * @param twitModel
   */
  static twitUserModelToUserHistory(twitModel) {
    let r = {};
    r.twitter_id = twitModel.twitter_id;
    r.friends_count = twitModel.profile.friends_count;
    r.statuses_count = twitModel.profile.statuses_count;
    r.listed_count = twitModel.profile.listed_count;
    r.followers_count = twitModel.profile.followers_count;
    r.date_utc = Lib.startOfDayUtc();
    return r;
  }

  /**
   * Remove all entries in the user-history collection.
   *
   * @returns {Promise}
   */
  static removeAll() {
    return UserHistoryModel
      .remove({})
      .exec();
  }
}

module.exports = UserHistoryBL;
