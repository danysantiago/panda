var config = require('../lib/config/config.js'),
    request = require('request'),
    expect = require('chai').expect,
    async = require('async'),
    fs = require('fs');

var test = function() {

  var baseUrl = config.appProtocol + '://' +
        config.localAddress + ':' +
        config.appPort;

  describe('Testing Framework', function() {

    it('Single file \'Correct\' verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Correct');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', 'I\'m a Simple Program');
      form.append('jfile', fs.createReadStream(__dirname + '/res/ExampleProgram.java'));
    });

    it('Compile Error verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Compile Error');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', '');
      form.append('jfile', fs.createReadStream(__dirname + '/res/BadExampleProgram.java'));
    });

    it('I/O piping test', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Correct');
        done();
      });

      var form = r.form();
      form.append('input', 'Hola Mundo');
      form.append('output', 'Hola Mundo');
      form.append('jfile', fs.createReadStream(__dirname + '/res/ReadInput.java'));
    });

    it('Runtime Exception verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Runtime Exception');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', '');
      form.append('jfile', fs.createReadStream(__dirname + '/res/RuntimeEx.java'));
    });


    it('Time Limit Exceeded verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Time Limit Exceeded');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', '');
      form.append('jfile', fs.createReadStream(__dirname + '/res/InfiniteLoop.java'));
    });

    it('Memory Limit Exceeded verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/jsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Memory Limit Exceeded');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', '');
      form.append('jfile', fs.createReadStream(__dirname + '/res/MemO.java'));
    });

    it('Multiple File \'Correct\' verdict', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/zipsubmit',
        'method': 'POST',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        expect(body.status).to.equal('Correct');
        done();
      });

      var form = r.form();
      form.append('input', '');
      form.append('output', fs.readFileSync(__dirname + '/res/llReferenceOutput.txt'));
      form.append('jfile', fs.createReadStream(__dirname + '/res/IndexListTester.java'));
      form.append('zipfile', fs.createReadStream(__dirname + '/res/llzip.zip'));
    });

    it('Queue Test', function(done) {
      this.timeout(10000);
      this.slow(5000);

      var reqParms = {
        'url': baseUrl + '/test/queue',
        'method': 'GET',
        'json': true
      };

      var r = request(reqParms, function (err, res, body) {
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        expect(body).to.exist;
        done();
      });
    });

  });
};

test();