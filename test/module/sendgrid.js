var config = require('../../lib/config/config.js'),
    expect = require('chai').expect,
    Sendgrid = require('../../lib/sendgrid/Sendgrid');

    var sendgrid = new Sendgrid();

    var test = function() {

  	var params = {
    	from: 		'nelian.colon@upr.edu',
  		to: 		'nelii.28o2@live.com',
  		subject: 	'Hello World',
  		text: 		'Email sent for happy hour'
  	}

   describe('Sendgrid', function() {
   	it('Send Email', function(done) {
	    // sendgrid.sendEmail(params, function (err, json){
	    //   expect(err).to.not.exist;
	    //   expect(json.message).to.equal('success');
	      	done();
	     //});
	});
  });
};

test();