var config = require('./lib/config/config.js'),
    express = require('express'),
    app = express(),
    mongodb = require('mongodb');
    bunyan = require('bunyan');

var Database = require('./lib/models/database.js');

var log = bunyan.createLogger({'name': 'panda', 'level': config.debugLvl});

app.configure(function() {
  app.set('name', config.appName);

  //Use temp folder cleaner
  require('./lib/tmpClean.js')(config.root + 'tmp', log);
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
app.use(express.favicon());
app.use(express.static(config.root + '/public'));

// Auth and Sessions middleware
var passport = require('./lib/config/passport.js');
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({
  'secret': 'aguacateao'
}));
app.use(passport.initialize());
app.use(passport.session());

//Database object middleware
app.use(function (req, res, next) {
  req.db = Database.getDB();
  next();
})

// Routes
app.use('/auth', require('./lib/routes/auth.js'));

app.use('/api', require('./lib/routes/users.js'));
app.use('/api', require('./lib/routes/courses.js'));
app.use('/api', require('./lib/routes/assignments.js'));
app.use('/api', require('./lib/routes/submissions.js'));

//Test routes
app.use('/test', require('./test/jsubmit.js'));
app.use('/test', require('./test/zipsubmit.js'));
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

mongodb.connect(config.dbAddress, function (err, db) {
  if(err) {
    return log.error('Could not connect to mongodb', err);
  }

  Database.setDB(db);
  log.info('Database connection successful - ' + config.dbAddress);

  app.listen(config.appPort);
  log.info('App started, listening at port %s', config.appPort);
});

module.exports.log = log;