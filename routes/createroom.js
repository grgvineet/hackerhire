var express = require('express');
var passport = require('../app').passport;
var router = express.Router();
var validator = require('validator');

var mysql = require('mysql');
var dbconfig = require('../private/database/config');
var connection = mysql.createConnection(dbconfig.connection);


router.post('/', isLoggedIn, function(req, res) {

    // Input validation
    if (typeof req.body['first_name'] === 'undefined' || validator.isNull(req.body['first_name'])) return res.json( { status : false, message : "Interviewee name field is empty" });
    else if (typeof req.body['email'] === 'undefined' || validator.isNull(req.body['email'])) return res.json( { status : false, message : "Email field is empty" });
    else if (!validator.isEmail(req.body['email'])) return res.json( { status : false, message : "Invalid Email" });
    else if (typeof req.body['profile'] === 'undefined' || validator.isNull(req.body['profile'])) return res.json( { status : false, message : "Profile field is empty" });

    userId = req.user.id;
    connection.query('USE '+dbconfig.database);
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(userId);
    console.log(date);
    connection.query("INSERT INTO interview (id, userid, profile, interviewee, datetime) VALUES (NULL, ?, ?, ?, ?);",[req.user.id, req.body['profile'], req.body['first_name'], date],function(err,rows){
        console.log(err);
        if (err) {
            // TODO : Remove err, and add err message
            res.json( { status : true , message : err});
        }
        return res.json( { status : true , message : "Room created successfully"});
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