const UserHistoryFollowersModel = require('./user-history-followers.model').Model;
const Lib = require('./../../lib');

class UserHistoryFollowersBL {

  /**
   * Inserts or updates a new user-history-followers entry.
   *
   * @description
   *
   * @param {Object} item
   * @param {Number} item.twitter_id
   * @param {Number} item.follower_id
   */
  static upsertFollower(item) {

    return UserHistoryFollowersModel
      .findOne({twitter_id: item.twitter_id, follower_id: item.follower_id, end_date: null})
      .exec()
      .then(doc => {
        if (!doc) {

          // Ensure that the end_date is stored with null
          item.end_date = null;
          item.start_date = Lib.startOfDayUtc();
          item.last_check = Lib.nowUtc();

          doc = new UserHistoryFollowersModel(item);
          return doc
            .save()
        } else {

          doc.last_check = Lib.nowUtc();
          return doc.save();

        }
      })

  }

  /**
   * Removes a follower, which is technically speaking to set the end-date to the current UTC date.
   *
   * @param {Object} item
   * @param {Number} item.twitter_id
   * @param {Number} item.follower_id
   */
  static removeFollower(item) {

    return UserHistoryFollowersModel
      .findOne({twitter_id: item.twitter_id, follower_id: item.follower_id, end_date: null})
      .exec()
      .then(doc => {
        doc.end_date = Lib.startOfDayUtc();
        doc.last_check = Lib.nowUtc();
        return doc.save();
      })
  }

  static getActiveFollowers(twitter_id) {
    return UserHistoryFollowersModel
      .find({twitter_id: twitter_id, end_date: null})
  }


  static getHistory(item) {
    return UserHistoryFollowersModel
      .find({twitter_id: item.twitter_id, follower_id: item.follower_id})
  }

  static count() {
    return UserHistoryFollowersModel
      .count();
  }

  /**
   * Remove all entries in the user-history-followers collection.
   *
   * @returns {Promise}
   */
  static removeAll() {
    return UserHistoryFollowersModel
      .remove({})
      .exec();
  }

}

module.exports = UserHistoryFollowersBL;
