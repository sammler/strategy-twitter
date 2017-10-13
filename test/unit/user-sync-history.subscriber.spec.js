const UserHistoryBl = require('./../../src/modules/user-history/user-history.bl');
const UserHistorySyncBl = require('./../../src/modules/user-history-sync/user-history-sync.bl');
const UserHistorySyncSubscriber = require('./../../src/modules/user-history-sync/user-history-sync.subscriber');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.expect();
chai.use(sinonChai);

describe.only('UNIT => user-sync.subscriber', () => {

  it('has some required methods', () => {
    expect(UserHistorySyncSubscriber).to.have.a.property('init').to.be.a('function');
    expect(UserHistorySyncSubscriber).to.have.a.property('listener').to.be.a('function');
    expect(UserHistorySyncSubscriber).to.have.a.property('subscriber').to.be.a('function');
    expect(UserHistorySyncSubscriber).to.have.a.property('_publishEvents').to.be.a('function');
    expect(UserHistorySyncSubscriber).to.have.a.property('_publishNextSteps').to.be.a('function');
  });

  it('init calls the subscriber', () => {
    let spySubscriber = sinon.stub(UserHistorySyncSubscriber, 'subscriber');
    UserHistorySyncSubscriber.init();

    spySubscriber.restore();
    expect(spySubscriber).to.be.calledOnce;
  });

  describe('listener', () => {

    it('should publish to event-log for any result', async () => {

      let spy = sinon.stub(UserHistorySyncBl, 'syncUserHistory').resolves({status: 'foo', user: {screen_name: 'foo', twitter_id: 1}});
      let spyEvent = sinon.stub(UserHistorySyncSubscriber, '_publishEvents');
      await UserHistorySyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;

    });

    it('should publish to event-log in case an error is thrown', async () => {

      let spy = sinon.stub(UserHistorySyncBl, 'syncUserHistory').throws();
      let spyEvent = sinon.stub(UserHistorySyncSubscriber, '_publishEvents');
      await UserHistorySyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;
    });

    it.only('in case of result === `fetch`, next steps will be triggered', async () => {

      let spy = sinon.stub(UserHistorySyncBl, 'syncUserHistory').resolves({status: 'fetch', user_history: {screen_name: 'foo'}});
      let spyEvent = sinon.stub(UserHistorySyncSubscriber, '_publishEvents');
      let spyNextSteps = sinon.stub(UserHistorySyncSubscriber, '_publishNextSteps');
      await UserHistorySyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      spyNextSteps.restore();
      expect(spyEvent).to.be.calledOnce;
      expect(spyNextSteps).to.be.calledOnce;

    });

    it.only('in case of result === `user_existing_rec`, next steps will be triggered', async () => {

      let spy = sinon.stub(UserHistorySyncBl, 'syncUserHistory').resolves({status: 'fetch', user_history: {screen_name: 'foo'}});
      let spyEvent = sinon.stub(UserHistorySyncSubscriber, '_publishEvents');
      let spyNextSteps = sinon.stub(UserHistorySyncSubscriber, '_publishNextSteps');
      await UserHistorySyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

      spy.restore();
      spyEvent.restore();
      spyNextSteps.restore();
      expect(spyEvent).to.be.calledOnce;
      expect(spyNextSteps).to.be.calledOnce;

    });

  });

  it('in case of `user_existing_rec` or `fetch`, the next steps are triggered', async () => {

    let spy = sinon.stub(UserHistorySyncBl, 'syncUserHistory').resolves({status: 'fetch', user_history: {screen_name: 'foo'}});
    let spyEvent = sinon.stub(UserHistorySyncSubscriber, '_publishEvents');
    let spyNextSteps = sinon.stub(UserHistorySyncSubscriber, '_publishNextSteps');
    await UserHistorySyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlationId: '123'}});

    spy.restore();
    spyEvent.restore();
    spyNextSteps.restore();
    expect(spyEvent).to.be.calledOnce;
    expect(spyNextSteps).to.be.calledOnce;
  });

});
