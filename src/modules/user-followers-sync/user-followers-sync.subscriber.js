const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance(); // eslint-disable-line no-unused-vars
const msgTopology = require('./../../config/msg-topology');
const Joi = require('joi');

const UserFollowersSyncBl = require('./../../../src/modules/user-followers-sync/user-followers-sync.bl');

class UserFollowersSyncSubscriber {

  static get enabled() {
    return true;
  }

  static async init() {
    return await UserFollowersSyncSubscriber.subscriber();
  }

  static async listener(msgContent, msgRaw) {

    const logPrefix = `[syncUserHistory:${msgContent.screen_name}]`; // eslint-disable-line no-unused-vars

    try {
      UserFollowersSyncSubscriber._validateMsg();
      let result = await UserFollowersSyncBl.syncUserFollowers();

      await UserFollowersSyncSubscriber._publishEvents({
        status: result.status,
        result: {
          screen_name: result.user_history.screen_name
        },
        correlationId: msgRaw.properties.correlationId
      });

      // Store each of the followers

      // Publish next steps

    } catch (err) {
      // logger.error(`${logPrefix} publish an unexpected error`, err);
      await UserFollowersSyncSubscriber._publishError({
        status: 'error',
        result: err,
        correlationId: msgRaw.properties.correlationId
      });
    }
  }

  static _validateMsg(msgContent, msgRaw) {

    const schemaMsgContent = Joi.object().keys({
      screen_name: Joi.string().required(),
      next_cursor: Joi.number().required(),
      count: Joi.number().required()
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

  /**
   * The message should have the following structure:
   *
   *
   *
   */
  // Todo(doc)
  static async subscriber() {

    const subOpts = _.find(msgTopology, {key: 'twitter.cmd.sync.user-followers'});

    return await AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, subOpts, UserFollowersSyncSubscriber.listener);

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

  static async _publishError(msg) {
    return await UserFollowersSyncSubscriber._publishEvents(msg);
  }

  static async _publishNextSteps() {

  }

}

module.exports = UserFollowersSyncSubscriber;
