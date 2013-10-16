(function() {
  var Gitlab, credentials, gitlab, projectId;

  process.stdout.write('\u001B[2J\u001B[0;0f');

  Gitlab = require('gitlab').ApiV3;

  credentials = require('./credentials');

  gitlab = new Gitlab({
    url: credentials.url,
    token: credentials.token,
    verbose: true
  });

  params = {
    name: process.argv[2], 
    user: process.argv[3],
    url: credentials.url,
    token: credentials.token
  };

  gitlab.projects.getArchive(params, function(response){  

  });

}).call(this);
