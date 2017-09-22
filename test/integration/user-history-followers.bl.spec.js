const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');
const _ = require('lodash');
const moment = require('moment');

const UserHistoryFollowersBL = require('./../../src/modules/user-history-followers/user-history-followers.bl');
const Lib = require('./../../src/lib');

describe('Integration => user-history-followers.bl', () => {

  const mockData = {
    twitter_id: 1,
    follower_id: 2
  };
  const mockNoise = {
    twitter_id: 2,
    follower_id: 3
  };

  const appServer = new AppServer(testConfig);
  before(() => {
    return appServer.start();
  });

  after(() => {
    return appServer.stop();
  });

  beforeEach(() => {
    return UserHistoryFollowersBL.removeAll();
  });

  it('bl.upsertFollower => Inserts a new twitter_id <> follower_id combination', () => {
    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then(result => {
        expect(result).to.exist;
        expect(result.errors).to.be.undefined;
        expect(result).to.have.property('twitter_id').to.be.equal(mockData.twitter_id);
        expect(result).to.have.property('follower_id').to.be.equal(mockData.follower_id);
        expect(result).to.have.property('start_date');
        expect(result).to.have.property('end_date').to.be.null;
        expect(result).to.have.property('last_check').to.be.a('date');
      });
  });

  it('bl.upsertFollowers => start_date is always top of the day', () => {
    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then(result => {
        expect(moment(result.start_date).utc().hours()).to.be.equal(0);
        expect(moment(result.start_date).utc().minutes()).to.be.equal(0);
        expect(moment(result.start_date).utc().seconds()).to.be.equal(0);
        expect(result).to.have.property('end_date').to.be.null;
      });
  });

  it('bl.upsertFollower => Updates last_check if already existing for the given twitter_id & follower_id combination', () => {
    let lastCheck1 = null;
    let lastCheck2 = null;
    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, mockData))
      .then(docs => {
        lastCheck1 = docs.last_check;
      })
      .then(UserHistoryFollowersBL.count)
      .then(count => expect(count).to.be.equal(1))

      // Save the same again, just to trigger to update last_check
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, mockData))
      .then(UserHistoryFollowersBL.getHistory.bind(null, mockData))
      .then(docs => {
        expect(docs).to.be.of.length(1);
        lastCheck2 = docs[0].last_check;
        expect(moment(lastCheck2).isAfter(moment(lastCheck1))).to.be.true;
      });
  });

  it('bl.upsertFollower => Removing a follower will set the end_date', () => {
    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then(UserHistoryFollowersBL.removeFollower.bind(null, mockData))
      .then(doc => {
        expect(doc).to.have.property('end_date').to.not.be.null;
      });
  });

  it('bl.upsertFollower => Inserts a new record if the old one has been ended', () => {
    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then(UserHistoryFollowersBL.removeFollower.bind(null, mockData));
  });

  // Todo: Check: Is this really finished?
  it('bl.upsertFollower => Only updates last_check on docs without an end_date', () => {

    let lastCheck1 = null;
    let lastCheck2 = null;

    return UserHistoryFollowersBL
      .upsertFollower(mockData)
      .then()
      .then(UserHistoryFollowersBL.removeFollower.bind(null, mockData))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, mockData))
      .then(doc => {
        lastCheck1 = doc.last_check;
      })
      .then(UserHistoryFollowersBL.count)
      .then(count => expect(count).to.be.equal(2))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, mockData))
      .then(UserHistoryFollowersBL.getHistory.bind(null, mockData))
      .then(() => {
        let mockData2 = _.clone(mockData);
        return UserHistoryFollowersBL.upsertFollower(mockData2)
          .then(doc => {
            expect(doc).to.exist;
          });
      });
  });

  /**
   * Stress test the solution with a real world scenario ...
   *
   * @description
   *
   * - user:1 is followed by follower:2
   * - user:1 is followed by follower:3
   *
   * - user:2 is followed by follower:10
   * - user:2 is followed by follower:11
   * - user:2 is unfollowed by follower:10
   * - user:2 is followed by follower: 10 (re-follow scenario => should be a new record)
   *
   * - user:3 is followed by follower:20
   * - user:3 is followed by follower:21
   * - user:3 is unfollowed by follower:20
   * - user:3 is followed by follower:20
   * - user:3 is followed by follower:22
   *
   * Result:
   * -> user:1 should have active followers: 1
   * -> user:1 should have unfollowers: 0
   *
   * -> user:2 should have active followers: 2
   * -> user:2 should have unfollowers: 0
   *
   * -> user:3 should have active followers: 3
   * -> user:3 should have unfollowers: 0
   *
   * -> We should have records in total: 5
   *
   */
  it('OK, let\'s stress test it ...', () => {

    return UserHistoryFollowersBL
      .upsertFollower({twitter_id: 1, follower_id: 1})

      // User:1
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 1, follower_id: 3}))

      // User:2
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 2, follower_id: 10}))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 2, follower_id: 11}))
      .then(UserHistoryFollowersBL.removeFollower.bind(null, {twitter_id: 2, follower_id: 10}))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 2, follower_id: 10}))

      // User: 3
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 3, follower_id: 20}))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 3, follower_id: 21}))
      .then(UserHistoryFollowersBL.removeFollower.bind(null, {twitter_id: 3, follower_id: 20}))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 3, follower_id: 20}))
      .then(UserHistoryFollowersBL.upsertFollower.bind(null, {twitter_id: 3, follower_id: 22}))

      // Validation user:1
      .then(UserHistoryFollowersBL.getActiveFollowers.bind(null, 1))
      .then(docs => expect(docs).to.be.of.length(2))
      .then(UserHistoryFollowersBL.getUnFollowers.bind(null, 1))

      // Validation user:2
      .then(UserHistoryFollowersBL.getActiveFollowers.bind(null, 2))
      .then(docs => expect(docs).to.be.of.length(2))
      .then(UserHistoryFollowersBL.getUnFollowers.bind(null, 2))

      // Validation user:3
      .then(UserHistoryFollowersBL.getActiveFollowers.bind(null, 3))
      .then(docs => expect(docs).to.be.of.length(3))
      .then(UserHistoryFollowersBL.getUnFollowers.bind(null, 3))
      .then(docs => expect(docs).to.be.of.length(0))

      // Records in total
      .then(UserHistoryFollowersBL.count)
      .then(count => expect(count).to.be.equal(5));
  });

});
