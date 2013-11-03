var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var params = {
    user_id: 2,
    name: 'happyhour',
  }

  var archive = __dirname + '/../res/'+params.name+'.tar.gz';

  describe('Gitlab Projects', function() {
  	//Create Project happyhour
    it('Create a Project', function(done) {
      gitlab.project.create(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        expect(body.owner.id).to.equal(params.user_id);
        expect(body.name).to.equal(params.name);
        params.id = body.id; //Get id of created project
        params.username = body.owner.username;
        done();
      });
    });

    //Create a project with the same name - error
    it('Fail creating a Project', function(done) {
      gitlab.project.create(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        expect(body.message).to.equal('404 Not Found');
        done();
      });
    });

    //Get all projects
    it('Get Projects', function(done) {
      gitlab.project.getAll(function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get the project we just created
    it('Get Project', function(done) {
      gitlab.project.get(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.id).to.equal(params.id);
        expect(body.name).to.equal(params.name);
        expect(body.owner.id).to.equal(params.user_id);
        done();
      });
    });

    //Get a project that does not exist
    it('Get Unexistent Project', function(done) {
      gitlab.project.get({ id: 0 }, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        expect(body.message).to.equal('404 Not Found');
        done();
      });
    });

    //Populate project with archive file given
    it('Populate Project', function(done) {
      this.timeout(5000);
      gitlab.project.populate({ username: 'danysantiago', name: params.name, archive: __dirname + '/../res/'+params.name+'.tar.gz' }, 
      	function (error, stdout, stderr) {
        expect(error).to.not.exist;
        done();
      });
    });

    //Add member to project
    it('Add Member', function(done) {
      gitlab.project.addMember({ id: params.id, user_id: 3 }, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        expect(body.name).to.equal('Panda');
        done();
      });
    });

    //Delete the project we just created
    it('Delete Project', function(done) {
      gitlab.project.delete(params, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.not.equal(404);
        done();
      });
    });

    //Delete a project that does not exist
    it('Delete Unexistent Project', function(done) {
      gitlab.project.delete({name: 'xyz'}, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });
};

test();