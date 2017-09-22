const HttpStatus = require('http-status-codes');
const superTest = require('supertest');
const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');

const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));

const UsersBL = require('./../../src/modules/users/users.bl');

describe('Integration => users', () => {

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

  beforeEach(() => {
    return UsersBL.removeAll();
  });

  it('GET /v1/twit/users/:id return a user by screen_name', () => {
    const screen_name = 'waltherstefan';
    return server
      .get(`/v1/twit/users/${screen_name}`)
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.have.property('body');
        expect(result.body.data).to.have.property('screen_name').to.be.equal(screen_name);
      });
  });

  it('GET /v1/twit/users/by-id:id returns a user by id', () => {
    const id = 17390290;
    const screen_name = 'waltherstefan';
    return server
      .get(`/v1/twit/users/by-id/${id}`)
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.have.property('body');
        expect(result.body.data).to.have.property('screen_name').to.be.equal(screen_name);
      });
  });

  it('bl.upsert => inserts the user if not existing (authorized user)', () => {
    const screen_name = 'waltherstefan';
    return UsersBL.getTwitUser({screen_name: screen_name})
      .then(result => {
        return UsersBL.upsert(result.data)
          .then(result => console.log)
          .catch(err => {
            if (err) {
              console.error(err); 
            }
            expect(err).to.not.exist;
          });
      });
  });

  it('bl.upsert => inserts the user if not existing (non-authorized user)', () => {
    const screen_name = 'qlik';
    return UsersBL.getTwitUser({screen_name: screen_name})
      .then(result => {
        return UsersBL.upsert(result.data)
          .then(result => console.log)
          .catch(err => {
            if (err) {
              console.error(err); 
            }
            expect(err).to.not.exist;
          });
      });
  });

  it('bl.upsert => updates the user if existing', () => {
    return UsersBL.getTwitUser({screen_name: 'waltherstefan'})
      .then(result => {
        // console.log('data', result.data);
        return UsersBL.upsert(result.data)
          .then(result => console.log)
          .catch(err => {
            if (err) {
              console.error(err); 
            }
            expect(err).to.not.exist;
          });
      });
  });
});
