const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const UserHistoryFollowersSyncBL = require('./user-history-followers-sync.bl');

class UserHistoryFollowersSubscriber {

  static init() {
    // Todo: A message needs to be published in case of succeeding
    UserHistoryFollowersSubscriber._userHistoryFollwersSync();
  }

  static userHistoryFollowersSyncListener(msg) {
    //return UserHistorySyncBL.syncUserHistory(msg);
  }

  static _userHistoryFollwersSync() {
    let opts = {
      server: config.RABBITMQ_URI,
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.cmd.sync-user-history-followers',
      queue: {
        name: 'twitter-sync-user-history-followers-queue'
      }
    };
    AmqpSugar.subscribeMessage(opts, UserHistoryFollowersSubscriber.userHistoryFollowersSyncListener);
  }
}

module.exports = UserHistoryFollowersSubscriber;
