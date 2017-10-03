const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');
const superTest = require('supertest');

const init = (testMode) => {

  let mode = testMode || testConfig.TEST_MODE;

  if (mode === 'server') {
    return _initServer();
  } else if (mode === 'rest') {
    return _initRest();
  } else if (mode === 'db-only') {
    return _initDBOnly();
  }

};

const _initServer = () => {
  const appServer = new AppServer(testConfig);
  return appServer.start()
    .then(() => {
      return {
        superTest: superTest(appServer.server),
        appServer: appServer
      };
    })
    .catch(e => {
      console.error('Error initializing the server: ', err);
    });
};

const _initRest = () => {
  return Promise.resolve({
    superTest: superTest('http://localhost:3000')
  });
};

const _initDBOnly = () => {
  const appServer = new AppServer(testConfig);
  return appServer._initDB()
    .then(() => {
      return {
        appServer: appServer
      };
    })
    .catch(e => {
      console.error('Error initializing the DBOnly server: ', err);
    });
};

module.exports = {
  init
};
