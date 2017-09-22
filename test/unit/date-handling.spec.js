const Lib = require('./../../src/lib');
const moment = require('moment');

describe('Date Handling', () => {

  it('get a date without time', () => {

    let dateWithoutTime = Lib.startOfDayUtc();
    expect(moment(dateWithoutTime).hours()).to.be.equal(0);
    expect(moment(dateWithoutTime).minutes()).to.be.equal(0);
    expect(moment(dateWithoutTime).seconds()).to.be.equal(0);
  });

});
