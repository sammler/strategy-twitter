const MsgTopology = require('./../../src/lib/msg-topology');
const path = require('path');

function getT() {
  return new MsgTopology({topology_file: path.join(__dirname, './fixtures/msg-topology.yml')});
}

describe('MSG-TOPOLOGY', () => {

  it('has some methods', () => {
    let msgTopology = new MsgTopology();
    expect(msgTopology).to.have.a.property('getExchange').to.be.a('function');
    expect(msgTopology).to.have.a.property('getQueue').to.be.a('function');
    expect(msgTopology).to.have.a.property('getQueueBy').to.be.a('function');
    expect(msgTopology).to.have.a.property('getExchangeBy').to.be.a('function');
  });

  it('exposes the topology', () => {
    let t = getT();
    // console.log(t);
    t.topology.exchanges.forEach(e => {
      console.log(e);
    });
    expect(t).to.have.a.property('topology');
  });

  it('.getExchange() => returns a single exchange', () => {
    let t = getT();
    let e = t.getExchange('cmd.sync.user');
    console.log(e);
    expect(e).to.exist;
    expect(e).to.not.be.an('array');
    expect(e).to.be.an('object');
    expect(e).to.have.property('key').to.equal('twitter.cmd.sync.user');
    expect(e.payload).to.have.a.property('screen_name').to.be.equal('foo');
  });

  it('.getExchangeBy() => returns a single exchange', () => {
    let t = getT();
    let e = t.getExchangeBy({key: 'twitter.cmd.sync.user'});
    expect(e).to.be.an('array');
    expect(e[0]).to.have.a.property('id').to.be.equal('cmd.sync.user');
  });

  it('.getQueue() => returns a queue', () => {
    let t = getT();
    let q = t.getQueue('sync-user');
    expect(q).to.exist;
    expect(q).to.be.an('object');
    expect(q).to.not.be.an('array');
    expect(q).to.have.a.property('for').to.be.equal('cmd.sync.user');
  });

  it('.getQueueBy() => returns a queue', () => {
    let t = getT();
    let q = t.getQueueBy({for: 'user-created'});
    console.log(q);
    expect(q).to.exist;
    expect(q).to.be.an('array').of.length(2);
  });

});
