const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-config');
const RateLimitStatusBL = require('./../../src/modules/rate-limit-status/rate-limit-status.bl');

describe('rate-limit-status.bl', () => {
  const appServer = new AppServer(testConfig);
  before(() => {
    return appServer.start();
  });

  after(() => {
    return appServer.stop();
  });

  it('get it (default app-auth)', () => {
    return RateLimitStatusBL.getTwitRateLimitStatus()
      .then(res => {
        expect(res).to.exist;
        expect(res).to.have.property('rate_limit_context').to.have.property('access_token');
        expect(res).to.have.property('resources');
        expect(res).to.have.a.property('rate_limit');
        expect(res.rate_limit).to.have.a.property('x-rate-limit-limit');
        expect(res.rate_limit).to.have.a.property('x-rate-limit-remaining');
        expect(res.rate_limit).to.have.a.property('x-rate-limit-reset');
        expect(res.rate_limit).to.have.a.property('limitResetUtc');
      });
  });
});
