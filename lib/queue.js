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

function preprocess(submission) {
  return function (done) {
    var workerObj = {};

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

  fs.mkdir(workerObj.tmpPath, 0776, function (err) {
    done(err, workerObj);
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
  var compileStart = Date.now();

  var tmpPath = workerObj.tmpPath;
  var repoZipPath = workerObj.repoZipPath;

  var cmd = ['javac',
    '-d', tmpPath,
    '-sourcepath', tmpPath + ':' + repoZipPath,
    tmpPath + '/*.java'
  ].join(' ');

  log.debug({'compile cmd': cmd});

  var javac = exec(cmd, function (err, stdout, stderr) {
    log.debug({'javac': {
      'stdout': stdout,
      'stderr': stderr
    }});

    var compileTime = (Date.now() - compileStart) + " miliseconds";
    log.debug('Compile time: %s', compileTime);

    var compile = {
      'status': '',
      'time': compileTime
    };
    workerObj.compile = compile;


    if(err) {
      workerObj.err = err;
      return done(workerObj);
    }

    if (stderr) {
      log.warn(err);
      compile.status = 'Compile Error';
      compile.error = 'stderr';
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
    //Command is chroot to use jail
    var javaExec = spawn('chroot', args, {'stdio': 'pipe'});
    javaExec.stdin.end(test.testInput); //Feed input to test code
    
    javaExec.stdout.on('data', function (data) {
      javaOutBuff += data;
    });

    javaExec.stderr.on('data', function (data) {
      safeOutBuff += data;
    });

    javaExec.on('close', function (code) {
      log.debug('javaExec exit code: ' + code);
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
    test.results = results;

    if (results.status != 'OK') { //Not OK, lets check what happened...
      //If java finished with error we gather stack, otherwise a limit was exceeded
      if (results.status.indexOf('Command exited with non-zero status') != -1) {
        results.status = "Runtime Exception";
        results.stackTrace = [];
        for (var i = 0; i < safeExecN - 4; i++) {
          results.stackTrace.push(safeExecOut[i]);
        }
      }

      return done();
    }

    log.debug({
      "expected": test.testOutput,
      "received": javaOutBuff
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
  async.eachSeries(workerObj.tests, function (test, cb) {
    async.waterfall([
      execute(test, workerObj),
      veredict(test, workerObj)
    ], cb);
  }, function (err) {
    done(null, workerObj);
  });
}

function postprocess(workerObj, done) {

}

function deleteTmpDir(tmpDir) {
  if(tmpDir) {
    setInterval(rimraf, 1000*5, tmpDir, function (err){
      if(err) {
        log.warn(err);
      }
    });
  }
}

function queueWorker(submission, _callback) {
  async.waterfall([
    preprocess(submission),
    setupJail,
    fetchRepo,
    fetchTestCases,
    compileSrc,
    runSrc,
    postprocess
  ], function (err, result) {
    deleteTmpDir(err.tmpPath || result.tmpPath);

    if (err) {

    }
  });
}

var _queue = async.queue(queueWorker, concurrency);

_queue.saturated = function() {};
_queue.empty = function() {};
_queue.drain = function() {};

module.exports = _queue;