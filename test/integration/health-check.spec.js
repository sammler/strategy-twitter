const HttpStatus = require('http-status-codes');
const supertest = require('supertest');
const AppServer = require('./../../src/api/app-server');

describe('HEALTH-CHECK', () => {

  let appServer;
  let server;
  beforeEach(() => {
    appServer = new AppServer();
    appServer.start();
    server = supertest(appServer.server);
  });

  afterEach(() => {
    appServer.stop();
  });

  it('returns a timestamp', () => {
    return server
      .get('/health-check')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result.body).to.have.a.property('data');
        expect(result.body.data).to.have.a.property('ts');
      });
  });

});
