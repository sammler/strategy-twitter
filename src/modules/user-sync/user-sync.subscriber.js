const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const msgTopology = require('./../../config/msg-topology');
const UserSyncBL = require('./../../modules/user-sync/user-sync.bl');
const Joi = require('joi');

class UserSyncSubscriber {

  static init() {
    UserSyncSubscriber.subscriber();
  }

  static subscriber() {

    let subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user'});

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserSyncSubscriber.listener)
      .catch(err => {
        // Todo: logger.error doesn't work here?
        console.error(`Error subscribing to ${subOpts.queue.name}`, err);
      });
  }

  static async listener(msgContent, msgRaw) {

    const logPrefix = `[syncUser:${msgContent.screen_name}]`;

    try {
      UserSyncSubscriber._validateMsg(msgContent, msgRaw);

      // Todo(AAA): Here we have an issue, as we could hit the rate-limit and should re-publish
      let result = await UserSyncBL.syncUser({screen_name: msgContent.screen_name});
      logger.trace(`${logPrefix} full result object => `, result);

      await UserSyncSubscriber._publishEvents({
        status: result.status,
        result: {
          screen_name: result.user.screen_name,
          twitter_id: result.user.twitter_id
        },
        correlationId: msgRaw.properties.correlationId
      });

      // Todo: Needs some refactoring to also publish the events like twitter.user.created, twitter.user.updated, etc.
      // Todo: (makes sense to first implement the msg-topology library)
      // Now let's publish
      // - twitter.user.synced (should contain what we have done) <== NOT IMPLEMENTED, YET
      // - twitter.cmd.sync.user-history
      if (['updated', 'created'].indexOf(result.status) > -1) {
        logger.trace(`${logPrefix} publish the next steps`);
        await UserSyncSubscriber._publishNextSteps(result.user);
      } else if (['error-rate-limit-hit'].indexOf(result.status) > -1) {
        await UserSyncSubscriber._publishRetry();
      }

    } catch (err) {
      logger.trace(`${logPrefix} publish an unexpected error`, err);
      await UserSyncSubscriber._publishError({
        status: 'error',
        result: err,
        correlationId: msgRaw.properties.correlationId
      });
    }
  }

  /**
   * Validates the message the listener is expecting.
   * @private
   */
  static _validateMsg(msgContent, msgRaw) {

    let schemaMsgContent = Joi.object().keys({
      screen_name: Joi.string().required()
    });
    const resultMsgContent = Joi.validate(msgContent, schemaMsgContent);
    if (resultMsgContent.error) {
      throw new Error(resultMsgContent.error);
    }

    let schemaMsgRaw = Joi.object().keys({
      properties: Joi.object().keys({
        correlationId: Joi.required()
      }).required()
    });
    const resultMsgRaw = Joi.validate(msgRaw, schemaMsgRaw);
    if (resultMsgRaw.error) {
      throw new Error(resultMsgRaw.error);
    }
  }

  static async _publishEvents(msg) {

    // Todo: load from topology
    let opts = {
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.sync.user.event-log',
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

  static async _publishError(msg) {
    // Todo: load from topology
    let opts = {
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.sync.user.event-log',
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

    // Todo: Change msgTopology
    let pubOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-history'});

    // Todo: this should ideally be dynamic, ... somehow
    // E.g. just take the required parameters from the config and apply them.
    pubOpts.payload.screen_name = msg.screen_name;

    return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, pubOpts);
  }

  // Todo: As cloudamqp is not allowing to use plugins, we might look for other options of delaying a msg without using a plugin ...
  static async _publishRetry(/* msg */) {

    return Promise.resolve();

    // const opts = {
    //   exchange: {
    //     type: 'x-delayed-message',
    //     arguments: {
    //       durable: true,
    //       arguments: {
    //         'x-delayed-type': 'topic'
    //       }
    //
    //     }
    //   }
    // };
    // return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, opts);

  }

}

module.exports = UserSyncSubscriber;
