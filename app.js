var config = require("./lib/config.js"),
    express = require("express"),
    app = express(),
    dbClient = require("mongodb");

var exec = require('child_process').exec;

app.configure(function() {
  app.set("name", config.appName);
});

/* Request Logger */
app.use(function (req, res, next) {
  console.log("%s %s", req.method, req.url);
  next();
});

app.use(express.static(__dirname + "/public"));

app.use(express.bodyParser({'uploadDir': __dirname + '/tmp'}));

app.post("/jsubmit", function (req, res) {
  console.log(req.files.jfile);
  var fileName = req.files.jfile.originalFilename;
  var className = fileName.substring(0, fileName.length-5);
  var filePath = req.files.jfile.path;
  var cmd = 'javac ' + '-d "' + __dirname + '/tmp" ' + filePath;
  console.log(cmd);
  var javac = exec(cmd, function (err, stdout, stderr) {
    if(err) {
      res.send(stderr);
    } else {
      var runJava = exec('cd ' + __dirname + '/tmp; java ' + className,
        function (err, stdout, stderr) {
          if(err) {
            res.send(stderr);
          } else {
            res.send(stdout);
          }
        });
    }
  });
});

app.use(function (err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

dbClient.connect(config.dbAddress, function (err, db) {
  if(err) {
    return console.error("Could not connect to mongodb", err);
  }

  console.log("Database connection successful");

  app.listen(config.appPort);
  console.log("App started, listening at port %s", config.appPort);
});