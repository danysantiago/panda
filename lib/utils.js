var path = require('path'),
    os = require('os');

module.exports.generateTmpPath = function(rootPath) {
  var now = new Date();
  var name = [
    now.getYear(), now.getMonth(), now.getDate(), '-',
    process.pid, '-',
    (Math.random() * 0x100000000 + 1).toString(36),
  ].join('');

  return path.join(rootPath || os.tmpdir(), name);
};

var mongoObjectIdRegEx = new RegExp("^[0-9a-fA-F]{24}$");

module.exports.checkObjectId = function(objectId) {
  return mongoObjectIdRegEx.test(objectId);
}