const UserSyncSubscriber = require('./../../src/modules/user-sync/user-sync.subscriber');
const UserSyncBl = require('./../../src/modules/user-sync/user-sync.bl');
const UsersBl = require('./../../src/modules/users/users.bl');
const RateLimitStatus = require('./../../src/modules/rate-limit-status/rate-limit-status.bl');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe('UNIT => user-sync.bl', () => {

  describe('snycUser', () => {

    it('mocking of UsersBL.getTwitUpdateUser works', async () => {
      let spyUsersBl_get = sinon.stub(UsersBl, 'get').resolves();
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').resolves(require('./fixtures/twit-user.success.json'));
      let spyUsersBlUpsert = sinon.stub(UsersBl, 'upsert').resolves();

      await UserSyncBl.syncUser({screen_name: 'foo'});

      spyUsersBl_get.restore();
      spyUsersBl_getTwitUser.restore();
      spyUsersBlUpsert.restore();
      expect(spyUsersBl_getTwitUser).to.be.calledOnce;
      expect(spyUsersBlUpsert).to.be.calledOnce;
    });

    it('if there is no user stored, a new user will be fetched', async () => {
      let spyUsersBl_get = sinon.stub(UsersBl, 'get').resolves();
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').resolves(require('./fixtures/twit-user.success.json'));
      let spyUsersBlUpsert = sinon.stub(UsersBl, 'upsert').resolves();

      let result = await UserSyncBl.syncUser({screen_name: 'foo'});

      spyUsersBl_get.restore();
      spyUsersBl_getTwitUser.restore();
      spyUsersBlUpsert.restore();

      expect(result).to.exist;
      // console.log(result);
      expect(result).to.have.a.property('status').to.be.equal('created');
      expect(result).to.have.a.property('errors').to.be.null;
      expect(result).to.have.a.property('user'); // Todo: check the user here

    });

    it('if the user record is too old, the user will be udpated', async () => {

      let spyUsersBl_get = sinon.stub(UsersBl, 'get').resolves(require('./fixtures/user-old.json'));
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').resolves(require('./fixtures/twit-user.success.json'));
      let spyUsersBlUpsert = sinon.stub(UsersBl, 'upsert').resolves();

      let result = await UserSyncBl.syncUser({screen_name: 'foo'});

      spyUsersBl_get.restore();
      spyUsersBl_getTwitUser.restore();
      spyUsersBlUpsert.restore();

      expect(result).to.exist;
      expect(result).to.have.a.property('status').to.be.equal('updated');
      expect(result).to.have.a.property('errors').to.be.null;
      expect(result).to.have.a.property('user'); // Todo: check the user here

    });

    it('returns an error if the rate-limit is hit (in case of update)', async () => {

      let spyUsersBl_get = sinon.stub(UsersBl, 'get').resolves();
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').rejects(require('./fixtures/twit-user.rate-limit-hit.json'));
      let spyUsersBlUpsert = sinon.stub(UsersBl, 'upsert').resolves();

      let result = await UserSyncBl.syncUser({screen_name: 'foo'});

      spyUsersBl_get.restore();
      spyUsersBl_getTwitUser.restore();
      spyUsersBlUpsert.restore();

      expect(result).to.exist;
      expect(result).to.have.a.property('status').to.be.equal('error-rate-limit-hit');
      expect(result).to.have.a.property('errors').to.not.be.null;
      expect(result.errors).to.deep.contain({
        code: 88,
        message: 'Rate limit exceeded'
      });
    });

  });

  describe('_twitUpdateUser', () => {

    it('throws an error if the rate-limit is hit', async () => {

      const screen_name = 'waltherstefan';
      const fixture = require('./fixtures/twit-user.rate-limit-hit.json');
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').resolves(fixture);

      try {
        await UserSyncBl._twitUpdateUser(screen_name);
      } catch (ex) {
        expect(ex).to.exist;
        expect(ex).to.deep.equal([{message: 'Rate limit exceeded', code: 88}]);
      } finally {
        spyUsersBl_getTwitUser.restore();
      }
    });

    it('returns a user if the rate-limit is not hit', async () => {

      const screen_name = 'waltherstefan';
      const fixture = require('./fixtures/twit-user.success.json');
      let spyUsersBl_getTwitUser = sinon.stub(UsersBl, 'getTwitUser').resolves(fixture);
      let spyUsersBl_upsert = sinon.stub(UsersBl, 'upsert').resolves();

      try {
        await UserSyncBl._twitUpdateUser(screen_name);
      } catch (ex) {
        expect(ex).to.not.exist;
      } finally {
        spyUsersBl_upsert.restore();
        spyUsersBl_getTwitUser.restore();
      }

      expect(spyUsersBl_upsert).to.be.calledOnce;

    });
  });

  // Do not enable this, basically just created this to get the proper error message ...
  xit('Let\'s hit the rate limit for /users/show/:id', async () => {

    const screen_name = 'qlik';
    const query = {resources: 'users'};
    let result = null;
    let rateLimitStatus = await RateLimitStatus.getTwitRateLimitStatus(query);
    let remaining = rateLimitStatus.resources.users['/users/show/:id'].remaining;

    for (let i = 0; i < remaining; i++) {
      // console.log('i', i);
      result = await UsersBl.getTwitUser({screen_name});
      expect(result).to.exist;
      expect(result).to.have.property('data');
      expect(result.data.errors).to.not.exist;
    }

    result = await UsersBl.getTwitUser({screen_name});
    rateLimitStatus = await RateLimitStatus.getTwitRateLimitStatus(query);

    expect(result).to.exist;
    expect(result.data).to.exist;
    expect(result.data.errors).to.exist;

    expect(rateLimitStatus).to.exist;
    expect(rateLimitStatus.resources).to.exist;
    expect(rateLimitStatus.resources).to.have.property('users');
    expect(rateLimitStatus.resources.users).to.have.property('/users/show/:id').to.have.property('remaining').to.be.equal(0);

  });

});
