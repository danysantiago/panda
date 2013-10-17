(function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');

  var Project = require('./Models/Projects');
  var proj = new Project(console.log);

  var name = process.argv[2],
  user = process.argv[3];

  proj.archive(name, user, function(err,res,body){
    console.log(body);
  });  

}).call(this);
