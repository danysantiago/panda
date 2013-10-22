(function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');

  var Gitlab = require('../Gitlab');
  var gitlab = new Gitlab(console.log);

  var params = {
    user_id: parseInt(process.argv[2]),
    name: process.argv[3],
  };

  var archive = process.argv[4];

  gitlab.proj.create(params, function(err,res,project){
    params = {
      id: project.id,
      user_id: 3
    }

    gitlab.proj.addMember(params, function (err,res,body){
      setTimeout(function(){
          var exec = require('child_process').exec;
           
          exec('../createRepo.sh ' + project.name.toLowerCase() + ' nelii28o2 mofongo ' + project.owner.username + ' ' + archive,
          function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        });
      }, 1000*2);
    });
  });  

}).call(this);
