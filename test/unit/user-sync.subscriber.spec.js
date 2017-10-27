const UserSyncSubscriber = require('./../../src/modules/user-sync/user-sync.subscriber');
const UserSyncBl = require('./../../src/modules/user-sync/user-sync.bl');
const UsersBl = require('./../../src/modules/users/users.bl');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe('UNIT => user-sync.subscriber', () => {

  it('has some required methods', () => {
    expect(UserSyncSubscriber).to.have.a.property('init').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('listener').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('subscriber').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_publishEvents').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_publishNextSteps').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_publishError').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_validateMsg').to.be.a('function');
  });

  it('init calls the subscriber', () => {
    let stub_subscriber = sinon.stub(UserSyncSubscriber, 'subscriber');
    UserSyncSubscriber.init();

    stub_subscriber.restore();
    expect(stub_subscriber).to.be.calledOnce;
  });

  describe('_validateMsg', () => {

    it('validates all required params', () => {
      try {
        UserSyncSubscriber._validateMsg({screen_name: 'foo'}, {properties: {correlationId: 1}});
      } catch (err) {
        expect(err).to.not.exist;
      }
    });

    it('throws an error if required params are missing', () => {
      try {
        UserSyncSubscriber._validateMsg({}, {});
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });


  describe('listener', () => {

    it('should publish to event-log for any result', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'no-action', user: {screen_name: 'foo', twitter_id: 1}});
      let stub_publishEvents = sinon.stub(UserSyncSubscriber, '_publishEvents');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishEvents.restore();
      expect(stub_publishEvents).to.be.calledOnce;

    });

    it('should publish to event-log in case an error is thrown', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').throws();
      let stub_publishError = sinon.stub(UserSyncSubscriber, '_publishError');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishError.restore();
      expect(stub_publishError).to.be.calledOnce;
    });

    it('in case of `updated` the next steps will be published', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'updated', user: {screen_name: 'foo', twitter_id: 1}});
      let stub_publishEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let stub_publishNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);

      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishEvents.restore();
      stub_publishNextSteps.restore();

      expect(stub_publishEvents).to.be.calledOnce;
      expect(stub_publishNextSteps).to.be.calledOnce;

    });

    it('in case of `created` the next steps will be published', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'created', user: {screen_name: 'foo', twitter_id: 1}});
      let stub_publishEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let stub_publishNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);

      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishEvents.restore();
      stub_publishNextSteps.restore();

      expect(stub_publishEvents).to.be.calledOnce;
      expect(stub_publishNextSteps).to.be.calledOnce;
    });

    it('in case of `no-action` no new event will be published', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'no-action', user: {screen_name: 'foo', twitter_id: 1}});
      let stub_publishEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let stub_publishNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);

      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishEvents.restore();
      stub_publishNextSteps.restore();

      expect(stub_publishEvents).to.be.calledOnce;
      expect(stub_publishNextSteps).to.not.be.called;
    });

    // Todo: First multiple steps has to be published.
    xit('multiple next steps were published', async () => {

    });

    it.only('if the rate-limit is hit, a delayed msg will be published', async () => {

      let stub_syncUser = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'error-rate-limit-hit', user: {screen_name: 'foo', twitter_id: 1}});
      let stub_publishEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let stub_publishRetry = sinon.stub(UserSyncSubscriber, '_publishRetry').resolves();
      let stub_publishNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps');
      let stub_publishError = sinon.stub(UserSyncSubscriber, '_publishError');

      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      stub_syncUser.restore();
      stub_publishEvents.restore();
      stub_publishNextSteps.restore();
      stub_publishRetry.restore();
      stub_publishError.restore();

      expect(stub_publishNextSteps).to.not.be.called;
      expect(stub_publishRetry).to.be.calledOnce;
      expect(stub_publishError).to.not.be.called;

    });
  });

});
