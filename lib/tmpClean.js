var fs = require('fs'),
    util = require('util'),
    async = require('async');

var log;

//TODO (Daniel): Move this to config file
var oldLimit = 1000*60*3;
var delay = 1000*60*60;

function clean(tmpDir) {
  if(log) {
    log.info("Performing tmpDir clean...");
  }

  var startTime = Date.now();

  async.waterfall([

    function (callback) {
      fs.readdir(tmpDir, function (err, files) {
        callback(err, files);
      });
    },

    function (files, callback) {
      async.each(files,
        function (file, done) {
          var filePath = tmpDir + "/" + file;
          fs.stat(filePath, function (err, stats) {
            if(err) {
              return done(err);
            }

            if(Date.now() - stats.ctime.getTime() > oldLimit) {
              fs.unlink(filePath, done);
              if(log) {
                log.debug("Removed tmp file: %s", filePath);
              }
            } else {
              done();
            }
          });
        },
        function (err) {
          if(err && log) {
            log.warn(err);
          }
          callback();
        }
      );
    }

  ],function (err, result) {
      if(err && log) {
        log.warn(err);
      }

      var elapsedTime = Date.now() - startTime;

      if(log) {
        log.info("Cleaned tmpDir - %sms", elapsedTime);
      }
    }
  );
}

module.exports = function (tmpDir, mlog) {
  log = mlog;

  if(!tmpDir) {
    throw Error("Invalid tmpDir path");
    return;
  }

  if(log) {
    log.info("Registered tmpDir cleaner for dir: '%s'", tmpDir);
  }

  setInterval(clean, delay, tmpDir);
};