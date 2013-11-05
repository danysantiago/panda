var config = require('../../lib/config/config.js'),
expect = require('chai').expect,
Sendgrid = require('../../lib/sendgrid/Sendgrid');

var sendgrid = new Sendgrid();

var test = function() {
  var params = {
    from: 		'no-reply@pandacode.sytes.net',
    to:       'nelian.colon@upr.edu',
    subject: 	'Hello World',
    text: 		'Email sent for happy hour'
  }

  describe('Sendgrid', function() {
    //send an email from no-reply@pandacode.sytes.net
    it('Send Email', function(done) {
      sendgrid.sendEmail(params, function (err, json){
        expect(err).to.not.exist;
        expect(json.message).to.equal('success');
        done();
      });
    });
  });
};

test();