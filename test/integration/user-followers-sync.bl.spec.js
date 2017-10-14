const _ = require('lodash');
const moment = require('moment');

const UsersBl = require('./../../src/modules/users/users.bl');
const UserFollowersSyncBl = require('./../../src/modules/user-followers-sync/user-followers-sync.bl');

const screen_name = 'waltherstefan';
const twitter_id = 17390290;

describe.only('INTEGRATION => user-followers-sync.bl', () => {

  it('has the required functions', () => {
    expect(UserFollowersSyncBl).to.have.a.property('syncUserFollowers').to.be.a('function');
  });

  describe('syncUserFollowers', () => {

    it('fetches only one record - as defined in params', async () => {

      let result = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, user_id: twitter_id, count: 1});
      expect(result.data.ids).to.be.of.length(1);

    });

    xit('works with the param.twitter_id (fetched from Twitter)', async () => {

    });

    it('works with a missing param.twitter_id (fetched from DB)', async () => {

      let result = await UserFollowersSyncBl.syncUserFollowers({screen_name: screen_name, count: 1});
      expect(result.data.ids).to.be.of.length(1);
    });

  });

});
