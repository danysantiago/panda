var config = require('../config/config.js');

module.exports = {
  'url': config.gitlab.url,
  'token': config.gitlab.adminToken
};
