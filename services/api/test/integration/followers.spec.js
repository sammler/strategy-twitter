const HttpStatus = require('http-status-codes');
const superTest = require('supertest');
const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');

const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));

describe('Integration => followers', () => {

  let server;
  const appServer = new AppServer(testConfig);
  before(() => {
    return appServer.start()
      .then(() => {
        server = superTest(appServer.server);
      });
  });

  after(() => {
    return appServer.stop();
  });

  it('/followers is a valid endpoint', () => {
    return server
      .get('/followers')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
      });
  });
});
