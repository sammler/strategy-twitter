const HttpStatus = require('http-status-codes');
const testLib = require('./../lib');

const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));

const UsersBL = require('./../../src/modules/users/users.bl');

xdescribe('Integration:REST => users', () => {

  let appServer;
  before(() => {
    return testLib.init('rest').then(result => {
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

});
