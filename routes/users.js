var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // Temporary end point for logout, needs to be deleted
  req.logOut();
  res.redirect('/');
});

module.exports = router;
