const UserFollowersSyncSubscriber = require('./../../src/modules/user-followers-sync/user-followers-sync.subscriber');
const UserFollowersSyncBl = require('./../../src/modules/user-followers-sync/user-followers-sync.bl');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe('UNIT => user-history-followers.subscriber', () => {

  it('has some required methods', () => {
    expect(UserFollowersSyncSubscriber).to.have.a.property('init').to.be.a('function');
    expect(UserFollowersSyncSubscriber).to.have.a.property('listener').to.be.a('function');
    expect(UserFollowersSyncSubscriber).to.have.a.property('subscriber').to.be.a('function');
    expect(UserFollowersSyncSubscriber).to.have.a.property('_publishEvents').to.be.a('function');
    expect(UserFollowersSyncSubscriber).to.have.a.property('_publishNextSteps').to.be.a('function');
    expect(UserFollowersSyncSubscriber).to.have.a.property('_validateMsg').to.be.a('function');
  });

  it('init calls the subscriber', () => {

    let spySubscriber = sinon.stub(UserFollowersSyncSubscriber, 'subscriber');
    UserFollowersSyncSubscriber.init();
    spySubscriber.restore();

    expect(spySubscriber).to.be.calledOnce;
  });

  describe('_validateMsg', () => {

    it('validates all required params', () => {
      try {
        UserFollowersSyncSubscriber._validateMsg({screen_name: 'foo', next_cursor: -1, count: 1}, {properties: {correlationId: 1}});
      } catch (err) {
        expect(err).to.not.exist;
      }
    });

    it('throws an error if required params are missing', () => {
      try {
        UserFollowersSyncSubscriber._validateMsg({}, {});
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe('listener', () => {

    it('should publish to event-log for any result', async () => {

      let spy = sinon.stub(UserFollowersSyncBl, 'syncUserFollowers').resolves();
      let spyEvents = sinon.stub(UserFollowersSyncSubscriber, '_publishEvents');
      await UserFollowersSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvents.restore();
      expect(spyEvents).to.be.calledOnce;

    });

    it('should publish an error in any case', async () => {

      let spy = sinon.stub(UserFollowersSyncBl, 'syncUserFollowers').throws();
      let spyError = sinon.stub(UserFollowersSyncSubscriber, '_publishError');
      await UserFollowersSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyError.restore();
      expect(spyError).to.be.calledOnce;
    });

  });

  describe('subscriber', () => {

    xit('', async () => {
      expect(false).to.be.true;
    });

  });

});
