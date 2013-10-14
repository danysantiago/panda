      var exec = require('child_process').exec;
      
      exec('./script.sh helloworld nelii28o2 mofongo',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});