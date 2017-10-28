const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
// const logger = require('winster').instance();
const moment = require('moment');
// const msgTopology = require('./../../config/msg-topology');

class DelayedMsgSubscriber {
  static init() {
    // DelayedMsgSubscriber.subscriber();
  }

  static listener(msgContent /* , msgRaw */) {

    let ts = moment(new Date(JSON.parse(msgContent.ts)));
    let now = moment();
    console.log('OK, we got something in DelayedMsgSubscriber');
    console.log('--- msgContent', msgContent);
    console.log('--- msgContent.ts', ts);
    console.log('--- msgContent.now', now);
    console.log('--- diff', ts.diff(now, 'seconds'));
    return Promise.resolve();
  }

  static async subscriber() {

    const pubOptions = {
      exchange: {
        type: 'x-delayed-message',
        name: 'test',
        arguments: {
          durable: true,
          arguments: {
            'x-delayed-type': 'topic'
          }
        }
      },
      key: 'system.delayed-msg',
      payload: {
        ts: JSON.stringify(new Date())
      },
      options: {
        headers: {
          'x-delay': 2000
        }
      }
    };

    // console.log('xx', pubOptions);

    // first publish
    await AmqpSugar.publishMessage(config.RABBITMQ_CONNECTION, pubOptions);

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

    await AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, opts, DelayedMsgSubscriber.listener);
  }
}

module.exports = DelayedMsgSubscriber;
