var express = require('express');
var validator = require('validator');
var passport = require('../app').passport;
var router = express.Router();

router.get('/', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.redirect('/');
});

router.post('/', function(req, res, next) {
    console.log(req.body['signup-confirm-password']);
    console.log(req.body['signup-password']);
    console.log("YO!");

    // Input validation
    if (typeof req.body['signup-username'] === 'undefined' || validator.isNull(req.body['signup-username'])) return res.json( { status : false, message : "Username field is empty" });
    else if (typeof req.body['signup-email'] === 'undefined' || validator.isNull(req.body['signup-email'])) return res.json( { status : false, message : "Email field is empty" });
    else if (!validator.isEmail(req.body['signup-email'])) return res.json( { status : false, message : "Invalid Email" });
    else if (typeof req.body['signup-password'] === 'undefined' || validator.isNull(req.body['signup-password'])) return res.json( { status : false, message : "Password field is empty" });
    else if (req.body['signup-confirm-password'] === 'undefined' || validator.isNull(req.body['signup-confirm-password'])) return res.json( { status : false, message : "Confirm password is empty" });
    else if (!validator.equals(req.body['signup-password'], req.body['signup-confirm-password'] )) return res.json( { status : false, message : "Passwords don't match" });


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