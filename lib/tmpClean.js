/**
  tmpClean.js - Temporary Files cleaner routine
**/

var fs = require('fs'),
    util = require('util'),
    async = require('async');

var log;

//TODO (Daniel): Move this to config file
var oldLimit = 1000*60*5; //How old a file has to be to delete it, in ms 
var delay = 1000*60*60*3; //How often cleaning will be done, in ms

function clean(tmpDir) {
  if(log) {
    log.debug('Performing tmpDir clean...');
  }

  var startTime = Date.now();

  async.waterfall([
    //Gets list of files of temporary folder
    function (callback) {
      fs.readdir(tmpDir, function (err, files) {
        callback(err, files);
      });
    },

    //Go trough each file deleting them if older than 'oldLimit'
    function (files, callback) {
      async.each(files,
        function (file, done) {
          var filePath = tmpDir + '/' + file;
          //Read file info
          fs.stat(filePath, function (err, stats) {
            if(err) {
              if(log) {
                log.debug(err);
              }
              return done();
            }

            //Check if file is not a dir and is old
            if(stats.isFile() && Date.now() - stats.ctime.getTime() > oldLimit) {
              //Delete it (Not guaranteed)
              fs.unlink(filePath, function (err) {
                //Errors between files are logged, but we keep going
                if(err && log) {
                  log.debug(err);
                } else if (log) {
                  log.debug('Removed tmp file: %s', filePath);
                }

                done();
              });

            } else {
              done();
            }
          });
        }, callback);
    }

  ],function (err, result) {
      if(err && log) {
        log.debug(err);
      }

      var elapsedTime = Date.now() - startTime;

      if(log) {
        log.debug('Cleaned tmpDir - %sms', elapsedTime);
      }
    }
  );
}

module.exports = function (tmpDir, mlog) {
  log = mlog;

  if(!tmpDir) {
    throw new Error('Invalid tmpDir path');
  }

  fs.stat(tmpDir, function (err, stats) {
    if(err) {
      throw err;
    }

    if(!stats.isDirectory()) {
      throw new Error('Given tmpDir ' + tmpDir + ' is not a directory');
    }

    if(log) {
      log.info('Registered tmpDir cleaner for dir: \'%s\'', tmpDir);
    }

    //Node's timer function, executes clean function every 'delay' time
    setInterval(clean, delay, tmpDir);
    
  });
};