const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const msgTopology = require('./../../config/msg-topology');
const UserHistorySyncBL = require('./user-history-sync.bl');

class UserHistorySyncSubscriber {

  static init() {
    UserHistorySyncSubscriber.subscriber();
  }

  static listener(msg) {

    // Todo: Here's the place to publish the event messages
    return UserHistorySyncBL.syncUserHistory(msg)
      .catch(err => {
        logger.error.log('syncUserHistory resulted in an error', err);
      });
  }

  static subscriber() {

    let subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-history'});

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserHistorySyncSubscriber.listener)
      .catch(err => {
        logger.error(`Error subscribing to ${subOpts.queue.name}`, err);
      });
  }

  static _publishEvents() {

  }

  static _publishNextSteps() {

  }

}

module.exports = UserHistorySyncSubscriber;
