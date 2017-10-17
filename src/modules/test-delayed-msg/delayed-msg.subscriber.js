const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const logger = require('winster').instance();
const moment = require('moment');
const msgTopology = require('./../../config/msg-topology');

class DelayedMsgSubscriber {
  static init() {
    DelayedMsgSubscriber.subscriber();
  }

  static listener(msgContent, msgRaw) {

    let ts = moment(new Date(JSON.parse(msgContent.ts)));
    let now = moment();
    console.log('OK, we got something in DelayedMsgSubscriber');
    console.log('--- msgContent', msgContent);
    console.log('--- msgContent.ts', ts);
    console.log('--- msgContent.now', now);
    console.log('--- diff', ts.diff(now, 'seconds'));
    return Promise.resolve();
  }

  static subscriber() {

    const pubOptions = {
      exchange: {
        type: 'x-delayed-message',
        name: 'test',
        arguments: {
          durable: true,
          'x-delayed-type': 'topic'
        }
      },
      key: 'system.delayed-msg',
      payload: {
        ts: JSON.stringify(new Date()),
      },
      options: {
        headers: {
          'x-delay': 2000
        }
      }
    };

    console.log('xx', pubOptions);

    // first publish
    AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, pubOptions)
      .then(() => {

        // then subscribe
        const opts = {
          exchange: {
            type: 'x-delayed-message',
            name: 'test'
          },
          key: 'system.delayed-msg',
          queue: {
            name: 'system.delayed-msg__queue'
          }
        };

        AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, opts, DelayedMsgSubscriber.listener)
          .catch(err => {
            logger.error(`Error subscribing to ${opts.queue.name}`, err);
          });
      });

  }
}

module.exports = DelayedMsgSubscriber;
