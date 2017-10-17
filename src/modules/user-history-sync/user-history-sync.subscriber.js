const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const msgTopology = require('./../../config/msg-topology');
const UserHistorySyncBL = require('./user-history-sync.bl');
const Joi = require('joi');

class UserHistorySyncSubscriber {

  static init() {
    UserHistorySyncSubscriber.subscriber();
  }

  static async listener(msgContent, msgRaw) {

    const logPrefix = `[syncUserHistory:${msgContent.screen_name}]`;

    try {

      UserHistorySyncSubscriber._validateMsg(msgContent, msgRaw);
      let result = await UserHistorySyncBL.syncUserHistory(msgContent);
      // logger.trace(`${logPrefix} full result object => `, result);

      await UserHistorySyncSubscriber._publishEvents({
        status: result.status,
        result: {
          screen_name: result.user_history.screen_name
        },
        correlationId: msgRaw.properties.correlationId
      });

      if (['fetch', 'user_existing_rec'].indexOf(result.status) >= 0) {

        // Todo: load from topology
        let opts = {
          exchange: {
            type: 'topic',
            name: 'twitter'
          },
          key: 'twitter.cmd.sync.user-history-followers',
          payload: {
            screen_name: result.user_history.screen_name,
            next_cursor: -1,
            count: 1
          },
          correlationId: msgRaw.properties.correlationId
        };
        await UserHistorySyncSubscriber._publishNextSteps(opts);
      }

    }
    catch(err) {
      // Todo: introduce the notion of _publishError ... makes unit testing easier and more reliable
      logger.error(`${logPrefix} publish an unexpected error`, err);
      await UserHistorySyncSubscriber._publishEvents({
        status: 'error',
        result: err,
        correlationId: msgRaw.properties.correlationId
      });
    }
  }

  static _validateMsg(msgContent, msgRaw) {
    const schemaMsgContent = Joi.object().keys({
      screen_name: Joi.string().required()
    });
    const resultMsgContent = Joi.validate(msgContent, schemaMsgContent);
    if (resultMsgContent.error) {
      throw new Error(resultMsgContent.error);
    }

    const schemaMsgRaw = Joi.object().keys({
      properties: Joi.object().keys({
        correlationId: Joi.required()
      }).required()
    });
    const resultMsgRaw = Joi.validate(msgRaw, schemaMsgRaw);
    if (resultMsgRaw.error) {
      throw new Error(resultMsgRaw.error);
    }
  }


  static subscriber() {

    let subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-history'});

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserHistorySyncSubscriber.listener)
      .catch(err => {
        logger.error(`Error subscribing to ${subOpts.queue.name}`, err);
      });
  }

  static async _publishEvents(msg) {

    // Todo: load from topology
    let opts = {
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      key: 'twitter.sync.user-history.event-log',
      payload: {
        action: 'twitter.sync.user--history-sync',
        status: msg.status,
        result: msg.result
      },
      options: {
        correlationId: msg.correlationId
      }
    };

    return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, opts);

  }

  static async _publishNextSteps(opts) {

    return await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, opts);

  }

}

module.exports = UserHistorySyncSubscriber;
