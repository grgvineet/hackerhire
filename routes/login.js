var express = require('express');
var passport = require('../app').passport;
var router = express.Router();

/* login */
router.get('/', function(req, res, next) {
    res.render('index', { message: req.flash('loginMessage') });
});

router.post('/', function(req, res, next) {

    passport.authenticate('local-login', function (err, user, info) {
        if (user !== false) {
            req.logIn(user, function(err) {
                if (err) { return next(err); }
            });
            if (req.body['signin-remember'] === true) {
                req.session.cookie.maxAge = 30*24*60*60*1000; // remember me for 30  days
            } else {
                req.session.cookie.expires = false;
            }
        }
        res.json(info);
    })(req, res, next);
       
});


module.exports = router;
