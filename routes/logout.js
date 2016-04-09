var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        req.logOut();
    }
    res.redirect('/');
});
module.exports = router;
