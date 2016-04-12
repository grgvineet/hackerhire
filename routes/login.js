var express = require('express');
var validator = require('validator');
var passport = require('../app').passport;
var router = express.Router();

/* login */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/', function(req, res, next) {
    // console.log(req.body['signin-email'] + ' ' + req.body['signin-password']);
    
    // Input validation
    if (typeof req.body['signin-email'] === 'undefined' || validator.isNull(req.body['signin-email'])) return res.json( { status : false, message : "Email field is empty" });
    else if (!validator.isEmail(req.body['signin-email'])) return res.json( { status : false, message : "Invalid Email" });
    else if (typeof req.body['signin-password'] === 'undefined' || validator.isNull(req.body['signin-password'])) return res.json( { status : false, message : "Password field is empty" });
    
    passport.authenticate('local-login', function (err, user, info) {
        if (user !== false) {
            req.logIn(user, function(err) {
                if (err) { return next(err); }
            });
            if (req.body['signin-remember'] === 'true') {
                // console.log('remember-me');
                req.session.cookie.maxAge = 30*24*60*60*1000; // remember me for 30  days
            } else {
                // console.log('i do not remember you');
                req.session.cookie.expires = false;
            }
        }
        return res.json(info);
    })(req, res, next);
       
});


module.exports = router;
