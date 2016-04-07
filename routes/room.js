var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.header('Access-Control-Allow-Origin',"*");
  res.render('room',{title:'Express'});
});

module.exports = router;
