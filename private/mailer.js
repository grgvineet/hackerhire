var mailer = require('nodemailer');

var transporter = mailer.createTransport('smtps://noreply.hackerhire%40gmail.com:hackerhirenoreply123@smtp.gmail.com');

module.exports = {

	// TODO : Add name in text
	// TODO : If sending fails, add resend option
	verify : function(to, token) {
		var mailOptions = {
            from: '"Hackerhire " <noreply.hackerhire@gmail.com>', // sender address
            to: to, // list of receivers
            subject: 'Account verification', // Subject line
            text: 'Hi there,\n Welcome to Hackerhire. Please verify your email id first to continue to login. Follow this link https://hackerhire.in:3000/verify/' + token + ' to reset your password.\n\nHackerhire Team' // plaintext body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                return { status : false, message : "Error sending mail"};
            }
            console.log('Message sent: ' + info.response);
            return { status : true, message : "Verification mail sent successfully. Please verify your account to continue to login"};
        });

	},


	reset : function(to, token) {
		var mailOptions = {
            from: '"Hackerhire " <noreply.hackerhire@gmail.com>', // sender address
            to: to, // list of receivers
            subject: 'Password reset', // Subject line
            text: 'There was recently a request to change the password on your account. Follow this link https://hackerhire.in:3000/reset/' + token + ' to reset your password. ' +
            'If it is not you, ignore this mail.\n\nHackerhire Team' // plaintext body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                return { status : false, message : "Error sending mail"};
            }
            console.log('Message sent: ' + info.response);
            return { status : true, message : "Mail successfully sent on email id"};
        });
	},

	invite : function(to, from, peerid, callback) {
		console.log(callback);
		var mailOptions = {
            from: '"Hackerhire " <noreply.hackerhire@gmail.com>', // sender address
            to: to, // list of receivers
            subject: 'Interview invite', // Subject line
            text: 'Hi there,\nYou are invited for interview by ' + from + '. Please click the link https://hackerhire.in:3000/room/?id=' + peerid + '\n\nHackerhire Team' // plaintext body
        };

        transporter.sendMail(mailOptions, function(error, info){
        	callback(error, info);
        });

	}
}