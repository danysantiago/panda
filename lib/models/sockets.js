var singleton = (function() {

  var instance;

  function init() {

    var _io;

    return {

      getIO: function() {
        return _io;
      },

      setIO: function(io) {
        _io = io;
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