var config = require('./lib/config.js'),
    express = require('express'),
    os = require('os'),
    temp = require('temp'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    async = require('async'),
    _ = require('underscore');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var db;
var log;

function veredictOutput (javaOutBuff, testOutput, cb) {
  log.info({
    "expected": testOutput,
    "received": javaOutBuff
  });

  var javaOutLines = javaOutBuff.split(os.EOL);
  if (javaOutLines[javaOutLines.length-1].length === 0) {
    javaOutLines.pop();
  }

  var testOutLines = testOutput.split(os.EOL);
  if (testOutLines[testOutLines.length-1].length === 0) {
    testOutLines.pop();
  }

  if (testOutLines.length != javaOutLines.length) {
    cb('Wrong Answer');
    return;
  }

  var N = testOutLines.length;

  async.every(_.range(N), function (i, callback) {
    callback(testOutLines[i].trim() === javaOutLines[i].trim());
  }, function (result) {
    cb(result ? 'Correct' : 'Wrong Answer');
  });
}

//var bodyParserOptions = {'uploadDir': config.root + '/tmp'};
var bodyParserOptions = {};

var test = express();

test.use(function (req, res, next) {
  log = req.log;
  db = req.db;

  temp.mkdir({'dir': __dirname + '/jail'}, function (err, dirPath) {
    bodyParserOptions.uploadDir = dirPath;
  })

  next();
});

test.post('/jsubmit', express.bodyParser(bodyParserOptions), function (req, res) {
  log.info({'body': req.body});
  log.info({'uploadedFile': req.files.jfile});

  var pathToTmpDir = bodyParserOptions.uploadDir.split('/');
  var tmpDir = pathToTmpDir[pathToTmpDir.length-1];

  var fileName = req.files.jfile.originalFilename;
  var className = fileName.substring(0, fileName.length-5);
  var oldFilePath = req.files.jfile.path;
  var newFilePath = bodyParserOptions.uploadDir + '/' + fileName;
  var fileSize = req.files.jfile.size;

  var testInput = req.body.input;
  var testOutput = req.body.output;

  var procLimit = 12; // (>= 12)
  var memLimit = 32768; //Kilobytes
  var fileLimit = 32768; //Kilobytes

  var jvmMemLimit = 32; //Megabytes (=> 2)
  var timeLimit = 10; //Seconds
  var cpuTimeLimit = timeLimit;

  if (fileSize === 0) {
    log.warn("jfile not provided");
    res.send("No file selected");
    return;
  }

  async.waterfall([
    function (callback) {
      fs.chmod(bodyParserOptions.uploadDir, 0776, callback);
    },

    function (callback) {
      fs.rename(oldFilePath, newFilePath, callback);
    },

    function (callback) {
      var compileStart = Date.now();

      var cmd = 'javac ' + '-d ' + bodyParserOptions.uploadDir + ' ' + newFilePath;
      log.debug(cmd);
      var javaC = exec(cmd, function (err, stdout, stderr) {
        log.info(stdout);

        var compileTime = (Date.now() - compileStart) + " miliseconds";

        log.info('Compile time: %s', compileTime);

        if (stderr) {
          callback({
            'status': 'Compile Error',
            'compile time': compileTime,
            'error': stderr.split(os.EOL),
          });
        }

        callback(null, compileTime);
      });
    },
    function (compileTime, callback) {
      var javaOutBuff = '';
      var safeExecBuff = '';

      var args = ['jail', '/safeexec',
        '--nproc', procLimit,
        '--mem', memLimit,
        '--fsize', fileLimit,
        '--cpu', cpuTimeLimit,
        '--clock', timeLimit,
        '--exec', '/java/bin/java',
        '-cp', '/' + tmpDir,
        '-Xmx' + jvmMemLimit + 'm',
        className
      ];
      log.debug(args);
      var javaExec = spawn('chroot', args, {'stdio': 'pipe'});
      javaExec.stdin.end(testInput);
      
      javaExec.stdout.on('data', function (data) {
        javaOutBuff += data;
      });

      javaExec.stderr.on('data', function (data) {
        safeExecBuff += data;
      });

      javaExec.on('close', function (code) {
        log.info('javaExec exit code: ' + code);
        callback(null, safeExecBuff, javaOutBuff, compileTime);
      });
    }
  ],
  function (err, safeExecBuff, javaOutBuff, compileTime) {
    if (err) {
      log.error(err);
      res.send(err);
      return;
    }

    log.info(safeExecBuff);
    log.info(javaOutBuff);

    var safeExecOut = safeExecBuff.split(os.EOL);
    var safeExecN = safeExecOut.length - 1; //-1 for the last empty string

    var executeStats = {
      'status': safeExecOut[safeExecN - 4],
      'elapsed time': safeExecOut[safeExecN - 3].split(': ')[1],
      'memory usage': safeExecOut[safeExecN - 2].split(': ')[1],
      'cpu usage': safeExecOut[safeExecN - 1].split(': ')[1],
      'compile time': compileTime
    };

    if (executeStats.status != 'OK') {
      if (executeStats.status.indexOf('Command exited with non-zero status') != -1) {
        executeStats.status = "Runtime Exception";
        executeStats.stackTrace = [];
        for (var i = 0; i < safeExecN - 4; i++) {
          executeStats.stackTrace.push(safeExecOut[i]);
        }
      }

      res.send(executeStats);
      return;
    }

    veredictOutput(javaOutBuff, testOutput, function (veredict) {
      executeStats.status = veredict;
      res.send(executeStats);

      setInterval(rimraf, 1000*5, bodyParserOptions.uploadDir, function (err){
        if(err) {
          log.warn(err);
        }
      });
    });

  });
});


module.exports = test;