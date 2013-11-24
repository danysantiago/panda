/**
  queue.js - Queue Code Worker
**/

var config = require('./config/config.js'),
    mongodb = require('mongodb'),
    Grid = mongodb.Grid,
    GridStream = require('gridfs-stream'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    os = require('os'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore'),
    utils = require('./utils.js'),
    bunyan = require('bunyan');

var database  = require('./models/database');

var Gitlab = require('./gitlab/Gitlab.js');

var log = bunyan.createLogger({'name': 'panda-queue', 'level':config.debugLvl});

var CONCURRENCY_LVL = 2;

var JAIL_FAIL = 1;
var COMPILE_THREAD_FAIL = 2;
var COMPILE_ERROR = 3;
var JAVA_THREAD_FAIL = 4;
var GITLAB_FAIL = 5;
var DB_FAIL = 6;
var TAR_FAIL = 7;
var PMD_FAIL = 8;

function preprocess(submission) {
  return function (done) {
    log.debug('Preprocess Stage');

    //worker to be passed around
    var workerObj = {
      '_id': submission._id
    }; 
      
    workerObj.submitDate = submission.submitDate;

    //workerObj.submission = submission;

    workerObj.User = submission.User;
    workerObj.Course = submission.Course;
    workerObj.Assignment = submission.Assignment;

    workerObj.user = submission.user;
    workerObj.assignment = submission.assignment;
    workerObj.repo = submission.repo;

    workerObj.status = 'Judging';
    workerObj.finalVerdict = workerObj.status;

    //Update submission
    database.getDB().collection('submissions').update({'_id': workerObj._id},
      workerObj, function (err, updateInfo) {

      if (err) {
        workerObj.err = err;
        workerObj.errCode = DB_FAIL;
        return done(workerObj);
      }

      log.debug({'received code worker': workerObj});

      done(null, workerObj);
    });

  };
}

function setupJail(workerObj, done) {
  log.debug('Setup Jail Stage');

  //Generate tmp dir inside folder, we need path from root and relative to jail
  workerObj.tmpPath = utils.generateTmpPath(path.join(config.root,'jail/tmp'));
  var tmpPathSplit = workerObj.tmpPath.split('/');
  workerObj.jailTmpPath = path.join('tmp', tmpPathSplit[tmpPathSplit.length-1]);
  
  //Create temp directory inside jail
  fs.mkdir(workerObj.tmpPath, 0776, function (err) {
    if(err) {
      workerObj.errMsg = err;
      workerObj.errCode = JAIL_FAIL;
      return done(workerObj);
    }

    log.debug('setupJail sucessful');
    log.debug({
      'tmpPath': workerObj.tmpPath,
      'jailTmpPath': workerObj.jailTmpPath,
    });
    
    done(null, workerObj);
  });
}

function fetchRepo(workerObj, done) {
  log.debug('Fetch Repo Stage');

  var gitlab = new Gitlab(log); //We use gitlab to get files from repo

  var singleFileName = workerObj.assignment.singleFileName;
  var writeStream;
  var projectParams;

  async.waterfall([
    function (_done) {
      if(singleFileName) {
        log.debug('Is single file assignment');
        workerObj.singleFileJudge = true;
      } else {
        log.debug('Is NOT single file assignment');
        workerObj.singleFileJudge = false;
      }

      _done(null, workerObj.singleFileJudge);
    },

    function (isSingleFile, _done) {

      if (isSingleFile) {
        //Single file repo, we have to get that single file from the repository
        workerObj.repoZipPath = path.join(workerObj.tmpPath, singleFileName);
        writeStream = fs.createWriteStream(workerObj.repoZipPath);
        projectParams = {
          'id': workerObj.repo.id,
          'sha': 'master', //We get it from the master branch
          'filepath': singleFileName
        };

        log.debug('fetching single file from repo...');
        log.debug(projectParams);

        gitlab.repository.getBlob(projectParams, writeStream, _done);
      } else {
        //Not single file, then we get the whole repo as archive
        workerObj.repoZipPath = path.join(workerObj.tmpPath,
          workerObj.repo.name + '.tar.gz'); //Gitlab give us .tar.gz file
        writeStream = fs.createWriteStream(workerObj.repoZipPath);
        projectParams = {
          'username': utils.emailToUsername(workerObj.user.email),
          'name': workerObj.repo.name
        };

        log.debug('fetching repo archive...');
        log.debug(projectParams);

        gitlab.repository.archive(projectParams, writeStream, _done);
      }
    },

    function (res, body, _done) {
      if(res && res.statusCode === 200) {
        writeStream.on('finish', function() {
          _done();
        });
      } else {
        //Here we are considering the single file or the repo not being found
        //as a submission error
        var err;
        
        if(res) {
          err = {'error': {
            'statusCode': res.statusCode,
            'body': body
          }};
        } else {
          err = {'error': 'gitlab request failed.'};
        }
        
        _done(err);
      }
    }
  ], function (err) {
    if (err) {
      workerObj.err = err;
      workerObj.errCode = GITLAB_FAIL;
      return done(workerObj);
    }

    log.debug('fetching repo sucessful');

    done(null , workerObj);
  });
}

function extractRepo(workerObj, done) {
  log.debug('Extract Repo Stage');

  //We need to extract the archive because javac dosen't accept .tar.gz as
  //compressed file for the sourcepath argument

  //If its single file no need to extract repo folder
  if(workerObj.singleFileJudge) {
    return done(null, workerObj);
  }

  //Tar command, (v is for verbose outputed to stderr)
  var cmd = ['tar',
    '-xvzf', workerObj.repoZipPath,
    '-C', workerObj.tmpPath,
    workerObj.repo.name
  ].join(' ');

  log.debug({'tar cmd': cmd});

  var tar = exec(cmd, function (err, stderr, stdout) {
    if(err) {
      workerObj.errMsg = err;
      workerObj.errCode = TAR_FAIL;
      return done(workerObj);
    }

    log.debug('Tar cmd output:');
    log.debug(stderr);
    //log.debug(stdout);

    // if (stderr) {
    //   workerObj.errMsg = stderr;
    //   workerObj.errCode = TAR_FAIL;
    //   return done(workerObj);
    // }

    done(null, workerObj);
  });
}

function fetchTestCases(workerObj, done) {
  log.debug('Fetch Test Cases Stage');

  //We use GridFs to get testerFiles
  var grid = new Grid(database.getDB());

  workerObj.tests = workerObj.assignment.TestCases;
  delete workerObj.assignment.TestCases; //No need for duplicated data

  var totalScore = 0;
  
  //We iterate trough each test case mapping them for the worker
  async.map(workerObj.tests, function (testCase, next) {
    var mappedTC;

    mappedTC = {
      'score': testCase.score,
      'timeLimit': testCase.timeLimit,
      'memLimit': testCase.memLimit
    };

    //Total socre sum
    totalScore = totalScore + testCase.score;

    if (testCase.type === 'Exec') {
      //If test case type is executable we need to get testerFile and place it
      //inside jail
      var tester = testCase.resource.tester;
      
      mappedTC.testOutput = testCase.resource.output;
      grid.get(tester._id, function (err, data) {
        if (err) {
          return next(err);
        }

        var testerPath = path.join(workerObj.tmpPath, tester.name);
        fs.writeFile(testerPath, data, function (err) {
          //We remove the .java extension, we need class name for runtime
          mappedTC.mainClassName = tester.name.substring(0,
            tester.name.length-5);

          next(err, mappedTC);
        });

      });
    } else {
      //Simple I/O cases, the mainClass to be tested is the single file in the
      //assignment. No need to get things from GridFs still should
      //consider having big input and output as files. 16MB on BSON, which
      //includes test cases info, assignment and the inputs and outputs
      mappedTC.testInput = testCase.resource.input;
      mappedTC.testOutput = testCase.resource.output;

      var singleFileName = workerObj.assignment.singleFileName;
      mappedTC.mainClassName = singleFileName.substring(0,
        singleFileName.length-5);

      next(null, mappedTC);
    }

  }, function (err, testCases) {
    if (err) {
      workerObj.err = err;
      workerObj.errCode = DB_FAIL;
      return done(workerObj);
    }

    //Place new info into worker
    workerObj.score = 0;
    workerObj.acceptedTestCases = 0;
    workerObj.totalScore = totalScore;
    workerObj.totalTestCases = testCases.length;
    workerObj.tests = testCases;

    log.debug('fetching test cases sucessful');
    log.debug({
      'totalScore': workerObj.totalScore,
      'totalTestCases': workerObj.totalTestCases
    });

    done(null, workerObj);
  });
}

function compileSrc(workerObj, done) {
  log.debug('Compile Stage');

  workerObj.status = 'Compiling';
  var compileStart = Date.now(); //Get start time for compile time

  var tmpPath = workerObj.tmpPath;
  var repoZipPath = workerObj.repoZipPath;
  var sourcePath = path.join(tmpPath, workerObj.repo.name);

  //javac command
  var cmd = ['javac',
    '-d', tmpPath, //output dir
    '-sourcepath', tmpPath + ':' + sourcePath, //source path is extracted repo
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
    var compileTime = (Date.now() - compileStart) + ' milliseconds';
    log.debug('Compile time: %s', compileTime);

    //Compile status object
    var compile = {
      'status': '',
      'time': compileTime
    };
    workerObj.compile = compile;

    // if(err) { //javac error (confused with compile error)
    //   workerObj.errMsg = err;
    //   workerObj.errCode = COMPILE_THREAD_FAIL;
    //   return done(workerObj);
    // }

    if (stderr) { //javac OK, but we have compile error
      compile.status = 'Compile Error';
      compile.error = stderr;
      workerObj.errCode = COMPILE_ERROR;
      return done(workerObj);
    }

    compile.status = 'OK';
    done(null, workerObj);
  }); 
}

function checkQuality(workerObj, done) {
  log.debug('Quality Check Stage');

  //Path to PMD
  var pmdPath = path.join(config.root, 'pmd/bin/run.sh');

  var rules = [
    'java-basic',
    'java-braces',
    'java-clone',
    'java-codesize',
    'java-comments',
    //'java-controversial', //Gave weird DD-anomaly messages
    //'java-coupling', //Gives weird error
    'java-design',
    'java-empty',
    'java-finalizers',
    'java-imports',
    //'java-j2ee', //Not needed
    //'java-javabeans', //Not needed
    //'java-junit', //Not needed
    //'java-logging-java', //No more warns about system.out.println
    //'java-migrating', //npi
    'java-naming',
    'java-optimizations',
    'java-strictexception',
    'java-strings',
    //'java-sunsecure', //wtf?
    //'java-typeresolution', //idk
    'java-unnecessary',
    'java-unusedcode'
  ].join(',');
  
  var cmd = [pmdPath, 'pmd',
    '-d', workerObj.tmpPath,
    '-f', 'text',
    '-language', 'java',
    '-R', rules,
  ].join(' ');

  log.debug({'pmd cmd': cmd});

  var pmd = exec(cmd, function (err, stderr, stdout) {
    if(err) {
      workerObj.errMsg = err;
      workerObj.errCode = PMD_FAIL;
      return done(workerObj);
    }

    log.debug('PMD cmd output:');
    log.debug(stderr);
    log.debug(stdout);

    var tmpPathRegEx = new RegExp(workerObj.tmpPath, 'g');
    var qualityOut = stderr.split(os.EOL);
    var qualityOutFormatted = [];
    
    async.eachSeries(qualityOut, function (line, next) {
      line = line.replace(tmpPathRegEx, '');

      if(!workerObj.singleFileJudge) {
        _.each(workerObj.tests, function (test) {
          if (line && line.indexOf(test.mainClassName) !== -1) {
            line = null;
          }
        });
      }

      if(!line) {
        return next();
      }

      qualityOutFormatted.push(line);

      next();

    }, function (err) {
      //Err here means is our fault and it should crash

      workerObj.quality = qualityOutFormatted.join('\n');

      done(null, workerObj);
    });
  });
}

// Execution Default Limits
var execDefaults = {
  'procLimit': 20,
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
      if(code !== 0) {
        // Non 0 exit code here means either chroot or safeexec failed
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
    //log.debug({'safeExecOut': safeOutBuff, 'javaExecOut': javaOutBuff});

    //TODO (Daniel): Read below
    //Hammer to make test output to string for splitting, look into this
    if(typeof test.testOutput !== 'string') {
      test.testOutput = test.testOutput.toString();
    }

    var safeExecOut = safeOutBuff.split(os.EOL);
    var safeExecN = safeExecOut.length - 1; //-1 for the last empty string

    //Gather execution data
    var result = {
      'status': safeExecOut[safeExecN - 4],
      'elapsed time': safeExecOut[safeExecN - 3].split(': ')[1],
      'memory usage': safeExecOut[safeExecN - 2].split(': ')[1],
      'cpu usage': safeExecOut[safeExecN - 1].split(': ')[1]
    };

    test.result = result; //Place it on test

    /**
      We don't include the programs output as part of the submission doc because
      it might be used as an buffer overflow for the 16MB limit of a BSON
    **/
    
    //test.received = javaOutBuff;

    if (result.status !== 'OK') { //Not OK, lets check what happened...
      //If java finished with error we gather stack, otherwise a limit
      // was exceeded
      if (result.status.indexOf('Command exited with non-zero status') !== -1){
        result.status = 'Runtime Exception';
        result.stackTrace = [];
        for (var i = 0; i < safeExecN - 4; i++) {
          result.stackTrace.push(safeExecOut[i]);
        }
      }

      return done();
    }

    // log.debug({
    //   'expected': test.testOutput,
    //   'received': javaOutBuff
    // });

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
    if (testOutLines.length !== javaOutLines.length) {
      result.status = 'Wrong Answer';
      return done();
    }

    var N = testOutLines.length;

    //Go trough each line comparing, if one fails, we stop
    async.every(_.range(N), function (i, callback) {
      callback(testOutLines[i].trim() === javaOutLines[i].trim());
    }, function (result) {
      result.status = (result ? 'Correct' : 'Wrong Answer');

      if(result) {
        workerObj.score = workerObj.score + test.score;
        workerObj.acceptedTestCases = workerObj.acceptedTestCases + 1;
      }

      return done();
    });
  };
}

function runSrc(workerObj, done)  {
  log.debug('Running Stage');

  workerObj.status = 'Running';
  async.eachSeries(workerObj.tests, function (test, cb) {
    async.waterfall([
      execute(test, workerObj),
      veredict(test, workerObj)
    ], cb);
  }, function (err) {

    log.debug('running stage completed');

    done(err, workerObj);
  });
}

function postprocess(workerObj, done) {
  log.debug('Postprocess Stage');

  workerObj.status = 'Done';

  if(workerObj.acceptedTestCases === workerObj.totalTestCases) {
    workerObj.finalVerdict = 'Accepted';
  } else {
    workerObj.finalVerdict = 'Wrong Answer';
  }

  //Insert submission into Database
  database.getDB().collection('submissions').update({'_id': workerObj._id},
      workerObj, function (err) {
    if (err) {
      workerObj.err = err;
      workerObj.errCode = DB_FAIL;
      return done(workerObj);
    }

    done(null, workerObj);
  });
}

function deleteTmpDir(tmpDir) {
  if(tmpDir) {
    //Delete temp folder after 3 seconds
    setInterval(rimraf, 1000*3, tmpDir, function (err){
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
    extractRepo,
    fetchTestCases,
    compileSrc,
    checkQuality,
    runSrc,
    postprocess
  ], function (err, result) {
    //Note that err is a workerObj

    try { //Error or not, delete temp folder
      if(err && err.tmpPath) {
        deleteTmpDir(err.tmpPath);
      } else if (result && result.tmpPath) {
        deleteTmpDir(result.tmpPath);
      }
    } catch (err) {
      log.warn('Unable to delete temp jail dir:');
      log.warn(err);
    }

    if (err) {
      switch(err.errCode) {
        
      case COMPILE_ERROR:
        log.debug(err.errMsg);
        err.status = 'Compile Error';
        break;

      case JAIL_FAIL:
      case COMPILE_THREAD_FAIL:
      case JAVA_THREAD_FAIL:
      case GITLAB_FAIL:
      case DB_FAIL:
      case TAR_FAIL:
      case PMD_FAIL:
        log.error(err.errMsg);
        err.status = 'Submission Error';
        break;

      default:
        log.error(err.errMsg);
        err.status = 'Submission Error - Unknown';
        break;
      }

      //Not a successful run, we still need to save submission into db
      err.finalVerdict = err.status;
      err.status = 'Done';
      database.getDB().collection('submissions').update({'_id': err._id},
          err, function (err) {
        if (err) {
          //If error inserting, nothing we can do, log it
          log.error(err);
        }
      });

      return callback(err);
    }

    return callback(result);
  });
}

function onQueueSaturated() {

}

function onQueueEmpty() {

}

function onQueueDrain() {

}

var singleton = (function() {
  var instance;

  function init() {
    var queue = async.queue(queueWorker, CONCURRENCY_LVL);
    queue.saturated = onQueueSaturated;
    queue.empty = onQueueEmpty;
    queue.drain = onQueueDrain;
    return queue;
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