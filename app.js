var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs')
  , util = require('util')
  , passport = require('passport')
  , wsfedsaml2 = require('passport-azure-ad').WsfedStrategy // This gives you WebSSO capability for Azure AD
  , engine = require('ejs-locals'); 

var config = {
  realm: 'https://waaazaap.azurewebsites.net',
  identityProviderUrl: 'https://login.windows.net/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/wsfed',
  identityMetadata: 'https://login.windows.net/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/federationmetadata/2007-06/federationmetadata.xml',
  logoutUrl: 'https://waaazaap.azurewebsites.net'
};

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
 
app.use(session({
  secret: 'funfunfun',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// what to do when user first visits application
    
app.use('/', routes);

// what to do when visits login URL

app.get('/login',
passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
function(req, res) {
  res.redirect('/');
});

// what to do when user wishes to logout
app.get('/logout', function(req, res){
// clear the passport session cookies
 req.logout();
// We need to redirect the user to the WSFED logout endpoint so the
// auth token will be revoked
wsfedStrategy.logout({}, function(err, url) {
if(err) {
  res.redirect('/');
} else {
  res.redirect(url);
        }   
    });
});

app.get('/test', function(req, res) {
    var pg = require('pg');
    var connectionString = "postgres://jrdluvijcaopxs:CRCFxUZD8A772JWnlL5ffXfGW_@ec2-23-23-80-55.compute-1.amazonaws.com:5432/dd0sqqb05mp2jv?ssl=true";
    pg.connect(connectionString, function (err, client, done) {
        client.query('SELECT * FROM votes', function (err, result) {
            done();
            if (err) return console.error(err);
        });
    });
});


 // what to do when account is called
 app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user:req.user });
 });


  // what to do when Azure Active Directory sends us back a token
app.post('/login/callback',
passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
function(req, res) {
  res.redirect('/account');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }

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
passport.serializeUser(function(user, done) {
    done(null, user.email);
    });

    passport.deserializeUser(function(id, done) {
    findByEmail(id, function (err, user) { // we will use FindByEmail later in the code
      done(err, user);
    });

    });

    var wsfedStrategy = new wsfedsaml2(config,
        function(profile, done) {
        if (!profile.email) {
        return done(new Error("No email found"), null);
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
        findByEmail(profile.email, function(err, user) {
            if (err) {
            return done(err);
            }
            if (!user) {
            // "Auto-registration"
            users.push(profile);
            return done(null, profile);
            }
            return done(null, user);
        });
        });
    });


    passport.use(wsfedStrategy);

    var users = [];

    function findByEmail(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
      return fn(null, user);
    }
    }
    return fn(null, null);
    }
module.exports = app;
