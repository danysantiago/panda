var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var params = {
    user_id: 2,
    name: 'happyhour',
  }

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
      gitlab.project.get({ id: 0 }, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Add Member', function(done) {
      gitlab.project.get({ id: params.id, user_id: 3 }, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.id).to.equal(params.id);
        expect(body.name).to.equal(params.name);
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
};

test();