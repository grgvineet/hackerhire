var express = require('express');
var passport = require('../app').passport;
var router = express.Router();

router.get('/', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.redirect('/', { message: req.flash('signupMessage') });
});

router.post('/', function(req, res, next) {

    passport.authenticate('local-signup', function (err, user, info) {
        if (user !== false) {
            req.logIn(user, function(err) {
                if (err) { return next(err); }
            });
        }
        res.json(info);
    })(req, res, next);

});

module.exports = router;