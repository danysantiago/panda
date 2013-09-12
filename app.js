var config = require("./lib/config.js"),
    express = require("express"),
    app = express(),
    dbClient = require("mongodb");

app.configure(function() {
  app.set("name", config.appName);
});

/* Request Logger */
app.use(function (req, res, next) {
  console.log("%s %s", req.method, req.url);
  next();
});

app.use(express.static(__dirname + "/public"));

dbClient.connect(config.dbAddress, function (err, db) {
  if(err) {
    return console.error("Could not connect to mongodb", err);
  }

  console.log("Database connection successful");

  app.listen(config.appPort);
  console.log("App started, listening at port %s", config.appPort);
});