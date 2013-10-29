var config = require('../lib/config/config.js'),
    request = require('request'),
    expect = require('chai').expect;

var test = function() {

  describe('General Server', function() {

    it('Fake Route Request - 404', function(done) {
      var url = config.appProtocol + '://' +
        config.localAddress + ':' +
        config.appPort +
        '/a/fake/route/404';
      request.get(url, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Unauthorized Request - 401', function(done) {
      var url = config.appProtocol + '://' +
        config.localAddress + ':' +
        config.appPort +
        '/api/users';
      request.get(url, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

  });
};

test();