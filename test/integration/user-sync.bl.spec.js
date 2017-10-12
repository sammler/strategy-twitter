const testLib = require('./../lib');
const UsersBL = require('./../../src/modules/users/users.bl');
const UserSyncBL = require('./../../src/modules/user-sync/user-sync.bl');
const lib = require('./../../src/lib/index');
const moment = require('moment');

describe.only('INTEGRATION => user-sync.bl', () => {

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

  it('returns a new user if none is stored', async () => {
    const screen_name = 'waltherstefan';
    let result = await UserSyncBL.syncUser({screen_name});
    expect(result.user).to.exist;
    expect(result.user).to.have.a.property('twitter_id').to.not.be.null;
    expect(result.user).to.have.a.property('screen_name').to.be.equal(screen_name);
    expect(result.user).to.have.a.property('profile').to.contain({screen_name: screen_name});
    expect(result.user).to.have.a.property('last_sync_utc_ts').to.not.be.null;
    expect(result.status).to.be.equal('created');
  });

  it('updates an existing user if one is stored and older than 24hrs', async () => {

    const screen_name = 'waltherstefan';
    const twitter_id = 17390290;

    let usr = {
      screen_name,
      twitter_id,
      last_sync_utc_ts: moment().subtract(25, 'hours').utc(),
      profile: {
        foo: 'bar'
      }
    };

    let user = await UsersBL.upsert(usr);
    expect(user).to.have.property('screen_name').to.equal(screen_name);
    expect(user).to.have.property('twitter_id').to.equal(twitter_id);

    let result = await UserSyncBL.syncUser({screen_name});
    expect(result.status).to.be.equal('updated');

    let count = await UsersBL.count();
    expect(count).to.equal(1);

    expect(result.user).to.exist;
    expect(result.user).to.have.a.property('screen_name').to.equal(screen_name);
    expect(result.user).to.have.a.property('twitter_id').to.equal(twitter_id);
    expect(result.user).to.have.a.property('profile').to.contain({screen_name});

  });

  it('doesn\'t do anything if there is a user, not older thant 24hrs', async () => {

    const screen_name = 'waltherstefan';
    const twitter_id = 17390290;

    let usr = {
      screen_name,
      twitter_id,
      last_sync_utc_ts: lib.nowUtc(),
      profile: {
        foo: 'bar'
      }
    };
    let user = await UsersBL.upsert(usr);
    expect(user).to.have.property('screen_name').to.equal(screen_name);
    expect(user).to.have.property('twitter_id').to.equal(twitter_id);

    let result = await UserSyncBL.syncUser({screen_name});
    expect(result.status).to.be.equal('no-action');
    expect(result.user).to.exist;
    expect(result.user).to.have.a.property('screen_name').to.equal(screen_name);
    expect(result.user).to.have.a.property('twitter_id').to.equal(twitter_id);

  });
});
