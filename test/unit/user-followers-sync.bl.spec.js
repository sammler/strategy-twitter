const UserFollowersSyncBl = require('./../../src/modules/user-followers-sync/user-followers-sync.bl');
const UsersBl = require('./../../src/modules/users/users.bl');
const sample = require('./../config/sample');

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

    it('if user_id is not passed, getTwitterId is called', async () => {

      let spy_ensureUserId = sinon.spy(UserFollowersSyncBl, 'ensureUserId');
      let stub_getTwitterId = sinon.stub(UsersBl, 'getTwitterId').resolves(sample.id);
      let stub_getTwitFollwersIds = sinon.stub(UsersBl, 'getTwitFollowersIds').resolves(require('./fixtures/followers.cursor-0'));

      const opts = {
        screen_name: sample.screen_name
      };
      let result = await UserFollowersSyncBl.syncUserFollowers(opts);

      stub_getTwitterId.restore();
      stub_getTwitFollwersIds.restore();

      expect(spy_ensureUserId).to.be.calledOnce;
      expect(result).to.exist;
      expect(result.opts).to.exist;
      expect(result.opts).to.have.property('user_id').to.be.equal(sample.id);

    });

    xit('if the rate-limit is hit for getTwitterId, status will be error-rate-limit-hit', async () => {

    });

    xit('if the rate-limit', async () => {

    });

  });

});
