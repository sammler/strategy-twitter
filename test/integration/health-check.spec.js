const HttpStatus = require('http-status-codes');

const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));
const testLib = require('./../lib');

xdescribe('Integration => health-check', () => {

  let server;
  before(() => {
    return testLib.init('rest').then(result => {
      server = result.superTest;
    });
  });

  it('returns OK and a timestamp', () => {
    return server
      .get('/health-check')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.property('body');
        expect(result.body).to.have.property('ts').to.exist;
        expect(result.body).to.have.property('version').to.be.equal(pkg.version);
        expect(result.body).to.have.property('name').to.be.equal(pkg.name);
        expect(result.body).to.have.property('repository').to.be.equal(pkg.repository);
      });
  });
});

