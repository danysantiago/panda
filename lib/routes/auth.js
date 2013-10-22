var config = require("../config/config.js"),
    express = require("express");

var passport = require('../config/passport.js');

function login(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) { 
      return next(err); 
    }
    
    req.log.info(user);
    req.log.info(info);
    
    if (!user) {
      req.session.messages = [info.message];
      return res.redirect('/login.html');
    }
    
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      
      return res.redirect('/current');
    });
  })(req, res, next);
}

function currentUser(req, res, next) {
  if(!req.user) {
    res.redirect('/login.html');
    return;
  }
  
  res.send(200, req.user);
}

var middleware = express();

middleware.use(function (req, res, next) {
  next();
});

middleware.get('/current', currentUser);
middleware.post('/login', express.bodyParser(), login);

module.exports = middleware;