const testLib = require('./../lib');

const UserHistorySyncBL = require('./../../src/modules/user-history-sync/user-history-sync.bl');
const UserHistoryBL = require('./../../src/modules/user-history/user-history.bl');
const UsersBL = require('./../../src/modules/users/users.bl');
const moment = require('moment');

const screen_name = 'waltherstefan';
const twitter_id = 17390290;

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

  beforeEach(async () => {
    await UsersBL.removeAll();
    await UserHistoryBL.removeAll();
  });

  it('takes the existing user record, if this is not older than 24hrs', async () => {

    // Add one record, not older than 24hrs
    const usr = {
      screen_name,
      twitter_id,
      last_sync_utc_ts: moment().subtract(1, 'hours').utc(),
      profile: {
        friends_count: -1,
        statuses_count: -1,
        listed_count: -1,
        followers_count: -1
      },
    };

    // First insert the reference record
    let user = await UsersBL.upsert(usr);

    // Sync UserHistory, the record should be taken, nothing else
    let userHistoryResult = await UserHistorySyncBL.syncUserHistory({screen_name});
    expect(userHistoryResult).to.exist;
    expect(userHistoryResult).to.have.a.property('status').to.be.a('string');
    expect(userHistoryResult).to.have.a.property('user_history').to.be.an('object');
    expect(userHistoryResult.user_history).to.have.a.property('twitter_id').to.be.equal(twitter_id);

    // Here is the check, whether a new rec has been fetched or not
    expect(userHistoryResult.status).to.be.equal('use_existing_rec');
    expect(userHistoryResult.user_history).to.have.a.property('friends_count').to.be.equal(usr.profile.friends_count);
    expect(userHistoryResult.user_history).to.have.a.property('statuses_count').to.be.equal(usr.profile.statuses_count);
    expect(userHistoryResult.user_history).to.have.a.property('listed_count').to.be.equal(usr.profile.listed_count);
    expect(userHistoryResult.user_history).to.have.a.property('followers_count').to.be.equal(usr.profile.followers_count);

  });

  it('still fetches a new record, if the user is not existing (should not happen, but ...)', async() => {

    // Sync UserHistory, the record should be taken, nothing else
    let userHistoryResult = await UserHistorySyncBL.syncUserHistory({screen_name});
    expect(userHistoryResult).to.exist;
    expect(userHistoryResult).to.have.a.property('status').to.be.a('string');
    expect(userHistoryResult).to.have.a.property('user_history').to.be.an('object');
    expect(userHistoryResult.user_history).to.have.a.property('twitter_id').to.be.equal(twitter_id);
    // Here is the check, whether a new rec has been fetched or not
    expect(userHistoryResult.status).to.be.equal('fetch');

    let userHistoryCount = await UserHistoryBL.count();
    expect(userHistoryCount).to.be.equal(1);
  });

  it('fetches a new record from twitter if the user is older than 24hrs', async () => {
    // Add one record, not older than 24hrs
    const usr = {
      screen_name,
      twitter_id,
      last_sync_utc_ts: moment().subtract(25, 'hours').utc(),
      profile: {
        friends_count: -1,
        statuses_count: -1,
        listed_count: -1,
        followers_count: -1
      }
    };

    // First insert the reference record
    let user = await UsersBL.upsert(usr);

    // Sync UserHistory, the record should be taken, nothing else
    let userHistoryResult = await UserHistorySyncBL.syncUserHistory({screen_name});
    expect(userHistoryResult).to.exist;
    expect(userHistoryResult).to.have.a.property('status').to.be.a('string');
    expect(userHistoryResult).to.have.a.property('user_history').to.be.an('object');
    expect(userHistoryResult.user_history).to.have.a.property('twitter_id').to.be.equal(twitter_id);
    // Here is the check, whether a new rec has been fetched or not
    expect(userHistoryResult.status).to.be.equal('fetch');
    expect(userHistoryResult.user_history).to.have.a.property('friends_count');

    let userHistoryCount = await UserHistoryBL.count();
    expect(userHistoryCount).to.be.equal(1);
  });


  // Todo: too generic, remove ...
  it('syncs the user history', async () => {
    const screen_name = 'waltherstefan';
    let userHistoryResult = await UserHistorySyncBL.syncUserHistory({screen_name: screen_name});
    expect(userHistoryResult).to.exist;
  });




});
