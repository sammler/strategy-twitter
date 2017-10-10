const amqp = require('amqplib');
const logger = require('winster').instance();
const promiseRetry = require('promise-retry');
const _ = require('lodash');
const defaultConfigs = require('./../../node_modules/amqplib-sugar/src/config/default-configs');
const Joi = require('joi');

function encode(doc) {
  return new Buffer(JSON.stringify(doc));
}

var connection = null;

/**
 * Sugar methods to work with amqplib.
 */
class AmqpSugarLib {

  /**
   * RabbitMQ Server definition.
   *
   * @typedef {string} rabbitConnectionDef - Connection string of the server.
   */

  /**
   * Retry behavior in case RabbitMQ is not available.
   *
   * @typedef {object} retry_behavior
   *
   * @property {number} retries - The maximum amount of times to retry the operation. Defaults to 10.
   *
   * @property {boolean} enabled - Whether retry is enabled at all or not (defaults to true); setting to false is equal to keeping {@link retry_behavior} empty.
   * @property {number} interval - Interval in ms.
   * @property {number} times - Amount of times the given operation should be retried.
   * @readonly
   * @property {number} attempts - Readonly, current amount of attempts.
   */

  /**
   * Post a message to RabbitMq.
   *
   * @param {object} opts - Configuration to use to publish a message.
   * @param {string} opts.server - RabbitMQ server. If a string is passed, it's just the URI.
   * @param {object} opts.exchange - Information about the exchange.
   * @param {string} opts.exchange.type - 'topic', 'direct'
   * @param {string} opts.exchange.name - Name of the exchange.
   * @param {string} opts.key - Key to publish the message.
   * @param {object} opts.payload - The message to post.
   * @param {Object} opts.options - Options to publish.
   * @param {string} [opts.correlationId] - RabbitMQ's correlationId.
   * @param {retry_behavior} [opts.retry_behavior] - Retry behavior.
   *
   * @returns {Promise}
   */
  static publishMessage(opts) {
    return AmqpSugarLib._connect(opts)
      .then(conn => {
        conn.createChannel()
          .then(channel => {
            channel.assertExchange(opts.exchange.name, opts.exchange.type, {durable: true});
            channel.publish(opts.exchange.name, opts.key, encode(opts.payload), opts.options);
            logger.verbose(`[AMQP] Sent ${opts.key}: ${JSON.stringify(opts.payload, null)}`);

            setTimeout(() => { channel.close()}, 500);

            // Todo: Not clear, why we need a setTimeout here ...
            // setTimeout(() => {
            //   conn.close();
            //   logger.verbose('[AMQP]: Connection closed (publishMessage)');
            // }, 500);
          });
      });
  }

  /**
   * Subscribe to a message on RabbitMQ.
   * @param {object} opts - Configuration object for subscribing to messages.
   *
   * @param {string} opts.server - URI of the server.
   *
   * @param {object} opts.exchange - The exchange to connect to.
   * @param {string} opts.exchange.type - Type of the exchange, e.g. 'topic'.
   * @param {string} opts.exchange.name - Name of the exchange.
   *
   * @param {string} opts.key - The routing key to use.
   *
   * @param {object} opts.queue - The queue to bind to
   * @param {string} opts.queue.name
   */

  // Todo(AA): Remove in prod
  // eslint-disable-next-line no-unused-vars
  static subscribeMessage(opts, fn) {

    return AmqpSugarLib._connect(opts)
      .then(conn => {

        logger.verbose(`[AMQP] Subscribed to queue: ${opts.queue.name}`);

        conn.on('error', err => {
          console.error('[AMQP] OK, we got an error with the connection in subscribeMessage', err);
          return promiseRetry((/* retry, number */) => {
            // Todo: These logs are not shown ?
            logger.verbose('[AMQP] Trying to re-subscribe to the message');
            console.log('[AMQP] Trying to re-subscribe to the message');
            return AmqpSugarLib.subscribeMessage(opts);
          });
        });

        // Todo(AAA): Verify, seems that we keep creating channels?
        return conn.createChannel();
      })
      .then(channel => {
        return Promise.all([
          channel.assertExchange(opts.exchange.name, opts.exchange.type),
          channel.assertQueue(opts.queue.name, {exclusive: false}),
          channel.bindQueue(opts.queue.name, opts.exchange.name, opts.key),
          channel.consume(opts.queue.name, msg => {

            const msgContent = JSON.parse(msg.content.toString());
            logger.verbose(`[AMQP] ${opts.exchange.name}:${opts.queue.name}]`, msgContent);

            if (fn) {
              fn(msgContent)
                .then(() => {
                  logger.trace(`[AMQP] ack => ${opts.queue.name}`);
                  channel.ack(msg); // Closing the channel is handled by ack()
                })
                .catch(err => {
                  logger.trace(`[AMQP] nack => ${opts.queue.name}`, err);
                  channel.nack(msg); // Closing the channel is handled by nack()
                });
            }
          }, {noAck: false})
        ]);
      })
      .catch(err => {
        logger.error('[AMQP] Cannot connect to RabbitMQ', err);
      });
  }

  static _fixOptions(opts) {
    // logger.verbose('fixOptions:opts', opts);
    opts = _.defaults(opts, {retry_behavior: {}});
    opts.retry_behavior = _.defaults(opts.retry_behavior, defaultConfigs.retry_behavior);
    // logger.verbose('fixOptions:opts:afterFix', opts);
    return opts;
  }

  /**
   * Connect to RabbitMQ.
   *
   * Very similar to amqp.connect, but with the big difference, that if the connection
   * fails, the operation will retry as defined in opts.retry_behavior
   *
   * @param {rabbitConnectionDef} opts.server - Connection information for the server.
   * @param {retry_behavior} opts.retry_behavior - Retry behavior for establishing the connection.
   *
   * @return {Promise} - Returns the promise as defined for amqplib.connect
   */
  static _connect(opts) {

    opts = AmqpSugarLib._fixOptions(opts);
    // let valError = AmqpSugarLib._validateConnectOptions(opts);
    // if (valError) {
    //   throw new Error()
    // }

    // Todo(AAA): Still every subscriber opens a new connection, this needs to be fixed to use one common connection.
    if (!connection) {
      logger.verbose('Opening a new connection');
      return promiseRetry((retry, number) => {

        opts.retry_behavior.attempts = number;
        if (number >= 2) {
          logger.verbose(`[AMQP] Trying to (re)connect to RabbitMq, attempt number ${number - 1}`);
        }

        return amqp.connect(opts.server)
          .then(conn => {
            connection = conn;
            return Promise.resolve(conn);
          })
          .catch(retry);

      });
    } else {
      return Promise.resolve(connection);
    }
  }

  static _validateConnectOptions(opts) {
    const schema = Joi.object().keys({
      server: Joi.string().required()
    });
    return Joi.validate(opts, schema);
  }
}

module.exports = AmqpSugarLib;
