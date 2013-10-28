var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var Database = require('../models/database.js');
var Users = require('../controllers/users.js');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (username, password, done) {
    var db = Database.getDB();
    var users = new Users(db);
    console.log(username + ', ' + password);
    users.findOne({'email':username}, function (err, user) {
      if (err) { 
        return done(err); 
      }

      if (!user) {
        return done(null, false, { 'message': 'Incorrect username.' });
      }
      
      if (!users.checkPassword(user, password)) {
        return done(null, false, { 'message': 'Incorrect password.' });
      }

      delete user.salt;
      return done(null, user);
    });
  }
));

passport.serializeUser(function (user, done) {
    done(null, user);
  }
);

passport.deserializeUser(function (obj, done) {
    done(null, obj);
  }
);

module.exports = passport;