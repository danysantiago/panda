var config = require('./config.js'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    os = require('os'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore'),
    utils = require('./utils.js');

var log = require('../app.js').log;

var concurrency = 2;

var JAIL_FAIL = 1;
var COMPILE_THREAD_FAIL = 2;
var COMPILE_ERROR = 3;
var JAVA_THREAD_FAIL = 4;

function preprocess(submission) {
  return function (done) {
    var workerObj = {}; //worker to be passed around
    workerObj.status = 'Judgeing';

    /**
      Do some pre processing on the workers data, make sure we can start OK
    **/

  };
}

function setupJail(workerObj, done) {
  workerObj.submission = submission;
  workerObj.tmpPath = utils.generateTmpPath(path.join(config.root,'jail'));
  var tmpPathSplit = workerObj.tmpPath.split('/');
  workerObj.jailTmpPath = tmpPathSplit[tmpPathSplit.length-1];
  //Create temp directory inside jail
  fs.mkdir(workerObj.tmpPath, 0776, function (err) {
    if(err) {
      workerObj.errMsg = err;
      workerObj.errCode = JAIL_FAIL;
    } else {
      done(null, workerObj);
    }
  });
}

function fetchRepo(workerObj, done) {
  /**
    Here goes getting the files from gitlab and placing them inside jail,
    also we have to save names in workerObj
  **/
}

function fetchTestCases(workerObj, done) {
  /**
    Here goes fetching test cases for assignment
  **/
}

function compileSrc(workerObj, done) {
  workerObj.status = 'Compiling';
  var compileStart = Date.now();

  var tmpPath = workerObj.tmpPath;
  var repoZipPath = workerObj.repoZipPath;

  //javac command
  var cmd = ['javac',
    '-d', tmpPath, //output dir
    '-sourcepath', tmpPath + ':' + repoZipPath,
    tmpPath + '/*.java' //we compile all *.java files
  ].join(' ');

  log.debug({'compile cmd': cmd});

  //Execute javac
  var javac = exec(cmd, function (err, stdout, stderr) {
    log.debug({'javac': {
      'stdout': stdout,
      'stderr': stderr
    }});

    //Calc compile time
    var compileTime = (Date.now() - compileStart) + ' miliseconds';
    log.debug('Compile time: %s', compileTime);

    //Compile status object
    var compile = {
      'status': '',
      'time': compileTime
    };
    workerObj.compile = compile;

    if(err) { //javac error (not compile error)
      workerObj.errMsg = err;
      workerObj.errCode = COMPILE_THREAD_FAIL;
      return done(workerObj);
    }

    if (stderr) { //javac OK, but we have compile error
      compile.status = 'Compile Error';
      compile.error = 'stderr';
      workerObj.errCode = COMPILE_ERROR;
      return done(workerObj);
    }

    done(null, workerObj);
  }); 
}

var execDefaults = {
  'procLimit': 15,
  'memLimit': 32768,
  'fileLimit': 32768,
  'jvmMemLimit': 32,
  'timeLimit': 10,
  'cpuTimeLimit': 10
};

function execute(test, workerObj) {
  return function (done) {
    var javaOutBuff = '';
    var safeOutBuff = '';

    //chroot, safexec and java command arguments
    var args = [path.join(config.root, 'jail'),
      '/safeexec', ///chroot cmd
      '--nproc', test.procLimit || execDefaults.procLimit,
      '--mem', test.memLimit || execDefaults.memLimit,
      '--fsize', test.fileLimit || execDefaults.fileLimit,
      '--cpu', test.cpuTimeLimit || execDefaults.cpuTimeLimit,
      '--clock', test.timeLimit || execDefaults.timeLimit,
      '--exec', '/java/bin/java',
      '-cp', '/' + workerObj.jailTmpPath,
      '-Xmx' + (test.jvmMemLimit || execDefaults.jvmMemLimit) + 'm',
      test.mainClassName || 'Main' //main class name
    ];

    log.debug(args);
    //Command is chroot to use jail along with arguments
    var javaExec = spawn('chroot', args, {'stdio': 'pipe'});
    javaExec.stdin.end(test.testInput); //Feed input to test code
    
    javaExec.stdout.on('data', function (data) {
      javaOutBuff += data; //This stdout comes from safeexec
    });

    javaExec.stderr.on('data', function (data) {
      safeOutBuff += data;
      //This stderr is from chroot or safexeec if there is something wrong
      //with any of them, otherwise its java's stdout
    });

    javaExec.on('close', function (code) { //Execution finished
      log.debug('javaExec exit code: ' + code);
      if(code !== 0) { // Non 0 exit code here means either chroot or safeexec failed
        workerObj.errMsg = safeOutBuff;
        workerObj.errCode = JAVA_THREAD_FAIL;
        return done(workerObj);
      }

      done(null, safeOutBuff, javaOutBuff);
    });
  };
}

function veredict(test, workerObj) {
  return function (safeOutBuff, javaOutBuff, done) {
    log.debug({'safeExecOut': safeOutBuff, 'javaExecOut': javaOutBuff});

    var safeExecOut = safeOutBuff.split(os.EOL);
    var safeExecN = safeExecOut.length - 1; //-1 for the last empty string

    //Gather execution data
    var results = {
      'status': safeExecOut[safeExecN - 4],
      'elapsed time': safeExecOut[safeExecN - 3].split(': ')[1],
      'memory usage': safeExecOut[safeExecN - 2].split(': ')[1],
      'cpu usage': safeExecOut[safeExecN - 1].split(': ')[1]
    };
    test.results = results; //Place it on test

    if (results.status != 'OK') { //Not OK, lets check what happened...
      //If java finished with error we gather stack, otherwise a limit was exceeded
      if (results.status.indexOf('Command exited with non-zero status') != -1) {
        results.status = 'Runtime Exception';
        results.stackTrace = [];
        for (var i = 0; i < safeExecN - 4; i++) {
          results.stackTrace.push(safeExecOut[i]);
        }
      }

      return done();
    }

    log.debug({
      'expected': test.testOutput,
      'received': javaOutBuff
    });

    //Split lines and clean last empty line
    var javaOutLines = javaOutBuff.split(os.EOL);
    if (javaOutLines[javaOutLines.length-1].length === 0) {
      javaOutLines.pop();
    }

    //Split lines and clean last empty line
    var testOutLines = test.testOutput.split(os.EOL);
    if (testOutLines[testOutLines.length-1].length === 0) {
      testOutLines.pop();
    }

    //Initially check number of lines
    if (testOutLines.length != javaOutLines.length) {
      results.status = 'Wrong Answer';
      return done();
    }

    var N = testOutLines.length;

    //Go trough each line comparing, if one fails, we stop
    async.every(_.range(N), function (i, callback) {
      callback(testOutLines[i].trim() === javaOutLines[i].trim());
    }, function (result) {
      results.status = (result ? 'Correct' : 'Wrong Answer');
      return done();
    });
  };
}

function runSrc(workerObj, done)  {
  workerObj.status = 'Running';
  async.eachSeries(workerObj.tests, function (test, cb) {
    async.waterfall([
      execute(test, workerObj),
      veredict(test, workerObj)
    ], cb);
  }, function (err) {
    done(err, workerObj);
  });
}

function postprocess(workerObj, done) {
  callback(workerObj);
}

function deleteTmpDir(tmpDir) {
  if(tmpDir) {
    //Delete temp folder after 5 seconds
    setInterval(rimraf, 1000*5, tmpDir, function (err){
      if(err) {
        log.warn(err);
      }
    });
  }
}

function queueWorker(submission, callback) {
  async.waterfall([
    preprocess(submission),
    setupJail,
    fetchRepo,
    fetchTestCases,
    compileSrc,
    runSrc,
    postprocess
  ], function (err, result) {
    //Error or not, delete temp folder
    deleteTmpDir(err.tmpPath || result.tmpPath);

    if (err) {
      switch(err.errCode) {
        case COMPILE_ERROR:
          log.debug(err.errMsg);
          err.status = 'Compiler Error';
          break;

        case JAIL_FAIL:
        case COMPILE_THREAD_FAIL:
        case JAVA_THREAD_FAIL:
          log.error(err.errMsg);
          err.status = 'Submission Error';
          break;
        default:
          log.error(err.errMsg);
          err.status = 'Submission Error - Unknown';
          break;
      }

      return callback(err);
    }

    result.status = 'Done';

    return callback(result);
  });
}

var _queue = async.queue(queueWorker, concurrency);

_queue.saturated = function() {};
_queue.empty = function() {};
_queue.drain = function() {};

module.exports = _queue;