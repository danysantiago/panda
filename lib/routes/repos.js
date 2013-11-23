/**
  repo.js - Contains route logistics for this resource
**/

var config = require('../config/config.js'),
    express = require('express'),
    async = require('async'),
    utils = require('../utils.js'),
    _ = require('underscore');

var Gitlab = require('../gitlab/Gitlab');

function getRepoTree (req, res, next) {

  var params = {
    'id': req.params.repoId,
    'path': req.query.path || ""
  };


  req.gitlab.repository.listTree(params, function (err, gRes, gBody) {
    if (err) {
      return next(err);
    }

    if(gRes.statusCode == 200) {
      res.send(gRes.statusCode, gBody);
    } else {
      res.send(gRes.statusCode);
    }

  });
}

function getBlob (req, res, next) {

  var params = {
    'id': req.params.repoId,
    'sha': 'master',
    'filepath': req.query.path
  };


  req.gitlab.repository.getBlob(params, res, function (err, gRes, gBody) {
    if (err) {
      return next(err);
    }

  });
}

var middleware = express();

middleware.use(function (req, res, next) {
  req.gitlab = new Gitlab(req.log);
  next();
});

middleware.get('/repos/:repoId', getRepoTree);
middleware.get('/repos/:repoId/blob', getBlob);

module.exports = middleware;