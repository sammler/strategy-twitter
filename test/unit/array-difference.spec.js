const _ = require('lodash');

describe('Testing intersection of Arrays', function () {

  this.timeout(20000);

  it('difference between int arrays => 0', () => {
    let a = [1];
    let b = [1];

    let diff = _.difference(a, b);
    expect(diff).to.be.of.length(0);
  });

  it('difference between int arrays => 1', () => {
    let a = [1, 2, 3, 4, 5];
    let b = [1, 2, 3, 5];

    let diff = _.difference(a, b);
    expect(diff).to.be.of.length(1);
    expect(diff).to.be.eql([4]);
  });

  // Todo: as we have taken a completely different approach in the implementation, this can potentially be removed.
  /**
   * Only works if --max-old-space-size=4096 is set as node option
   */
  it.skip('difference between int arrays, super large', () => {

    // Todo: If going for the possible largest accounts on Twitter (50+mio), we get a node.js error here.
    // Todo: See npm-package increase-memory-limit, this seems to be the solution
    // Todo: Another way of dealing with it could be to intersect in blocks of 1.000.000 sorted records or something like that.
    // Tested also 50mio records, going for the probably largest Twitter account
    let size = 5000000;
    let a = [];

    for (let i = 0; i < size; i++) {
      a.push(i);
    }

    let b = _.clone(a);

    b.splice(10, 1);

    let diff = _.difference(a, b);
    console.log('diff', diff);

    expect(a).to.be.of.length(size);
    expect(b).to.be.of.length(size - 1);
    expect(diff).to.be.of.length(1);
    expect(diff).to.be.eql([10]);
  });

});
