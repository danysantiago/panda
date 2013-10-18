var config = require("../config/config.js"),
    express = require("express");

var passport = require('../config/passport.js');

var log;
var db;

function login(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) { 
      return next(err); 
    }
    
    log.info(user);
    log.info(info);
    
    if (!user) {
      req.session.messages = [info.message];
      return res.redirect('/login.html');
    }
    
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      
      return res.redirect('/home.html');
    });
  })(req, res, next);
}

var auth = express();

auth.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

auth.post('/login', express.bodyParser(), login);

module.exports = auth;