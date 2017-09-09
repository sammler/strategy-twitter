
const UserHistoryModel = require('./user-history.model').Model;

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
      .findOneAndUpdate({twitter_id: item.twitter_id, date: item.date}, item, opts)
      .exec();
  }

  static count() {
    return UserHistoryModel
      .count()
      .exec();
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
