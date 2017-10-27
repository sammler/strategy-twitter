const MsgTopology = require('./../../src/lib/msg-topology');
const path = require('path');

describe('', () => {

  it('has some methods', () => {
    let msgTopology = new MsgTopology();
    expect(msgTopology).to.have.a.property('getExchange').to.be.a('function');
    expect(msgTopology).to.have.a.property('getQueue').to.be.a('function');
    expect(msgTopology).to.have.a.property('getQueueBy').to.be.a('function');
    expect(msgTopology).to.have.a.property('getExchangeBy').to.be.a('function');
  });

  it('exposes the topology', () => {
    let t = new MsgTopology({file: {location: path.join(__dirname, './fixtures/msg-topology.yml')}});
    // console.log(t);
    t.topology.exchanges.forEach(e => {
      console.log(e);
    });
    expect(t).to.have.a.property('topology');
  })

});
