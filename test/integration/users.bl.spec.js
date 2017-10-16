const testLib = require('./../lib');
const UsersBl = require('./../../src/modules/users/users.bl');

describe('INTEGRATION => users.bl', () => {

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
    return UsersBl.removeAll();
  });

  it('bl.upsert => inserts the user if not existing (authorized user)', () => {

    // Todo: Can be stored as test-config in one central space ...
    const screen_name = 'waltherstefan';
    return UsersBl.getTwitUser({screen_name: screen_name})
      .then(result => {
        return UsersBl.upsert(result.data)
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
    return UsersBl.getTwitUser({screen_name: screen_name})
      .then(result => {
        return UsersBl.upsert(result.data)
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
    return UsersBl.getTwitUser({screen_name: 'waltherstefan'})
      .then(result => {
        // console.log('data', result.data);
        return UsersBl.upsert(result.data)
          .then(result => console.log)
          .catch(err => {
            if (err) {
              console.error(err);
            }
            expect(err).to.not.exist;
          });
      });
  });

  describe.only('getTwitterId', () => {

    // Todo: Can be stored as test-config in one central space ...
    const screen_name = 'waltherstefan';
    const twitter_id = 17390290;

    beforeEach(async () => {
      return await UsersBl.removeAll();
    });

    it('returns the twitter_id from DB if a record is existing', async () => {

      const fakeUserId = 111;
      let usr = {
        screen_name,
        twitter_id: fakeUserId
      };
      await UsersBl.upsert(usr);
      let id = await UsersBl.getTwitterId(screen_name);
      expect(id).to.be.equal(fakeUserId);

    });

    it('fetches the record from Twitter if the record does not exist in DB', async () => {
      let id = await UsersBl.getTwitterId(screen_name);
      expect(id).to.be.equal(twitter_id);
    })

  });
});
