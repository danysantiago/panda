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
      return res.redirect('/#/login');
    }
    
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      
      return res.redirect('/#/home');
    });
  })(req, res, next);
}

function currentUser(req, res, next) {
  if(!req.user) {
    res.send(401, {'authenticated': false});
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