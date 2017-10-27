const Twit = require('twit');

const defaultTwitterConfig = require('./../../config/twitter-config');
const UsersModel = require('./users.model').Model;

const logger = require('winster').instance();

class UsersBl {

  /**
   * Return an array of followers for the given user.
   *
   * @param {Object} twitOptions
   * @param {Number} twitOptions.user_id - The user Id to get the followers for.
   * @param {Number} twitOptions.count - Count of records per page
   * @param {Number} twitOptions.next_cursor - Twitter's next page' cursor.
   * @param twitConfig
   */
  static async getTwitFollowersIds(twitOptions, twitConfig) {

    let c = twitConfig || defaultTwitterConfig;

    logger.verbose('twitOptions', twitOptions);

    let twit = new Twit(c);
    return await twit.get('/followers/ids', twitOptions);

  }

  /**
   * Fetch the twitter_id either from the database or from twitter
   * @param screen_name
   * @returns {Promise.<void>}
   */
  static async getTwitterId(screen_name) {
    let dbUser = await UsersBl.get({screen_name});
    if (dbUser && dbUser._doc) {
      return dbUser.twitter_id;
    } 
    let twitUser = await UsersBl.getTwitUser({screen_name});
    return twitUser.data.id;
    
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
  static upsert(user) {

    return UsersModel
      .findOneAndUpdate({twitter_id: user.twitter_id}, user, {new: true, upsert: true, setDefaultsOnInsert: true})
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
   * Returns the total amount of records in the Users table
   */
  static count() {
    return UsersModel
      .count()
      .exec();
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

module.exports = UsersBl;
