var config = require("./lib/config.js"),
    express = require("express"),
    async = require("async");

var exec = require('child_process').exec;

var db;
var log;

var test = express();

test.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

test.post('/jsubmit', express.bodyParser({'uploadDir': config.root + '/tmp'}), function (req, res) {
  log.info({'uploadedFile': req.files.jfile});

  var fileName = req.files.jfile.originalFilename;
  var className = fileName.substring(0, fileName.length-5);
  var filePath = req.files.jfile.path;

  var memLimit = '5120K'
  var timeLimit = 1000*5;

  async.waterfall([
    function (callback) {
      var cmd = 'javac ' + '-d "' + __dirname + '/jail" ' + filePath;
      log.info('exec command: ' + cmd);
      var javac = exec(cmd, function (err, stdout, stderr) {
        log.info(stdout);
        callback(stderr);
      });
    },
    //TODO (Daniel): Run chroot as different user, specifically run /bin/java as another user
    function (callback) {
      var cmd = 'chroot jail /java/bin/java -Xmx' + memLimit + ' ' + className;
      //var cmd = 'chroot jail ls';
      log.info('exec command: ' + cmd);
      var java = exec(cmd, {'timeout': timeLimit, 'killSignal': 'SIGKILL'}, function (err, stdout, stderr) {
        if(err) {
          //Failed cmd but no stderr, probably time limit
          if(!stderr) {
            //TODO (Daniel): Process is not being killed after timeout, KILL IT!
            log.info({ 'pid': java.pid })
            var tlString = 'Time Limit Exceeded';
            stderr = tlString;
          }
        }

        callback(stderr, stdout);
      });
    }
  ], function (err, result) {
    if(err) {
      log.error(err);
      res.send(err);
      return;
    }

    log.info('DONE, Response:')
    log.info(result);
    res.send(result);
  });
});


module.exports = test;