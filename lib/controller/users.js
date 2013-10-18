var mongodb = require('mongodb');

Users = {

  'findById': function(id, callback) {
    db.collection('users').findOne({'_id': id}, callback);
  },
  
  'findOne': function(query, callback) {
    console.log('ulalalala');
    db.collection('users').findOne(query, callback);
  },

  'checkPassword': function(user, password) {
    return user.password === password;
  }

};

module.exports = Users;