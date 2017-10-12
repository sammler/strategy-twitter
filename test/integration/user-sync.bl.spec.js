const testLib = require('./../lib');
const UsersBL = require('./../../src/modules/users/users.bl');

describe('INTEGRATION => user-sync.bl', () => {

  let appServer;
  before(() => {
    return testLib.init('db-only').then(result => {
      appServer = result.appServer;
    });
  });

  after(() => {
    if (appServer) {
      return appServer.stop();
    }
    return Promise.resolve();
  });

  beforeEach(() => {
    return UsersBL.removeAll();
  });

  it('returns a new user if none is stored', () => {
    expect(true).to.be.false;
  });

  it('updates an existing user if one is stored and older than 24hrs', () => {
    expect(true).to.be.false;
  });

  it('doesn\'t do anything if there is a user, not older thant 24hrs', () => {
    expect(true).to.be.false;
  });
});
