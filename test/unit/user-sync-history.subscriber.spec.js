const UserHistoryBl = require('./../../src/modules/user-history/user-history.bl');
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

  it('', async () => {
    expect(false).to.be.true;
  });

  it('', async () => {
    expect(false).to.be.true;
  });

});
