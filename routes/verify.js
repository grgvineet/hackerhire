var express = require('express');
var passport = require('../app').passport;
var mysql = require('mysql');
var dbconfig = require('../private/database/config');
var connection = mysql.createConnection(dbconfig.connection);

var router = express.Router();

connection.query('USE ' + dbconfig.database);

router.get('/:token', function(req, res, next) {
    // Received when url opened from email
    var token = req.params.token;
    connection.query("SELECT * FROM verificationtokens WHERE token = ?",[token], function(err, rows) {
        if (err) {
            req.flash('error', 'Internal server error');
            return res.redirect(req.get('referer')); // Internal server error

        }
        if (rows.length === 0) {
            req.flash('error', 'Verification token does not exist. Either it is expired or used.');
            return res.redirect('/'); // Token expired, used or does not exist

        }
        var email = rows[0].email;
        req.body['signin-email'] = email;
        req.body['signin-password'] = 'vineet';

        connection.query("UPDATE users SET verified=1 WHERE email=?;", [email], function (err, rows) {
            connection.query("DELETE FROM verificationtokens where token=?", [token], function(err, rows) {} );
            
            passport.authenticate('local-verify', function (err, user, info) {
                if (user !== false) {
                    req.logIn(user, function(err) {
                        if (err) { return next(err); }
                    });
                }
                return res.redirect("/dashboard");
            })(req, res, next);
        });

    });
});

router.post('/:token', function(req, res, next) {
    return res.redirect('/');
});

router.get('/', function(req, res, next) {
    // Should not be received
    return res.redirect('/');
});

router.post('/', function(req, res, next) {
    // Receives an ajax query to reset password, reply with status true or false that whether email id exist or not
    return res.redirect('/');
    
});


module.exports = router;
