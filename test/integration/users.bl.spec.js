const _ = require('lodash');
const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));
const testLib = require('./../lib');

const UsersBL = require('./../../src/modules/users/users.bl');

describe('Integration => users.bl', () => {

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
