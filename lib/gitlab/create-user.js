(function() {
  var Gitlab, credentials, gitlab, params;

  process.stdout.write('\u001B[2J\u001B[0;0f');

  Gitlab = require('gitlab').ApiV3;

  credentials = require('./credentials');

  gitlab = new Gitlab({
    url: credentials.url,
    token: credentials.token,
    verbose: true
  });

  params = {
    email: process.argv[2],
    password: process.argv[3],
    username: process.argv[4],
    name: process.argv[5]
  };

  gitlab.users.create(params, function(user) {
    if(user.message)
      console.log(user.message);
    else
      console.log(user);
  });

}).call(this);


