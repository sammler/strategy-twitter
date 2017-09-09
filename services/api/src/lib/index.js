const moment = require('moment');

class Lib {

  static startOfDayUtc() {
    return moment().utc().startOf('day');
  }

  static nowUtc() {
    return moment().utc();
  }

  // Todo: Does not seem to work properly ???
  static PromiseDelay(ms) {

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms)
    })

  }

  /**
   * Convert the Posix/epoch timestamp to a JavaScript date.
   *
   * @see https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
   * @param {Number} unix_timestamp
   *
   * @returns {Date} JavaScript date
   */
  static posixTimeToUtc(unix_timestamp) {

    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    return new Date(unix_timestamp * 1000);
  }
}

module.exports = Lib;
