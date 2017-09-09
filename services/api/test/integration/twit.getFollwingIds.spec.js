const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');

const UsersBL = require('./../../src/modules/users/users.bl');

describe('Integration => users', () => {

  const appServer = new AppServer(testConfig);
  before(() => {
    return appServer.start();
  });

  after(() => {
    return appServer.stop();
  });

  beforeEach(() => {
    return UsersBL.removeAll();
  });


  it('Get FollowerIDs - passed identity', () => {

    let twitUser = null;
    let expectedFollowersCount = 0;
    return UsersBL.getTwitUser({screen_name: 'waltherstefan'})
      .then(docs => {
        console.log('docs', docs);
        expect(docs).to.exist;
        twitUser = docs.data;
        expectedFollowersCount = twitUser.followers_count;
        return Promise.resolve(docs.data.id);
      })
      .then(user_id => {
        return UsersBL.getTwitFollowersIds({user_id: user_id})
      })
      .then(result => {
        console.log('--------');
        console.log('result', result);

        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data).to.have.a.property('ids');
        expect(result.data.ids).to.be.an('array');

        // Todo: OK, here we have a too optimistic test, because we are not testing an account with more than 5000 followers ...
        expect(result.data.ids).to.be.of.length(expectedFollowersCount);

      })
  })
});
