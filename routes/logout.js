var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        req.session.destroy(null);
        req.logOut();
    }
    res.redirect('/');
});
module.exports = router;
