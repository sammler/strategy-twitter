const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const usersController = require('./users.controller');

router.get('/v1/twit/users/:id', usersController.getByScreenName);
router.get('/v1/twit/users/by-id/:id', usersController.getById);

module.exports = router;
