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
   * @param {Object} user - The user object.
   * @param {Boolean} convertToModel - whether to convert the user (from a Twitter result) to a mongoose model.
   * @return {Promise}
   */
  static upsert(user, convertToModel) {

    let data = null;

    // Todo: Don't really like that, not really self-explanatory
    if (convertToModel) {
      data = UsersBL.twitToModel(user);
    } else {
      data = user;
    }

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
   * @description Make sure to pass in twitterResult.data, not the entire object.
   *
   * @param twitUser
   * @returns {{twitter_id: Number, screen_name: (*|string|screen_name|{type, required}), profile: *}}
   */
  static twitToModel(twitUser) {

    // check if the raw Twitter result has been passed, then throw an error
    if (twitUser.data) {
      throw new Error('Do not pass in the raw Twitter result, but rather twitterResult.data');
    }

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
