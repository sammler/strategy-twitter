const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const msgTopology = require('./../../config/msg-topology');
const UserSyncBL = require('./../../modules/user-sync/user-sync.bl');

class UserSyncSubscriber {

  static init() {
    UserSyncSubscriber.subscriber();
  }

  static async listener(msgContent, msgRaw) {

    const logPrefix = `[syncUser:${msgContent.screen_name}]`;

    try {
      let result = await UserSyncBL.syncUser({screen_name: msgContent.screen_name});
      logger.trace(`${logPrefix} status after syncUser => `, result.status);

      await UserSyncSubscriber._publishEvents({
        status: result.status,
        result: {
          screen_name: result.user.screen_name,
          twitter_id: result.user.twitter_id
        },
        correlationId: msgRaw.properties.correlationId
      });

      // Now let's publish
      // - twitter.user.synced (should contain what we have done)
      // - twitter.cmd.sync.user-history
      if (['updated', 'created'].indexOf(result.status)) {
        // await UserSyncSubscriber._publishNextSteps(user);
      }

    }
    catch (e) {

      // Todo: include the error message here
      await UserSyncSubscriber._publishEvents({
        status: 'error',
        result: e,
        correlationId: msgRaw.properties.correlationId
      });

    }

  }

  static async _publishEvents(msg) {

    let opts = {
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.sync.user-sync.event-log',
      payload: {
        action: 'twitter.sync.user-sync',
        status: msg.status,
        result: msg.result
      },
      options: {
        correlationId: msg.correlationId
      }
    };

    return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, opts);

  }

  static async _publishNextSteps(msg) {

    let pubOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-history'});

    // Todo: this has to be dynamic, ... somehow
    // E.g. just take the required parameters from the config and apply them.
    pubOpts.payload.screen_name = msg.screen_name;

    // let optsSyncHistory = {
    //   exchange: {
    //     type: 'topic',
    //     name: 'twitter'
    //   },
    //   key: 'twitter.cmd.sync.user-history',
    //   payload: {
    //     screen_name: opts.screen_name
    //   }
    // };

    return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, pubOpts);
  }

  static subscriber() {

    let subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user'});

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserSyncSubscriber.listener)
      .catch(err => {
        // Todo: logger.error doesn't work here?
        console.error(`Error subscribing to ${subOpts.queue.name}`, err);
      });
  }
}

module.exports = UserSyncSubscriber;
