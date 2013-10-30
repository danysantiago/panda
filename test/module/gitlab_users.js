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

  describe('Users', function() {
    it('Create User', function(done) {
    gitlab.user.create(fakeUser, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        fakeUser.id = body.id; //Get id of created user
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
      expect(body.id).to.equal(fakeUser.id);
      done();
    });
  });

    it('Modify User', function(done) {
    gitlab.user.modify({id: fakeUser.id, email: 'other@email.com'},function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      expect(body.email).to.not.equal(fakeUser.email);
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

  });
};

test();