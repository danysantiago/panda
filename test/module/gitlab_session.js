var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var params = {
    login: 'nelii28o2',
    password: 'mofongo',
  }

  describe('Gitlab Session', function() {
    it('Login', function(done) {
      gitlab.session.login(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        var credentials = require('../../lib/gitlab/credentials.js')
        expect(body.private_token).to.equal(credentials.token);
        done();
      });
    });
  });
};

test();