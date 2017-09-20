const amqp = require('amqplib');
const logger = require('winster').instance();

function encode(doc) {
  return new Buffer(JSON.stringify(doc));
}

class AmqpSugarLib {

  /**
   * Post a message to RabbitMq.
   *
   * @param {object} opts - Configuration to use to publish a message.
   * @param {object} opts.server - RabbitMQ server. If a string is passed, it's just the URI.
   * @param {object} opts.exchange - Information about the exchange.
   * @param {string} opts.exchange.type - 'topic', 'direct'
   * @param {string} opts.exchange.name - Name of the exchange.
   * @param {string} opts.key - Routing key to publish the message.
   * @param {object} opts.message - The message to post.
   */
  static publishMessage(opts) {
    return amqp.connect(opts.server)
      .then(conn => {
        conn.createChannel()
          .then(ch => {
            ch.assertExchange(opts.exchange.name, opts.exchange.type, {durable: true});
            ch.publish(opts.exchange.name, opts.key, encode(opts.message));
            logger.verbose(` [x] Sent ${opts.key}: ${JSON.stringify(opts.message, null)}`);
            setTimeout(() => {
              conn.close();
              logger.verbose('publishMessage: Connection closed');
            }, 500);
          });
      });
  }

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

    return amqp.connect(opts.server)
      .then(conn => {
        return conn.createChannel();
      })
      .then(channel => {
        logger.verbose('OK; we have a channel');
        return Promise.all([
          channel.assertExchange(ex, opts.exchange.type),
          channel.assertQueue(queueProfileSync, {exclusive: false}),
          channel.bindQueue(queueProfileSync, ex, 'heartbeat'),
          channel.consume(queueProfileSync, msg => {

            const msgContent = JSON.parse(msg.content.toString());
            logger.verbose('(logger): message from RabbitMQ', msgContent);

            // Mark job as running
            const jobId = msgContent.job_id;

            logger.trace('OK, ack');
            channel.ack(msg);
            return Promise.resolve();

          }, {noAck: false})
        ]);
      })
      .catch(err => {
        logger.error('Cannot connect to RabbitMQ', err);
      });
  }
}

module.exports = AmqpSugarLib;
