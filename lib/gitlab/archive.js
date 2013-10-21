(function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');

  var Repositories = require('./Models/Repositories');
  var repo = new Repositories(console.log);

  var params = {
  	name: process.argv[2],
    username: process.argv[3]
};

  repo.archive(params, function(err,res,body){
    console.log(body);
  });  

}).call(this);
