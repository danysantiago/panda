var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var fakeUser = {
    email: 'super@fake.com',
    password: 'superfake',
    username: 'superfake',
    name: 'Fake'
  };

  var params = {
    user_id: 3,
    name: 'happyhour',
  }

  describe('Users', function() {
    it('Create User', function(done) {
    gitlab.user.create(fakeUser, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        fakeUser.user_id = body.id; //Get id of created user
        done();
      });
    });

    it('Fail to create user', function(done) {
    gitlab.user.create(fakeUser, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Get Users', function(done) {
    gitlab.user.getAll(function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

    it('Get User', function(done) {
    gitlab.user.get(fakeUser,function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      expect(body.id).to.equal(fakeUser.user_id);
      done();
    });
  });


    it('Delete User', function(done) {
    gitlab.user.delete(fakeUser,function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

    it('Modify User', function(done) {
    gitlab.user.modify({user_id: fakeUser.id, email: 'other@email.com'},function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      expect(body.email).to.not.equal(fakeUser.email);
      done();
    });
    });

    it('Get Current User', function(done) {
    gitlab.user.getCurrent(function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      var credentials = require('../../lib/gitlab/credentials.js')
      expect(body.private_token).to.equal(credentials.token);
      done();
    });
    });

  });

  describe('Projects', function() {

    it('Create a Project', function(done) {
      

      gitlab.project.create(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        params.id = body.id; //Get id of created project
        params.username = body.owner.username;
        done();
      });
    });

    it('Fail creating a Project', function(done) {
      gitlab.project.create(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Get Projects', function(done) {
      gitlab.project.getAll(function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('Get Project', function(done) {
      gitlab.project.get(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.id).to.equal(params.id);
        expect(body.name).to.equal(params.name);
        done();
      });
    });

    it('Get Unexistent Project', function(done) {
      gitlab.project.get({id: 0}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Delete Project', function(done) {
      gitlab.project.delete(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.not.equal(404);
        console.log(body);
        done();
      });
    });

    it('Delete Unexistent Project', function(done) {
      gitlab.project.delete(params, function (err, res, body) {
        params.name = 'xyz';
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });

  // describe('Repositories', function() {

  //   it('Create a User', function(done) {
  //     var reqParams = {
  //       'url': baseUrl,
  //       'method': 'POST',
  //       'json': true,
  //       'body': fakeUser
  //     };

  //     request(reqParams, function (err, res, body) {
  //       expect(res).to.exist;
  //       expect(res.statusCode).to.equal(201);
  //       fakeUser._id = body._id; //Get id of created user
  //       done();
  //     });
  //   });

  //   it

  // });

  // describe('Session', function() {

  //   it('Create a User', function(done) {
  //     var reqParams = {
  //       'url': baseUrl,
  //       'method': 'POST',
  //       'json': true,
  //       'body': fakeUser
  //     };

  //     request(reqParams, function (err, res, body) {
  //       expect(res).to.exist;
  //       expect(res.statusCode).to.equal(201);
  //       fakeUser._id = body._id; //Get id of created user
  //       done();
  //     });
  //   });

  //   it

  // });
};

test();