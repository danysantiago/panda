var config = require('../lib/config/config.js'),
    express = require('express'),
    os = require('os'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore');

var utils = require('../lib/utils.js');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var db;
var log;

//Output verdict function, checks output of test program vs expected
function veredictOutput (javaOutBuff, testOutput, cb) {
  log.info({
    "expected": testOutput,
    "received": javaOutBuff
  });

  //Split lines and clean last empty line
  var javaOutLines = javaOutBuff.split(os.EOL);
  if (javaOutLines[javaOutLines.length-1].length === 0) {
    javaOutLines.pop();
  }

  //Split lines and clean last empty line
  var testOutLines = testOutput.split(os.EOL);
  if (testOutLines[testOutLines.length-1].length === 0) {
    testOutLines.pop();
  }

  //Initially check number of lines
  if (testOutLines.length != javaOutLines.length) {
    cb('Wrong Answer');
    return;
  }

  var N = testOutLines.length;

  //Go trough each line comparing, if one fails, we stop
  async.every(_.range(N), function (i, callback) {
    callback(testOutLines[i].trim() === javaOutLines[i].trim());
  }, function (result) {
    cb(result ? 'Correct' : 'Wrong Answer');
  });
}


var test = express();

test.use(function (req, res, next) {
  log = req.log;
  db = req.db;
  next();
});

var bodyParserOptions = {};

//Middleware to create temporary folder inside jail
test.use(function (req, res, next) {
  var tmpPath = utils.generateTmpPath(path.join(config.root,'jail'));
  fs.mkdir(tmpPath, 0776, function (err) {
    bodyParserOptions.uploadDir = tmpPath;
    next(err);
  });
});

test.post('/jsubmit', express.bodyParser(bodyParserOptions), function (req, res) {
  log.info({'body': req.body});
  log.info({'uploadedFile': req.files.jfile});

  //Folder and files info
  var tmpDir = bodyParserOptions.uploadDir;
  var tmpDirSplit = tmpDir.split('/');
  var jailTmpDir = tmpDirSplit[tmpDirSplit.length-1];

  var fileName = req.files.jfile.originalFilename;
  var className = fileName.substring(0, fileName.length-5);
  var oldFilePath = req.files.jfile.path;
  var newFilePath = path.join(tmpDir,fileName);
  var fileSize = req.files.jfile.size;

  // I/O for test code
  var testInput = req.body.input;
  var testOutput = req.body.output;

  //Runtime limits
  var procLimit = 15; // (>= 12)
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
    //Single file logic, rename file to original so it can be compiled
    function (callback) {
      fs.rename(oldFilePath, newFilePath, callback);
    },

    //Compile process
    function (callback) {
      var compileStart = Date.now();

      //We use javac and output dir is jail tmp dir
      var cmd = 'javac ' + '-d ' + tmpDir + ' ' + newFilePath;
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

    //Run and test process
    function (compileTime, callback) {
      var javaOutBuff = '';
      var safeExecBuff = '';

      log.debug(path.join(config.root, 'jail'));
      var args = [path.join(config.root, 'jail'), //jail folder name
        '/safeexec', ///chroot cmd
        '--nproc', procLimit, //forks limit
        '--mem', memLimit, //memory limit
        '--fsize', fileLimit, //file out limit
        '--cpu', cpuTimeLimit, //cpu time limit
        '--clock', timeLimit, //wall clock time limit
        '--exec', '/java/bin/java', //java runtime
        '-cp', '/' + jailTmpDir, //classpath
        '-Xmx' + jvmMemLimit + 'm', //JVM memory limit
        className //main class name
      ];
      log.debug(args);
      //Command is chroot to use jail
      var javaExec = spawn('chroot', args, {'stdio': 'pipe'});
      javaExec.stdin.end(testInput); //Feed input to test code
      
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

    //Gather execution data
    var executeStats = {
      'status': safeExecOut[safeExecN - 4],
      'elapsed time': safeExecOut[safeExecN - 3].split(': ')[1],
      'memory usage': safeExecOut[safeExecN - 2].split(': ')[1],
      'cpu usage': safeExecOut[safeExecN - 1].split(': ')[1],
      'compile time': compileTime
    };

    if (executeStats.status != 'OK') { //Not OK, lets check what happened...
      //If java finished with error we gather stack, otherwise a limit was exceeded
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

    //Test output of test code
    veredictOutput(javaOutBuff, testOutput, function (veredict) {
      executeStats.status = veredict;
      res.send(executeStats);

      //Delete tmp folder after 5 seconds
      setInterval(rimraf, 1000*5, tmpDir, function (err){
        if(err) {
          log.warn(err);
        }
      });
    });

  });
});


module.exports = test;