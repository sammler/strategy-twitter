const ExpressResult = require('express-result');

const UsersBL = require('./users.bl');

class UsersController {

  static getByScreenName(req, res) {
    return UsersBL.getTwitUser({screen_name: req.params.id})
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static getById(req, res) {
    return UsersBL.getTwitUser({id: req.params.id})
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

}

module.exports = UsersController;
