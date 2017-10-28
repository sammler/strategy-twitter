const testLib = require('./../lib');
const UsersBl = require('./../../src/modules/users/users.bl');
const sample = require('./../config/sample');

const Twit = require('twit');
const defaultTwitterConfig = require('./../../src/config/twitter-config');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

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

  it('bl.getTwitUser gets the user', async () => {
    const screen_name = 'waltherstefan';
    let result = await UsersBl.getTwitUser({screen_name});
    expect(result).to.exist;
    expect(result).to.have.a.property('data').to.be.an('object');
    expect(result.data).to.have.a.property('screen_name').to.equals(screen_name);
    expect(result).to.have.a.property('resp').to.be.an('object');
    expect(result.resp.statusCode).to.be.equal(200);
  });

  describe('bl.upsert', () => {

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
  });

  describe('getTwitFollowersIdsTillEnd ==>', async () => {

    // !!! Should not run, this is only to verify the fixture
    xit('fetches followers', async () => {

      const opts = {
        screen_name: sample.screen_name,
        user_id: sample.id
      };

      let result = await UsersBl.getTwitFollowersIdsTillEnd(opts);
      if (result.resp.headers['x-rate-limit-remaining'] === '0') {
        // console.log(result);
        console.log(result.data);
      }
      expect(result.data).to.exist;
      expect(result.data).to.have.a.property('ids').to.be.an('array');
      expect(result.data).to.have.a.property('next_cursor');
      expect(result.data).to.have.a.property('next_cursor_str');
      expect(result.data).to.have.a.property('previous_cursor');
      expect(result.data).to.have.a.property('previous_cursor_str');
      expect(result).to.have.a.property('resp');
      expect(result.resp).to.have.a.property('headers');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-limit');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-remaining');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-reset');
      // console.log('remaining', result.resp.headers['x-rate-limit-remaining']);

    });

    // Todo: Move to unit tests
    it('check the fixture for followers', () => {
      let result = require('./../unit/fixtures/followers.cursor-0.json');
      expect(result.data).to.exist;
      expect(result.data).to.have.a.property('ids').to.be.an('array');
      expect(result.data).to.have.a.property('next_cursor');
      expect(result.data).to.have.a.property('next_cursor_str');
      expect(result.data).to.have.a.property('previous_cursor');
      expect(result.data).to.have.a.property('previous_cursor_str');
      expect(result).to.have.a.property('resp');
      expect(result.resp).to.have.a.property('headers');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-limit');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-remaining');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-reset');
    });

    // Todo: Move to unit tests
    it('check the fixture for followers if the rate limit is hit', () => {
      let result = require('./../unit/fixtures/followers.rate-limit-hit.json');
      expect(result.data).to.exist;
      expect(result.data).to.not.have.a.property('ids');
      expect(result.data).to.not.have.a.property('next_cursor');
      expect(result.data).to.not.have.a.property('next_cursor_str');
      expect(result.data).to.not.have.a.property('previous_cursor');
      expect(result.data).to.not.have.a.property('previous_cursor_str');
      expect(result).to.have.a.property('resp');
      expect(result.resp).to.have.a.property('headers');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-limit');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-remaining');
      expect(result.resp.headers).to.have.a.property('x-rate-limit-reset');
    });

    // Todo: Move to unit tests
    it('returns a result - without doing anything', async () => {

      let twit = new Twit(defaultTwitterConfig);
      let stub = sinon.stub(twit, 'get').resolves();

      const opts = {
        user_id: sample.id
      };

      let result = await UsersBl.getTwitFollowersIdsTillEnd(opts);

      stub.restore();

      // console.log('result', result);
      expect(result).to.have.a.property('ids');
      expect(result).to.have.a.property('next_cursor').to.be.equal(0);
      expect(result).to.have.a.property('errors').to.be.an('array').to.be.of.length(0);
    });

    // This should NOT be enabled, really just here for development/debugging purposes
    it('returns a result with count === 1', async () => {

      const opts = {
        user_id: sample.id,
        count: 1

      };

      let result = await UsersBl.getTwitFollowersIdsTillEnd(opts);

      expect(result).to.exist;
      expect(result).to.have.a.property('ids').to.be.of.length(1);

    });

  });

  describe('getTwitterId', () => {

    const screen_name = sample.screen_name;
    const twitter_id = sample.id;

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
    });

  });
});
