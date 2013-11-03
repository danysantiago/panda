var config = require('../../lib/config/config.js'),
    request = require('request'),
    url = require('url'),
    expect = require('chai').expect,
    async = require('async');

var test = function() {

  var baseUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/courses';

  var loginUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/auth/login';

  var usersUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/users';

  var fakeUser = {
    'email': 'alguien.fantasma@upr.edu',
    'password': '12345',
    'firstName': 'Alguien',
    'lastName': 'Fantasma',
    'role': 'Student'
  };

  var fakeCourse = {
    'name': 'A Fake Course',
    'code': 'FAKE3001',
    'year': '2013',
    'semester': 'Fall',
  };

  describe('Courses Routes', function() {

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
        }
      ], done);
    });

    it('Create Course', function(done) {
      fakeCourse.grader = fakeUser._id;
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
        'body': fakeCourse,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        fakeCourse._id = body._id; //Get id of created course
        done();
      });
    });

    it('Fail creating course with missing payload', function(done) {
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

    it('Get created course', function(done) {
      var reqUrl = baseUrl + '/' + fakeCourse._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.code).to.equal(fakeCourse.code);
        done();
      });
    });

    it('Get multiple courses', function(done) {
      var reqUrl = baseUrl;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        done();
      });
    });

    it('Get a course and his users, assignments and submissions', function(done) {
      var reqUrl = baseUrl + '/' + fakeCourse._id + '?users=true&assignments=true&submissions=true';

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.have.property('users');
        expect(body.users).to.be.a('array');
        expect(body).to.have.property('assignments');
        expect(body.assignments).to.be.a('array');
        expect(body).to.have.property('submissions');
        expect(body.submissions).to.be.a('array');
        done();
      });
    });

    it('Add student to course', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeCourse._id + '/users/' + fakeUser._id,
        'method': 'POST',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('Get course and check student was added', function(done) {
      var reqUrl = baseUrl + '/' + fakeCourse._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body).to.have.property('Users');
        expect(body.Users).to.be.a('array');
        expect(body.Users).to.have.length.above(0);
        expect(body.Users[0]).to.equal(fakeUser._id);
        done();
      });
    });

    it('Fail adding student to unknown course', function(done) {
      var url = baseUrl + '/' + '000000000000000000000001' +
        '/users/' + fakeUser._id;

      var reqParams = {
        'url': url,
        'method': 'POST',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Fail adding unknown student to course', function(done) {
      var url = baseUrl + '/' + fakeCourse._id +
        '/users/' + '000000000000000000000001';

      var reqParams = {
        'url': url,
        'method': 'POST',
        'json': true,
        'jar': true
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Remove user from course', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeCourse._id + '/users/' + fakeUser._id,
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

    it('Fail removing user from unknown course', function(done) {
      var url = baseUrl + '/' + '000000000000000000000001' +
        '/users/' + fakeUser._id;

      var reqParams = {
        'url': url,
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

    it('Get course and check student was removed', function(done) {
      var reqUrl = baseUrl + '/' + fakeCourse._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body).to.have.property('Users');
        expect(body.Users).to.be.a('array');
        expect(body.Users).to.have.length(0);
        done();
      });
    });

    it('Delete course', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeCourse._id,
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

    it('Fail deleting already deleted course', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeCourse._id,
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

    it('Fail getting deleted course', function(done) {
      var reqUrl = baseUrl + '/' + fakeCourse._id;

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