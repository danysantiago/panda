var config = require("./lib/config.js"),
    express = require("express"),
    app = express(),
    dbClient = require("mongodb");
    bunyan = require('bunyan');

var log = bunyan.createLogger({'name': 'panda'});

var exec = require('child_process').exec;

app.configure(function() {
  app.set("name", config.appName);
});

// Request Logger
app.use( function (req, res, next) {
  log.info("%s %s", req.method, req.url);
  req.log = log;
  next();
});

// Compress static files
app.use(express.compress({
  filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
  },
  level: 9
}));

// Static files
app.use(express.favicon());
app.use(express.static(config.root + '/public'));

// Routes
app.use("/api", require("./lib/routes/users.js"));
app.use("/api", require("./lib/routes/courses.js"));
app.use("/api", require("./lib/routes/assignments.js"));
app.use("/api", require("./lib/routes/submissions.js"));


app.post("/jsubmit", express.bodyParser({'uploadDir': config.root + '/tmp'}), function (req, res) {
  req.log.info({'uploadedFile': req.files.jfile});
  var fileName = req.files.jfile.originalFilename;
  var className = fileName.substring(0, fileName.length-5);
  var filePath = req.files.jfile.path;
  var cmd = 'javac ' + '-d "' + __dirname + '/tmp" ' + filePath;
  req.log.info(cmd);
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

// Error Handler
app.use(function (err, req, res, next){
  log.error(err.stack);
  res.send(500, '500 - Something broke!');
});

// Not Found
app.use(function (req, res, next){
  res.send(404, '404 - What your looking for is in "El Gara"');
});

dbClient.connect(config.dbAddress, function (err, db) {
  if(err) {
    return log.error("Could not connect to mongodb", err);
  }

  log.info("Database connection successful");

  app.listen(config.appPort);
  log.info("App started, listening at port %s", config.appPort);
});