const UserSyncSubscriber = require('./../../src/modules/user-sync/user-sync.subscriber');
const UserSyncBl = require('./../../src/modules/user-sync/user-sync.bl');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe.only('UNIT => user-sync.subscriber', () => {

  it('has some required methods', () => {
    expect(UserSyncSubscriber).to.have.a.property('init').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('listener').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('subscriber').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_publishEvents').to.be.a('function');
    expect(UserSyncSubscriber).to.have.a.property('_publishNextSteps').to.be.a('function');
  });

  it('init calls the subscriber', () => {
    let spySubscriber = sinon.stub(UserSyncSubscriber, 'subscriber');
    UserSyncSubscriber.init();

    spySubscriber.restore();
    expect(spySubscriber).to.be.calledOnce;
  });

  describe('listener', () => {

    it('should publish to event-log for any result', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'no-action', user: {screen_name: 'foo', twitter_id: 1}});
      let spyEvent = sinon.stub(UserSyncSubscriber, '_publishEvents');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;

    });

    it('should publish to event-log in case an error is thrown', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').throws();
      let spyEvent = sinon.stub(UserSyncSubscriber, '_publishEvents');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;
    });

    it('in case of `updated` the next steps will be published', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'updated', user: {screen_name: 'foo', twitter_id: 1}});
      let spyEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let spyNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);
      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvents.restore();
      spyNextSteps.restore();
      expect(spyEvents).to.be.calledOnce;
      expect(spyNextSteps).to.be.calledOnce;

    });

    it('in case of `created` the next steps will be published', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'created', user: {screen_name: 'foo', twitter_id: 1}});
      let spyEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let spyNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);
      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvents.restore();
      spyNextSteps.restore();
      expect(spyEvents).to.be.calledOnce;
      expect(spyNextSteps).to.be.calledOnce;

    });

    it('in case of `no-action` no new event will be published', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'no-action', user: {screen_name: 'foo', twitter_id: 1}});
      let spyEvents = sinon.stub(UserSyncSubscriber, '_publishEvents').resolves();
      let spyNextSteps = sinon.stub(UserSyncSubscriber, '_publishNextSteps').resolves(true);
      await UserSyncSubscriber.listener({screen_name: 'foo'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvents.restore();
      spyNextSteps.restore();
      expect(spyEvents).to.be.calledOnce;
      expect(spyNextSteps).to.not.be.called;
    });

    // Todo: First multiple steps has to be published.
    xit('multiple next steps were published', async () => {

    });
  });

});
