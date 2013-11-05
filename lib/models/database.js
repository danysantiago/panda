/**
  Database Singleton Object - Follows the singleton pattern to have a global
  DB object across the application. The DB object (MongoDB) has a thread-pool
  that makes it OK to do this.
**/

var mongodb = require('mongodb');

var singleton = (function() {

  var instance;

  function init() {

    var _db;

    return {

      getDB: function() {
        return _db;
      },

      setDB: function(db) {
        _db = db;
      }

    };

  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };

})();

module.exports = singleton.getInstance();