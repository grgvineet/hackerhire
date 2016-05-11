// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../database/config');
var mailer = require('../mailer.js');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'signup-email',
                passwordField : 'signup-password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists

                connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                    if (err)
                        return done(err, null, {status : false, message : "Internal Server Error"});
                    if (rows.length) {
                        return done(null, false, {status : false, message : 'That email is already registered.'});
                    } else {
                        // if there is no user with that username
                        // create the user
                        var newUserMysql = {
                            username: req.body['signup-username'],
                            email: email,
                            password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                            verified: 0
                        };

                        var token = crypto.randomBytes(20).toString('hex');

                        var insertVerificationTokenQuery = "INSERT INTO verificationtokens (email, token) values (?,?)";
                        connection.query(insertVerificationTokenQuery, [newUserMysql.email, token], function(err, rows){
                            // TODO : Check for errors
                            var mailResult = mailer.verify(newUserMysql.email, token);
                        });

                        var insertQuery = "INSERT INTO users ( username, email, password, verified ) values (?,?,?,?)";
                        connection.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password, newUserMysql.verified],function(err, rows) {
                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql, {status : true});
                        });

                    }
                });
            })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'signin-email',
                passwordField : 'signin-password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) { // callback with email and password from our form
                console.log('local-login');
                connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows){
                    if (err)
                        return done(err, false, {status : false, message : "Internal server error"});
                    if (!rows.length) {
                        return done(null, false, { status : false, message : "No user found."}); // req.flash is the way to set flashdata using connect-flash
                    }

                    if (rows[0].verified == 0) {
                        return done(null, false, { status : false, message : "Please verify email first"});
                    }
                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, { status : false, message : "Oops! Wrong password."}); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, rows[0], {status : true});
                });
            })
    );


    // =========================================================================
    // LOCAL VERIFY =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-verify',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'signin-email',
                passwordField : 'signin-password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) { // callback with email and password from our form
                connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows){
                    if (err)
                        return done(err, false, {status : false, message : "Internal server error"});
                    if (!rows.length) {
                        return done(null, false, { status : false, message : "No user found."}); // req.flash is the way to set flashdata using connect-flash
                    }

                    // all is well, return successful user
                    return done(null, rows[0], {status : true});
                });
            })
    );
};
