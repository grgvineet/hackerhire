var express = require('express');
var passport = require('../app').passport;
var router = express.Router();


router.get('/', isLoggedIn, function(req, res) {
    res.render('dashboard', {
        user : req.user // get the user out of session and pass to template
    });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    console.log(req.isAuthenticated());
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    req.flash('error', 'Login required');
    res.redirect('/');
}

module.exports = router;