const Twit = require('twit');

const defaultTwitterConfig = require('./../../config/twitter-config');
const UsersModel = require('./users.model').Model;

class UsersBL {

  /**
   * Get a user from Twitter.
   *
   * @param query
   * @param twitConfig
   */
  static getTwitUser(query, twitConfig) {

    let c = twitConfig || defaultTwitterConfig;

    let twit = new Twit(c);
    return twit.get('/users/show', query);
  }

  /**
   * Upserts the twitUser in the database.
   *
   * @param twitUser
   */
  static upsert(twitUser) {

    let data = UsersBL.twitToModel(twitUser);

    return UsersModel
      .findOneAndUpdate({twitter_id: data.twitter_id}, data, {new: true, upsert: true, setDefaultsOnInsert: true})
      .exec();

  }

  /**
   * Converts the Twitter result to the mongoose model we use.
   *
   * @param twitUser
   * @returns {{twitter_id: Number, screen_name: (*|string|screen_name|{type, required}), profile: *}}
   */
  static twitToModel(twitUser) {
    return {
      twitter_id: parseInt(twitUser.id_str),
      screen_name: twitUser.screen_name,
      profile: twitUser
    };
  }

  /**
   * Remove all users.
   */
  static removeAll() {
    return UsersModel
      .remove({})
      .exec();
  }

}

module.exports = UsersBL;
