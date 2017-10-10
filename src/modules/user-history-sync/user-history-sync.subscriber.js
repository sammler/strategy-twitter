const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const UserHistorySyncBL = require('./user-history-sync.bl');
const logger = require('winster').instance();

class UserHistorySyncSubscriber {

  static init() {
    // Todo: A message needs to be published in case of succeeding
    UserHistorySyncSubscriber.subscriber();
  }

  static listener(msg) {

    // Todo: Here's the place to publish the event messages
    return UserHistorySyncBL.syncUserHistory(msg);
      // .then(result => {
      //   console.log('syncUserHistory > result', result);
      // })
      // .catch(err => {
      //   console.log('syncUserHistory resulted in an error', err);
      // })
  }

  static subscriber() {
    let opts = {
      server: config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.cmd.sync.user-history',
      queue: {
        name: 'twitter-sync-user-history-queue'
      }
    };
    AmqpSugar.subscribeMessage(opts, UserHistorySyncSubscriber.listener);
  }
}

module.exports = UserHistorySyncSubscriber;
