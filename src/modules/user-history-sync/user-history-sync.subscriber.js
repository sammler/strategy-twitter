const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const UserHistorySyncBL = require('./user-history-sync.bl');

class UserHistorySyncSubscriber {

  static init() {
    UserHistorySyncSubscriber._userHistorySync();
  }

  static userHistorySyncListener(msg) {
    return UserHistorySyncBL.syncUserHistory(msg);
  }

  static _userHistorySync() {
    let opts = {
      server: config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.update_user_history',
      queue: {
        name: 'twitter.update_user_history__listen'
      }
    };
    AmqpSugar.subscribeMessage(opts, UserHistorySyncSubscriber.userHistorySyncListener);
  }
}

module.exports = UserHistorySyncSubscriber;
