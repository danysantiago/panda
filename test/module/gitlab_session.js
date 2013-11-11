var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Gitlab = require('../../lib/gitlab/Gitlab');

    var gitlab = new Gitlab();


var test = function() {

  var params = {
    login: 'danysantiago',
    password: 'mofongo',
  }

  describe('Gitlab Session', function() {
    this.slow(800);
    //login with user credentials
    it('Login', function(done) {
      gitlab.session.login(params, function (err, res, body){
        expect(res).to.exist;
        expect(res.statusCode).to.equal(201);
        expect(body.private_token).to.equal("CpmobLhkVjMn4AsrUVsU");
        done();
      });
    });
  });
};

test();