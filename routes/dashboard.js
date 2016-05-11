var express = require('express');
var passport = require('../app').passport;
var router = express.Router();

var mysql = require('mysql');
var dbconfig = require('../private/database/config');
var connection = mysql.createConnection(dbconfig.connection);


router.get('/', isLoggedIn, function(req, res) {

    userId = req.user.id;
    connection.query('USE '+dbconfig.database);
    connection.query("SELECT * FROM interview WHERE userid=? ORDER BY datetime DESC",[userId],function(err,rows){
        console.log(err);
        return res.render('dashboard', {
            user : req.user.username, // get the user out of session and pass to template
            interview : rows
        });
    });

    // console.log(req_user);
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