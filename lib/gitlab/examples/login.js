(function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');

  var Gitlab = require('../Gitlab');
  var gitlab = new Gitlab(console.log);

  var params = {
      login: process.argv[2],
      email: process.argv[2],
      password: process.argv[3]
    };

    gitlab.session.login(params, function (err,res,body){
     console.log(body);
    }); 

}).call(this);
