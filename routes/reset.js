var express = require('express');
var passport = require('../app').passport;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mailer = require('nodemailer');
var dbconfig = require('../private/database/config');
var connection = mysql.createConnection(dbconfig.connection);

var router = express.Router();

var transporter = mailer.createTransport('smtps://noreply.hackerhire%40gmail.com:hackerhirenoreply123@smtp.gmail.com');

connection.query('USE ' + dbconfig.database);

/* GET home page. */
router.get('/:token', function(req, res, next) {
    // Received when url opened from email
    var token = req.params.token;
    connection.query("SELECT * FROM reset WHERE token = ?",[token], function(err, rows) {
        if (err) {
            return res.redirect('/'); // Internal server error

        }
        if (rows.length === 0) {
            return res.redirect('/'); // Token expired, used or does not exist

        }
        return res.render('reset')
    });
});

router.post('/:token', function(req, res, next) {
    // Received to reset password after filling form

    // Get token from url
    var token = req.params.token;

    // Select corresponding email from token
    // TODO : Email should be an input field so that any can't try for random tokens and change password
    connection.query("SELECT * FROM reset WHERE token = ?",[token], function(err, rows){
        if (err) {
            return res.redirect('/'); // Internal server error
            
        }
        if (rows.length === 0) {
            return res.redirect('/'); // Token expired, used or does not exist
            
        }

        var email = rows[0].email;
        var password = req.body.password;

        // Updating password
        connection.query("UPDATE users SET password=? WHERE email=?;", [bcrypt.hashSync(password, null, null), email], function (err, rows) {
            console.log(rows.affectedRows);
            if (err) {
                return res.redirect('/'); // Internal server error
                
            }
            if (!rows.affectedRows) {
                return res.redirect('/'); // Internal server error
                
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
                return res.redirect('/dashboard');
                
            })(req, res, next);
        });
    });
});

router.get('/', function(req, res, next) {
    // Should not be received
    return res.redirect('/');
});

router.post('/', function(req, res, next) {
    // Receives an ajax query to reset password, reply with status true or false that whether email id exist or not
    var email = req.body.email;

    // Load database
    connection.query("SELECT * from users where email=?", [email], function (err, rows) {
        if (err) {
            return res.json({ status : false, message : "Internal Server error"});
        } else if (!rows.length) {
            return res.json({ status : false, message : "No account with given email"});
        }

        // Email found in database
        var token = crypto.randomBytes(20).toString('hex');
        connection.query("replace into reset (email, token) values (?, ?)", [email, token], function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return res.json({ status : false, message : "Internal Server Error"});
            }

            // Send email with link
            var mailOptions = {
                from: '"Hackerhire " <noreply.hackerhire@gmail.com>', // sender address
                to: email, // list of receivers
                subject: 'Password reset', // Subject line
                text: 'There was recently a request to change the password on your account. Follow this link https://hackerhire.in:3000/reset/' + token + ' to reset your password. ' +
                'If it is not you, ignore this mail.', // plaintext body
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    return res.json({ status : false, message : "Error sending mail"});
                }
                console.log('Message sent: ' + info.response);
                return res.json({ status : true, message : "Mail successfully sent on email id"});
            });

        });
    });
    
});


module.exports = router;
