const UserSyncSubscriber = require('./../../src/modules/user-sync/user-sync.subscriber');
const UserSyncBl = require('./../../src/modules/user-sync/user-sync.bl');

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
  });

  it('init calls the subscriber', () => {
    let spy = sinon.stub(UserSyncSubscriber, 'subscriber');
    UserSyncSubscriber.init();

    spy.restore();
    expect(spy).to.be.calledOnce;
  });

  describe('listener', () => {

    it('should publish to event-log for any result', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').resolves({status: 'no-action', user: { screen_name: 'foo'}});
      let spyEvent = sinon.stub(UserSyncSubscriber, '_publishEvents');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlation_id: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;

    });

    it('should publish to event-log in case an error is thrown', async () => {

      let spy = sinon.stub(UserSyncBl, 'syncUser').throws();
      let spyEvent = sinon.stub(UserSyncSubscriber, '_publishEvents');
      await UserSyncSubscriber.listener({screen_name: 'waltherstefan'}, {properties: {correlation_id: '123'}});

      spy.restore();
      spyEvent.restore();
      expect(spyEvent).to.be.calledOnce;
    });

    it('in case of `updated` or `created` the next steps will be published', () => {

    });

    it('in case of `no-action` no new event will be published', () => {

    })
  });


});
