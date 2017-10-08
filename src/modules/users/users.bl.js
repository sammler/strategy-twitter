const Twit = require('twit');

const defaultTwitterConfig = require('./../../config/twitter-config');
const UsersModel = require('./users.model').Model;

class UsersBL {

  /**
   * Return an array of followers for the given user.
   */
  static getTwitFollowersIds(twitOptions, twitConfig) {

    let c = twitConfig || defaultTwitterConfig;

    let twit = new Twit(c);
    return twit.get('/followers/ids', twitOptions);

  }

  /**
   * Get a user from Twitter.
   *
   * @param twitOptions
   * @param twitOptions.screen_name
   *
   *
   * @param twitConfig - The Twitter auth configuration, defaults to the app-wide Twitter-authentication settings (as defined in ./config/twitter-config resp. by environment variables.
   */
  static getTwitUser(twitOptions, twitConfig) {

    let c = twitConfig || defaultTwitterConfig;

    let twit = new Twit(c);
    return twit.get('/users/show', twitOptions);
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
   * Get the user
   * @param {object} query - Query definition to be passed to mongoose' `findOne`.
   * @returns {Query|*}
   */
  static get(query) {
    return UsersModel
      .findOne(query);
  }

  /**
   * Converts the Twitter result to the mongoose model we use.
   *
   * @param twitUser
   * @returns {{twitter_id: Number, screen_name: (*|string|screen_name|{type, required}), profile: *}}
   */
  static twitToModel(twitUser) {
    return {
      twitter_id: parseInt(twitUser.id_str, 10),
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
