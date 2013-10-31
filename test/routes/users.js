var config = require('../../lib/config/config.js'),
    request = require('request'),
    url = require('url'),
    expect = require('chai').expect;

var test = function() {

  var baseUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/api/users';

  var loginUrl = config.appProtocol + '://' +
    config.localAddress + ':' +config.appPort +
    '/auth/login';

  var fakeUser = {
    'email': 'alguien.nadie@upr.edu',
    'password': '12345',
    'firstName': 'Alguien',
    'lastName': 'Nadie',
    'role': 'Student'
  };

  describe('User Routes', function() {

    it('Create a User', function(done) {
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
        'body': fakeUser
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        fakeUser._id = body._id; //Get id of created user
        done();
      });
    });

    it('Fail creating user with missing payload', function(done) {
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('Fail creating user with email taken', function(done) {
      var reqParams = {
        'url': baseUrl,
        'method': 'POST',
        'json': true,
        'body': fakeUser
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('Fail logging in with bad username', function(done) {
      var reqParams = {
        'url': loginUrl,
        'method': 'POST',
        'json': true,
        'body': {
          'email': fakeUser.email,
          'password': ''
        }
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

    it('Fail logging in with bad password', function(done) {
      var reqParams = {
        'url': loginUrl,
        'method': 'POST',
        'json': true,
        'body': {
          'email': '',
          'password': fakeUser.password
        }
      };

      request(reqParams, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

    it('Login as user', function(done) {
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
        done();
      });
    });

    it('Get created user', function(done) {
      var reqUrl = baseUrl + '/' + fakeUser._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.email).to.equal(fakeUser.email);
        done();
      });
    });

    it('Get multiple users', function(done) {
      var reqUrl = baseUrl;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.be.a('array');
        expect(body).to.have.length.above(0);
        done();
      });
    });

    it('Get a user and his courses, assignments and submissions', function(done) {
      var reqUrl = baseUrl + '/' + fakeUser._id + '?courses=true&assignments=true&submissions=true';

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.have.property('courses');
        expect(body.courses).to.be.a('array');
        expect(body).to.have.property('assignments');
        expect(body.assignments).to.be.a('array');
        expect(body).to.have.property('submissions');
        expect(body.submissions).to.be.a('array');
        done();
      });
    });

    it('Delete created user', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeUser._id,
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

    it('Fail deleting already deleted user', function(done) {
      var reqParams = {
        'url': baseUrl + '/' + fakeUser._id,
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

    it('Fail getting deleted user', function(done) {
      var reqUrl = baseUrl + '/' + fakeUser._id;

      request.get(reqUrl, {'json':true, 'jar': true}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

  });
};

test();