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

  gitlab.projects.show(projectId, function(project) {
    console.log;
    console.log("=== Project ===");
    return console.log(project);
  });

  gitlab.projects.members.list(projectId, function(members) {
    console.log("");
    console.log("=== Members ===");
    return console.log(members);
  });

}).call(this);