(function() {
  var Gitlab, credentials, gitlab;

  process.stdout.write('\u001B[2J\u001B[0;0f');

  Gitlab = require('gitlab').ApiV3;

  credentials = require('./credentials');

  gitlab = new Gitlab({
    url: credentials.url,
    token: credentials.token,
    verbose: true
  });

  params = {
    user_id: parseInt(process.argv[2]),
    name: process.argv[3]
  };

  gitlab.projects.createu(params, function(project) {
    if(project.message)
      console.log(project.message);
    else{
      console.log(project);

      params = {
        user_id: 3,
        id: project.id,
        access_level: 40
      };

      gitlab.projects.addMember(params, function (data) {
        //console.log(data);

        var exec = require('child_process').exec;
         
        exec('./script.sh ' + project.name.toLowerCase() + ' nelii28o2 mofongo ' + project.owner.username,
        function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
      
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    
    });

       //TODO (Nelian): now we have to send an email to user with the url and instructions to use their repository.
    }
  });

  

}).call(this);
