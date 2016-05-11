var express = require('express');
var router = express.Router();
var mailer = require('../private/mailer.js')
var validator = require('validator');


router.post('/', isLoggedIn, function(req, res) {

    username = req.user.username;
    to = req.body.email;
    peerid = req.body.peerid;

    if (typeof to === 'undefined' || validator.isNull(to)) return res.json( { status : false, message : "Email field is empty" });
    else if (!validator.isEmail(to)) return res.json( { status : false, message : "Invalid Email" });

    mailer.invite(to, username, peerid, function(error, info){
        if(error){
                console.log(error);
                return res.json({ status : false, message : "Error sending mail"});
            }
            console.log('Message sent: ' + info.response);
            return res.json({ status : true, message : "Mail sent successfully"});
        });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    console.log(req.isAuthenticated());
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.json({ status : false, message : "Error sending mail"});
}

module.exports = router;