/**
  Database Singleton Object
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