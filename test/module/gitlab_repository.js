var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var params = {
     name: 'pandajavasnippets',
     username: 'danysantiago',
     id: 2,
     branch: 'master',
     sha: '1ba94ed11'
  }

  var fs = require('fs');
  var out = fs.createWriteStream(__dirname + '/../res/'+params.name+'.tar.gz');

  describe('Gitlab Repository', function() {

    //Get Project archive and save it using out
    it('Get Project Archive', function(done) {
      gitlab.repository.archive(params, out, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get Project Branches
    it('Get Project Branches', function(done) {
      gitlab.repository.getBranches(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get branch master
    it('Get Project Branch', function(done) {
      gitlab.repository.getBranch(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.name).to.equal(params.branch);
        done();
      });
    });

    //Get a branch that does not exist
    it('Get Unexistent Branch', function(done) {
      gitlab.repository.getBranch({id: params.id, branch: 'bla'}, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    //Get Project Commits
    it('Get Project Commits', function(done) {
      gitlab.repository.getCommits(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get a specific commit
    it('Get Project Commit', function(done) {
      gitlab.repository.getCommit(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body.title).to.equal('Initial commit');
        done();
      });
    });

    //Get diff from last commit to currnt
    it('Get Diff', function(done) {
      gitlab.repository.getDiff(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //List Project Tree
    it('List Project Tree', function(done) {
      gitlab.repository.listTree(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    //Get Raw Blob for BadExampleProgram.java
    it('Get Blob', function(done) {
      params.filepath='src/BadExampleProgram.java';
      gitlab.repository.getBlob(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.contain('Simple Program');
        done();
      });
    });

  });
};

test();