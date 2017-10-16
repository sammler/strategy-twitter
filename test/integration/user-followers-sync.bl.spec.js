const testLib = require('./../lib');
const _ = require('lodash');
const moment = require('moment');

const UsersBl = require('./../../src/modules/users/users.bl');
const UserFollowersSyncBl = require('./../../src/modules/user-followers-sync/user-followers-sync.bl');

const screen_name = 'waltherstefan';
const twitter_id = 17390290;

describe.only('INTEGRATION => user-followers-sync.bl', () => {

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


  it('has the required functions', () => {
    expect(UserFollowersSyncBl).to.have.a.property('syncUserFollowers').to.be.a('function');
  });

  describe('syncUserFollowers', () => {

    it('fetches only one record - as defined in params', async () => {

      let result = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, user_id: twitter_id, count: 1});
      expect(result.data.ids).to.exist;
      expect(result.data.next_cursor).to.exist;
      expect(result.data.ids).to.be.of.length(1);

    });

    it.only('fetching the next record doesn\'t needs the original count parameter', async() => {

      let first = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, user_id: twitter_id, count: 1});
      let second = await UserFollowersSyncBl.syncUserFollowers({user_id: twitter_id, next_cursor: first.data.next_cursor, count: 1});
      expect(second.data.errors, 'We have errors, potentially rate limit').to.not.exist;
      expect(second.data.ids).to.exist;
      expect(second.data.next_cursor).to.exist;
      expect(second.data.ids).to.be.of.length(1);

    });

    xit('works with the param.twitter_id (fetched from Twitter)', async () => {
      let result = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, count: 1});
      expect(result.data.ids).to.be.of.length(1);
    });

    xit('works with a missing param.twitter_id (fetched from DB)', async () => {

      let usr = {
        screen_name,
        twitter_id
      };
      await UsersBl.upsert(usr);
      let result = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, count: 1});
      expect(result.data.ids).to.be.of.length(1);
    });

  });

});
