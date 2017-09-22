const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');
const _ = require('lodash');

const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));

const UsersBL = require('./../../src/modules/users/users.bl');

describe('Integration => users.bl', () => {

  const appServer = new AppServer(testConfig);
  before(() => {
    return appServer.start();
  });

  after(() => {
    return appServer.stop();
  });

  beforeEach(() => {
    return UsersBL.removeAll();
  });

});
