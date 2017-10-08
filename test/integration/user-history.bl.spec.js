/* eslint-disable max-nested-callbacks */
const testLib = require('./../lib');
const _ = require('lodash');

const UserHistoryBL = require('./../../src/modules/user-history/user-history.bl');
const Lib = require('./../../src/lib');

describe('Integration => user-history.bl', () => {

  const mockUser = {
    twitter_id: 1,
    date_utc: Lib.startOfDayUtc(),
    friends_count: 2,
    statuses_count: 3,
    listed_count: 4,
    followers_count: 5
  };

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
    return UserHistoryBL.removeAll();
  });

  it('bl.upsert => successfully stores new records', () => {
    return UserHistoryBL.upsert(mockUser)
      .then(result => {
        expect(result.errors).to.not.exist;
        expect(result).to.exist;
        expect(result).to.have.property('twitter_id').to.be.equal(mockUser.twitter_id);
        expect(result).to.have.property('friends_count').to.be.equal(mockUser.friends_count);
        expect(result).to.have.property('followers_count').to.be.equal(mockUser.followers_count);
      });
  });

  it('bl.upsert => updates existing records by twitter_id + date', () => {
    return UserHistoryBL
      .upsert(mockUser)
      .then(() => {
        return UserHistoryBL
          .count()
          .then(result => {
            expect(result).to.be.equal(1);

            let updatedMockUser = _.clone(mockUser);
            updatedMockUser.followers_count = 10;

            return UserHistoryBL.upsert(updatedMockUser)
              .then(updatedResult => {
                expect(updatedResult).to.exist;
                expect(updatedResult).to.have.property('followers_count').to.equal(updatedMockUser.followers_count);
              });
          });
      });
  });

  it('bl.upsert => allows saving different users', () => {
    return UserHistoryBL
      .upsert(mockUser)
      .then(() => {
        return UserHistoryBL
          .count()
          .then(result => {
            expect(result).to.be.equal(1);

            let mockUser2 = _.clone(mockUser);
            mockUser2.twitter_id = 2;

            return UserHistoryBL.upsert(mockUser2)
              .then(updatedResult => {
                expect(updatedResult).to.exist;
                expect(updatedResult).to.have.property('twitter_id').to.equal(mockUser2.twitter_id);
                return UserHistoryBL.count()
                  .then(count => expect(count).to.be.equal(2));
              });
          });
      });
  });

  it('bl.upsert => allows saving two dates for one user', () => {
    return UserHistoryBL
      .upsert(mockUser)
      .then(() => {
        return UserHistoryBL
          .count()
          .then(result => {
            expect(result).to.be.equal(1);

            let mockUser2 = _.clone(mockUser);
            mockUser2.date_utc = mockUser2.date_utc.add(1, 'd');

            return UserHistoryBL.upsert(mockUser2)
              .then(updatedResult => {
                expect(updatedResult).to.have.property('twitter_id').to.equal(mockUser2.twitter_id);
                return UserHistoryBL.count()
                  .then(count => expect(count).to.be.equal(2));
              });
          });
      });
  });

  it('bl.count => returns the number of user-history items (by default 0)', () => {
    return UserHistoryBL.count()
      .then(count => expect(count).to.be.equal(0));
  });

  it('bl.count => returns the number of user-history items', () => {
    return UserHistoryBL
      .upsert(mockUser)
      .then(() => {
        return UserHistoryBL
          .count()
          .then(count => expect(count).to.be.equal(1));
      });
  });

});
