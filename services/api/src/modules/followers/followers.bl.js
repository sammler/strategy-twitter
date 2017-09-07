const Twit = require('twit');
const TWITTER_CONFIG = require('./../../config/twitter-config');

const T = new Twit({
  consumer_key:         TWITTER_CONFIG.consumer_key,
  consumer_secret:      TWITTER_CONFIG.consumer_secret,
  access_token:         TWITTER_CONFIG.access_token,
  access_token_secret:  TWITTER_CONFIG.access_token_secret,
  timeout_ms:           TWITTER_CONFIG.timeout_ms,
  app_only_auth:        TWITTER_CONFIG.app_only_auth


});

class FollowersBL {

  static get(twitConfig) {

    const T = new Twit(twitConfig);
    T.get('/users/show', {screen_name: 'waltherstefan'})
      .then( data => console.log)
      .catch(err => console.error)
  }

}

module.exports = FollowersBL;
