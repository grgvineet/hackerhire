var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySqlStore = require('express-mysql-session');
var fs = require('fs');
var https = require('https');
var passport = require('passport'); module.exports.passport = passport;

var routes = require('./routes/index');
var users = require('./routes/users');
var room = require('./routes/room');
var login = require('./routes/login');
var logout = require('./routes/logout');
var dashboard = require('./routes/dashboard');
var signup = require('./routes/signup');

var app = express();

/**
 * Prettifies the html page generated, remove in production
 */
app.locals.pretty = true;

var privateKey = fs.readFileSync('./private/ssl/key.pem').toString();
var certificate = fs.readFileSync('./private/ssl/cert.pem').toString();

var options = { key : privateKey, cert : certificate, passphrase: "hackerhire"};
var server = https.createServer(options, app);
server.listen(3000);

var sessionStore = new MySqlStore(require('./private/database/config').sessionStoreOptions);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'spidermonkey',
    store : sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

require('./private/auth/passport-local')(passport);

app.use('/', routes);
app.use('/users', users);
app.use('/room', room);
app.use('/login', login);
app.use('/logout', logout);
app.use('/signup', signup);
app.use('/dashboard', dashboard);
app.use('/peer', require('peer').ExpressPeerServer(server, {debug: true}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


module.exports = app;
console.log("App started");
