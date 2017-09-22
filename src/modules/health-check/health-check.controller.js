const findPkg = require('find-pkg');
const pkg = require(findPkg.sync('.'));

class HealthController {

  /**
   * Returning some health-check information.
   * @param req
   * @param res
   * @param next
   */
  static get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
      ts: new Date().toJSON(),
      version: pkg.version,
      name: pkg.name,
      repository: pkg.repository
    });
    next();
  }
}

module.exports = HealthController;
