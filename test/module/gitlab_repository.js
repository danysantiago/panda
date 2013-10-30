var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab(console.log);


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

      it('Get Project Archive', function(done) {
      gitlab.repository.archive(params, out, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      
      done();
    });
    });

       it('Get Project Branches', function(done) {
      gitlab.repository.getBranches(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

       it('Get Project Branch', function(done) {
      gitlab.repository.getBranch(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

       it('Get Project Commits', function(done) {
      gitlab.repository.getCommits(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

       it('Get Project Commit', function(done) {
      gitlab.repository.getCommit(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

       it('Get Diff', function(done) {
      gitlab.repository.getDiff(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

    it('List Project Tree', function(done) {
      gitlab.repository.listTree(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

    it('Get Blob', function(done) {
      params.filepath='src';
      gitlab.repository.getBlob(params, function (err, res, body){
      expect(res).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
    });

  });
};

test();