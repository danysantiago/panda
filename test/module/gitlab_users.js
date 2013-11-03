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

  describe('Gitlab Users', function() {
    //Create a Fake User
    it('Create User', function(done) {
      gitlab.user.create(fakeUser, function (err, res, body) {
          expect(res).to.exist;
          expect(res.statusCode).to.equal(201);
          expect(body.name).to.equal(fakeUser.name);
          fakeUser.id = body.id; //Get id of created user
          done();
      });
    });

    //Try to create same user again - 404
    it('Fail to create user', function(done) {
      gitlab.user.create(fakeUser, function (err, res, body) {
          expect(res).to.exist;
          expect(res.statusCode).to.equal(404);
          expect(body.message).to.equal('404 Not Found');
          done();
      });
    });

    //Get all users
    it('Get Users', function(done) {
      gitlab.user.getAll(function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get the user we created before
    it('Get User', function(done) {
      gitlab.user.get(fakeUser,function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.id).to.equal(fakeUser.id);
        expect(body.name).to.equal(fakeUser.name);
        done();
      });
    });

    //Modify user - Change user email
    it('Modify User', function(done) {
      gitlab.user.modify({id: fakeUser.id, email: 'other@email.com'},function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.email).to.not.equal(fakeUser.email);
        expect(body.name).to.equal(fakeUser.name);
        done();
      });
    });

    //Delete the user we created before
    it('Delete User', function(done) {
      gitlab.user.delete(fakeUser,function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.id).to.equal(fakeUser.id);
        done();
      });
    });

    //Try to get the user we deleted
    it('Fail getting deleted user', function(done) {
      gitlab.user.get(fakeUser,function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

  });
};

test();