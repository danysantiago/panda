var config = require('./lib/config/config.js'),
    express = require('express'),
    app = express(),
    mongodb = require('mongodb');
    bunyan = require('bunyan');

var Database = require('./lib/models/database.js');

var log = bunyan.createLogger({'name': 'panda', 'level': config.debugLvl});

app.configure(function() {
  app.set('name', config.appName);

  var env = app.get("env"); //Get node enviroment
  if (env === "development") {
    log.warn("Server Configured for Development Mode");

    // App kill route to finish running after tests complete.
    app.use("/kill/after/tests", function (req, res, next) {
      res.send(200, "Bye, Bye");
      log.warn("Server Kill Requested.");
      process.exit(1);
    });

  } else if (env === "production") {
    log.warn("Server configured for production mode.");
  }

  //Use temp folder cleaner
  //require('./lib/tmpClean.js')(config.root + 'tmp', log);
});

// Request logger middleware
app.use( function (req, res, next) {
  log.info('%s %s', req.method, req.url);
  req.log = log;
  next();
});

// Static files compress middleware
app.use(express.compress({
  filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
  },
  level: 9
}));

// Static files middleware
app.use(express.favicon(config.root + '/public/favicon.ico'));
app.use(express.static(config.root + '/public'));

// Auth and Sessions middlewares
var passport = require('./lib/config/passport.js');
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({
  'secret': 'aguacateao'
}));
app.use(passport.initialize());
app.use(passport.session());

// Database object middleware
app.use(function (req, res, next) {
  req.db = Database.getDB();
  next();
});

// Auth Routes
app.use('/auth', require('./lib/routes/auth.js'));

// Api Routes
api = express();
api.use(function (req, res, next) {
  // Exception - creating users without logging in
  if(req.url === "/users" && req.method === "POST") {
    return next();
  }

  // Api routes requires a logged user
  if(!req.isAuthenticated()) {
    return res.send(401);
  }
  
  next();
});
api.use(require('./lib/routes/users.js'));
api.use(require('./lib/routes/courses.js'));
api.use(require('./lib/routes/assignments.js'));
api.use(require('./lib/routes/submissions.js'));
app.use('/api', api);

// Test routes
app.use('/test', require('./lib/routes/jsubmit.js'));
app.use('/test', require('./lib/routes/zipsubmit.js'));
app.get('/test/queue', function (req, res, next) {
  require('./lib/queue.js').push({'name': 'testSubmission'}, function (result) {
    res.send(result);
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

//TODO (Daniel): CXheck Jail has been properly setup (/proc), before
//continuing...

mongodb.connect(config.dbAddress, function (err, db) {
  if(err) {
    return log.error('Could not connect to mongodb', err);
  }

  Database.setDB(db);
  log.info('Database connection successful - ' + config.dbAddress);

  app.listen(config.appPort);
  log.info('App started, listening at port %s', config.appPort);
});