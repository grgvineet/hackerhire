var express = require('express');
var passport = require('../app').passport;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var dbconfig = require('../private/database/config');
var connection = mysql.createConnection(dbconfig.connection);

var router = express.Router();

connection.query('USE ' + dbconfig.database);

/* GET home page. */
router.get('/:token', function(req, res, next) {
    // Received when url opened from email

    // Show password input form
    res.render('reset')
});

router.post('/:token', function(req, res, next) {
    // Received to reset password after filling form

    // Get token from url
    var token = req.params.token;

    // Select corresponding email from token
    // TODO : Email should be an input field so that any can't try for random tokens and change password
    connection.query("SELECT * FROM reset WHERE token = ?",[token], function(err, rows){
        if (err) {
            res.redirect('/'); // Internal server error
            return;
        }
        if (rows.length === 0) {
            res.redirect('/'); // Token expired, used or does not exist
            return;
        }

        var email = rows[0].email;
        var password = req.body.password;

        // Updating password
        connection.query("UPDATE users SET password=? WHERE email=?;", [bcrypt.hashSync(password, null, null), email], function (err, rows) {
            console.log(rows.affectedRows);
            if (err) {
                res.redirect('/'); // Internal server error
                return;
            }
            if (!rows.affectedRows) {
                res.redirect('/'); // Cannot update, some error
                return;
            }

            // Delete token from table
            connection.query("DELETE FROM reset where email=? AND token=?", [email, token], function (err, rows) {});

            req.body = {'signin-email' : email, 'signin-password' : password};

            // Authentication user and loggin in
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
                res.redirect('/dashboard');
                return;
            })(req, res, next);
        });
    });
});

router.get('/', function(req, res, next) {
    // Should not be received
    res.redirect('/');
});

router.post('/', function(req, res, next) {
    // Receives an ajax query to reset password, reply with status true or false that whether email id exist or not
    var email = req.body.email;

    // Load database
    connection.query("SELECT * from users where email=?", [email], function (err, rows) {
        if (err) {
            res.json({ status : false, message : "Internal Server error"}); return;
        } else if (!rows.length) {
            res.json({ status : false, message : "No account with given email"}); return;
        }

        // Email found in database
        // TODO : Create random token
        var token = crypto.randomBytes(20).toString('hex');
        connection.query("Insert into reset (email, token) values (?, ?)", [email, token], function (err, rows) {
            if (err) {
                // TODO : If email exist in reset, update token
                console.log(JSON.stringify(err));
                res.json({ status : false, message : "Error : probably request for reset already submit"}); return;
            }
            res.json({ status : true, token : token}); return; // TODO : Remove token
        });
    });
    
});


module.exports = router;
