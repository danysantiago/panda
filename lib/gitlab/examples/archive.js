(function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');

  var Gitlab = require('../Gitlab');
  var gitlab = new Gitlab(console.log);

  var params = {
  	name: process.argv[2],
    username: process.argv[3]
  };

  gitlab.repository.archive(params, function(err,res,body){
    console.log(body);
  });  

}).call(this);
