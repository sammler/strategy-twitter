const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const msgTopology = require('./../../config/msg-topology');
const UserHistoryFollowersSyncBL = require('./user-history-followers-sync.bl');

class UserHistoryFollowersSubscriber {

  static init() {
    // Todo: A message needs to be published in case of succeeding
    UserHistoryFollowersSubscriber.subscriber();
  }

  static listener(msg) {
    //return UserHistorySyncBL.syncUserHistory(msg);
  }

  static subscriber() {

    const subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-history-followers'});

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserHistoryFollowersSubscriber.listener)
      .catch(err => {
        logger.error(`Error subscribing to ${subOpts.queue.name}`, err);
      });
  }
}

module.exports = UserHistoryFollowersSubscriber;
