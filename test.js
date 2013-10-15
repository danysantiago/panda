var config = require('./lib/config.js'),
    express = require('express'),
    async = require('async');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

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

  var procLimit = 20;
  var memLimit = 524288; //Kilobytes
  var fileLimit = 32768; //Kilobytes
  var jvmMemLimit = 5120; //Kilobytes
  var timeLimit = 10; //Seconds
  var cpuTimeLimit = timeLimit;

  async.waterfall([
    function (callback) {
      var compileStart = Date.now();

      var cmd = 'javac ' + '-d "' + __dirname + '/jail" ' + filePath;
      var javaC = exec(cmd, function (err, stdout, stderr) {
        log.info(stdout);

        var compileTime = Date.now() - compileStart;

        log.info('Compile time: %sms', compileTime);

        callback(stderr);
      });
    },
    function (callback) {
      var javaOutBuff = '';
      var safeExecBuff = '';

      var args = ['jail', '/safeexec',
        '--nproc', procLimit,
        '--mem', memLimit,
        '--fsize', fileLimit,
        '--cpu', cpuTimeLimit,
        '--clock', timeLimit,
        '--exec', '/java/bin/java',
        '-Xmx' + jvmMemLimit + 'K',
        className
      ];

      var javaExec = spawn('chroot', args, {'stdio': 'pipe'});
      javaExec.stdin.end('My name is Daniel');
      
      javaExec.stdout.on('data', function (data) {
        javaOutBuff += data;
      });

      javaExec.stderr.on('data', function (data) {
        safeExecBuff += data;
      });

      javaExec.on('close', function (code) {
        log.info('javaExec exit code: ' + code);
        callback(null, safeExecBuff, javaOutBuff);
      });
    }
  ], function (err, safeExecBuff, javaOutBuff) {
    if(err) {
      log.error(err);
      res.send(err);
      return;
    }

    log.info(safeExecBuff);
    log.info(javaOutBuff);

    res.send(safeExecBuff);
  });
});


module.exports = test;