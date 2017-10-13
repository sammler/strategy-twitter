const MsgTopology = require('./../../src/lib/msg-topology');

describe('', () => {

  it('has some methods', () => {
    expect(MsgTopology).to.have.a.property('instance').to.be.a('function');
  });

  it('exposes the topology', () => {
    let t = MsgTopology.instance();
    console.log(t);
    expect(t).to.have.a.property('topology');
  })

});
