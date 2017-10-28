const UserFollowersSyncBl = require('./../../src/modules/user-followers-sync/user-followers-sync.bl');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe('USER-FOLLOWERS_SYNC.BL', () => {

  it('should have the required methods', () => {
    expect(UserFollowersSyncBl).to.have.a.property('syncUserFollowers').to.be.a('function');
    expect(UserFollowersSyncBl).to.have.a.property('ensureUserId').to.be.a('function');
  });

  describe('syncUserFollowers => ', () => {

    xit('if user_id is not passed, getTwitterId is called', async () => {

      const opts = {
        screen_name: 'waltherstefan'
      };
      UserFollowersSyncBl.syncUserFollowers(opts);

    });

    xit('if the rate-limit is hit for getTwitterId, an error will be thrown', async () => {

    });

  });

});
