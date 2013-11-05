var sendgrid  = require('sendgrid')('elbuo', '050505');

/**
* @constructor
*/
function SendGrid(){
}

SendGrid.prototype = {
	/**
	* Send Email.
	* Send email to person.
	*
	* @param params
	* @param params.to []
	* @param params.toname []
	* @param params.from
	* @param params.fromname
	* @param params.subject
	* @param params.text
	* @param params.html
	* @param params.bcc []
	* @param params.replyto
	* @param params.date
	* @param params.files: [
	{
	filename: required only if file.content is used.
	contentType: optional
	cid: optional, used to specify cid for inline content
	path:
	url: One of these three options is required
	content: 
	}
	]
	* @param params.file_data
	* @param params.headers
	*/
	'sendEmail': function(params, callback) {
		sendgrid.send(params, function(err, json) {
			if(typeof callback === 'function') {
				callback(err, json);
			}
		});
	}
};

module.exports = SendGrid;