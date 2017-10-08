const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();

const UserSyncBL = require('./../../modules/user-sync/user-sync.bl');

class UserSyncSubscriber {

  static init() {
    UserSyncSubscriber._userSync();
  }

  static userSyncListener(msg) {
    return UserSyncBL.syncUser({screen_name: msg.screen_name})
  }

  static _userSync() {
    let opts = {
      server: config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.update_user',
      queue: {
        name: 'twitter.update_user__listen'
      }
    };
    AmqpSugar.subscribeMessage(opts, UserSyncSubscriber.userSyncListener)
      .then((o) => {
        logger.verbose('OK, do something after twitter.update_user__listen', o);
      })
      .catch(err => {
        logger.error('Error in subscribeMessage', err);
      })
  }
}

module.exports = UserSyncSubscriber;
