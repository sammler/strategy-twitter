const amqp = require('amqplib');
const logger = require('winster').instance();
const promiseRetry = require('promise-retry');
const _ = require('lodash');
const uuid = require('uuid');

const default_retry_behavior = {
  retry_behavior: {
    attempts: 0
  }
};

// Todo: Do we still need this
/* eslint-disable no-unused-vars */
function encode(doc) {
  return new Buffer(JSON.stringify(doc));
}

/* eslint-enable no-unused-vars */
class AmqpSugarLib {

  /**
   * Subscribe to a message on RabbitMQ.
   * @param {object} opts - Configuration object for subscribing to messages.
   * @param {string} opts.server - URI of the server.
   * @param {object} opts.exchange - The exchange to connect to.
   * @param {string} opts.exchange.type - Type of the exchange, e.g. 'topic'.
   * @param {string} opts.exchange.name - Name of the exchange.
   * @param {string} opts.key - The routing key to use.
   */
  static subscribeMessage(opts) {
    const ex = 'system';
    const queueProfileSync = 'queue.heartbeat';

    return AmqpSugarLib.connect(opts)
      .then(conn => {

        conn.on('error', err => {
          console.error('OK, we got an error with the connection in subscribeMessage', err);
          return promiseRetry((retry, number) => {
            // Todo: These logs are not shown ?
            logger.verbose(`Trying to re-subscribe to the message`);
            console.log(`Trying to re-subscribe to the message`);
            return AmqpSugarLib.subscribeMessage(opts);
          });
        });

        return conn.createChannel();
      })
      .then(channel => {
        // logger.verbose('OK; we have a channel');
        return Promise.all([
          channel.assertExchange(ex, opts.exchange.type),
          channel.assertQueue(queueProfileSync, {exclusive: false}),
          channel.bindQueue(queueProfileSync, ex, 'heartbeat'),
          channel.consume(queueProfileSync, msg => {

            const msgContent = JSON.parse(msg.content.toString());
            logger.verbose('message from RabbitMQ', msgContent);

            // Mark job as running
            const jobId = msgContent.job_id || uuid.v1();

            logger.verbose('OK, ack the job', jobId);
            channel.ack(msg);
            return Promise.resolve();

          }, {noAck: false})
        ]);
      })
      .catch(err => {
        logger.error('Cannot connect to RabbitMQ', err);
      });
  }

  /**
   *
   * @param opts
   * @returns {*}
   */
  static connect(opts) {

    // Merge opts with default params
    opts = _.defaults(opts, default_retry_behavior);

    console.log('opts', opts);

    return promiseRetry((retry, number) => {

      opts.retry_behavior.attempts = number;
      if (number >= 2) {
        logger.verbose(`Trying to (re)connect to RabbitMq, attempt number ${number--}`);
      }
      return amqp.connect(opts.server)
        .then(conn => {

          // conn.on('error', err => {
          //   console.log('#338: process error', err);
          // });
          //
          // conn.on('uncaughtException', function (err) {
          //   console.log('#338: process uncaught exception', err);
          // });
          //
          // conn.on('unhandledRejection', (reason, p) => {
          //   console.log('#338: process unhandled rejection', p, 'reason', reason);
          // });

          // conn.on('close', e => {
          //   console.log('#338: process close event', e);
          //   logger.error('Lost connection to RabbitMQ, will try again in 2 secs');
          //   return setTimeout(() => {
          //     AmqpSugarLib.connect.bind(null, opts);
          //   }, 2000);
          // });
          return conn;
        })
        .catch(retry);
    });
  }
}

module.exports = AmqpSugarLib;
