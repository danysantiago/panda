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

  projectId = parseInt(process.argv[2]);

  gitlab.projects.delete(projectId, function(project) {
    console.log;
    return console.log(project);
  });

}).call(this);
