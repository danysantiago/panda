var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var Users = require('../controller/users.js');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (username, password, done) {
    Users.findOne({ "email": username }, function (err, user) {
      if (err) { 
        return done(err); 
      }
      
      if (!user) {
        return done(null, false, { 'message': 'Incorrect username.' });
      }
      
      if (!Users.checkPassword(user, password)) {
        return done(null, false, { 'message': 'Incorrect password.' });
      }
      
      return done(null, user);
    });
}));

passport.serializeUser(function (user, done){
    done(null, user);
});

passport.deserializeUser(function (obj, done){
    done(null, obj);
});

module.exports = passport;