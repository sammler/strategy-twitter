
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
      },ms)
    })

  }

}

module.exports = Lib;
