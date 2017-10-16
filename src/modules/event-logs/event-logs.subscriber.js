const _ = require('lodash');
const AmqpSugar = require('./../../lib/amqplib-sugar');
const config = require('./../../config/config');
const EventLogsBL = require('./event-logs.bl');
const logger = require('winster').instance();
// const msgTopology = require('./../../config/msg-topology');
// const uuid4 = require('uuid/v4');

class EventLogsSubscriber {

  static init() {
    EventLogsSubscriber.subscriber();
  }

  static listener(msgContent, msgRaw) {

    let logEntry = msgContent;
    logEntry.correlation_id = msgRaw.properties.correlationId;

    logger.verbose('event-log-listener', logEntry);
    return EventLogsBL.add(logEntry);
  }

  static subscriber() {

    let opts = {
      exchange: {
        type: 'topic',
        name: 'twitter'
      },
      // Todo: Check naming here: "sync-sync"!!??
      key: 'twitter.sync.user-sync.event-log',
      queue: {
        name: 'event-log_queue'
      }
    };

    AmqpSugar.subscribeMessage(config.RABBITMQ_CONNECTION, opts, EventLogsSubscriber.listener)
      .catch(err => {
        logger.error(`Error subscribing to ${opts.queue.name}`, err);
      });
  }
}

module.exports = EventLogsSubscriber;
