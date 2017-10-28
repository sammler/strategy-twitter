const EventLogsModel = require('./event-logs.model').Model;
const logger = require('winster').instance();

class EventLogsBL {

  /**
   * Add a new event-log.
   * @param logEntry
   */
  static add(logEntry) {

    logger.verbose('[even-log] Adding a new entry');
    return EventLogsModel
      .create(logEntry);
  }
}

module.exports = EventLogsBL;
