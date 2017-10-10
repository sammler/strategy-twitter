const _ = require('lodash');
const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));
const testLib = require('./../lib');

const UserHistorySyncBL = require('./../../src/modules/user-history-sync/user-history-sync.bl');
const UsersBL = require('./../../src/modules/users/users.bl');

describe('Integration => users-history-sync.bl', () => {

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

  it('syncs the user history', () => {
    const screen_name = 'waltherstefan';
    return UserHistorySyncBL.syncUserHistory({screen_name: screen_name});
  });

});
