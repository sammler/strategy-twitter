const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();

const UserSyncBL = require('./../../modules/user-sync/user-sync.bl');

class UserSyncSubscriber {

  static init() {
    UserSyncSubscriber._userSync();
  }

  static userSyncListener(msg) {
    // Todo: a message needs to be published after success/failure
    return UserSyncBL.syncUser({screen_name: msg.screen_name});
  }

  static _userSync() {
    let opts = {
      server: config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.cmd.sync.user',
      queue: {
        name: 'twitter-sync-user-queue'
      }
    };
    AmqpSugar.subscribeMessage(opts, UserSyncSubscriber.userSyncListener);

      // Todo this code only happens after subscribing first, so not returning anything for each event!
      // .then(o => {
      //   logger.verbose(`OK, do something after ${opts.queue.name}`, o);
      // })
      // .catch(err => {
      //   logger.error('Error in subscribeMessage', err);
      // });
  }
}

module.exports = UserSyncSubscriber;
