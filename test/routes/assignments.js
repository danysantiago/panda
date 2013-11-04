var config = require('../../lib/config/config.js'),
    request = require('request'),
    url = require('url'),
    expect = require('chai').expect,
    async = require('async'),
    fs = require('fs');

var test = function() {

  var baseUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/assignments';

  var loginUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/auth/login';

  var coursesUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/courses';

  var usersUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/users';


  var fakeUser = {
    'email': 'juan.fantasma@upr.edu',
    'password': '12345',
    'firstName': 'Juan',
    'lastName': 'Fantasma',
    'role': 'Professor'
  };

  var fakeAssignment = {
    'name': 'A fake assignment',
    'shortDescription': 'Not a real assignment',
    'creationDate': '2013-11-02T18:41:55.410Z',
    'deadline': '11/11/2013',
    'numOfTries': 2,
  };

  var fakeTestCase = {
    'score': 10,
    'timeLimit': 10,
    'memLimit': 5,
    'testInput': '5\n1 2\n2 3\n1 4\n3 4\n2 4',
    'testOutput': '0, 1, 2, 1'
  };

  var courseId;
  var testCaseId;

  describe('Assignments Routes', function() {

    before(function(done) {

      async.waterfall([
        function (callback) {
          var reqParams = {
            'url': usersUrl,
            'method': 'POST',
            'json': true,
            'body': fakeUser
          };

          request(reqParams, function (err, res, body) {
            expect(res).to.exist;
            expect(res.statusCode).to.equal(201);
            fakeUser._id = body._id; //Get id of created user
            callback();
          });
        },

        function (callback) {
          var reqParams = {
            'url': loginUrl,
            'method': 'POST',
            'json': true,
            'body': {
              'email': fakeUser.email,
              'password': fakeUser.password
            },
            'jar': true
          };

          request(reqParams, function (err, res, body) {
            expect(res).to.exist;
            expect(res.statusCode).to.equal(200);
            callback();
          });
        },

        function (callback) {
          request.get(coursesUrl, {'json':true, 'jar': true}, function (err, res, body) {
            expect(res).to.exist;
            expect(res.statusCode).to.equal(200);
            expect(body).to.be.a('array');
            expect(body).to.have.length.above(0);
            fakeAssignment.Course = body[0]._id;
            done();
          });
        }

      ], done);
    });

    it('Create Assignment', function(done) {
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
        'body': fakeAssignment,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        fakeAssignment = body; //Get id of created course
        done();
      });
    });

    it('Fail creating assignment with missing payload', function(done) {
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('Get created assignment', function(done) {
      var reqUrl = baseUrl + '/' + fakeAssignment._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.name).to.equal(fakeAssignment.name);
        done();
      });
    });

    it('Get multiple assignments', function(done) {
      var reqUrl = baseUrl;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        done();
      });
    });

    it('Get an assignments and his submissions', function(done) {
      var reqUrl = baseUrl + '/' + fakeAssignment._id + '?submissions=true';

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.have.property('submissions');
        expect(body.submissions).to.be.a('array');
        done();
      });
    });

    it('Add test case to assignment', function(done) {
      var url = baseUrl + '/' + fakeAssignment._id + '/test'
      var reqParams = {
        'url': url,
        'method': 'POST',
        'json': true,
        'body': fakeTestCase,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        done();
      });
    });

    it('Check test case was added to assignment', function(done) {
      var reqUrl = baseUrl + '/' + fakeAssignment._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.TestCases).to.be.a('array');
        expect(body.TestCases).to.have.length.above(0);
        testCaseId = body.TestCases[0]._id;
        done();
      });
    });

    it('Delete test case', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeAssignment._id + '/test/' + testCaseId,
        'method': 'DELETE',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('Check test case was deleted in assignment', function(done) {
      var reqUrl = baseUrl + '/' + fakeAssignment._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.TestCases).to.be.a('array');
        expect(body.TestCases).to.have.length(0);
        done();
      });
    });

    it('Fail creating test case without payload', function(done) {
      var url = baseUrl + '/' + fakeAssignment._id + '/test'
      var reqParams = {
        'url': url,
        'method': 'POST',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('Create test case with files', function(done) {
      var url = baseUrl + '/' + fakeAssignment._id + '/test'
      var reqParams = {
        'url': url,
        'method': 'POST',
        'jar': true
      };

      var r = request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        done();
      });
      var form = r.form();
      form.append('score', fakeTestCase.score);
      form.append('timeLimit', fakeTestCase.timeLimit);
      form.append('memLimit', fakeTestCase.memLimit);
      form.append('testInput', fs.createReadStream(__dirname + '/../res/testInput.txt'));
      form.append('testOutput', fs.createReadStream(__dirname + '/../res/testOutput.txt'));
      form.append('testerFile', fs.createReadStream(__dirname + '/../res/ExampleProgram.java'));
    });

    it('Delete assignment', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeAssignment._id,
        'method': 'DELETE',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('Fail deleting already deleted assignment', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeAssignment._id,
        'method': 'DELETE',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Fail getting deleted assignment', function(done) {
      var reqUrl = baseUrl + '/' + fakeAssignment._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    after(function(done) {

      var reqParams = {
        'url': usersUrl + '/' + fakeUser._id,
        'method': 'DELETE',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
};

test();