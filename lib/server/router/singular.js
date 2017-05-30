'use strict';

var express = require('express');
var write = require('./write');
var getFullURL = require('./get-full-url');
var jsonpatch = require('jsonpatch');

module.exports = function (db, name) {
  var router = express.Router();

  function show(req, res, next) {
    res.locals.data = db.get(name).value();
    next();
  }

  function create(req, res, next) {
    db.set(name, req.body).value();
    res.locals.data = db.get(name).value();

    res.setHeader('Access-Control-Expose-Headers', 'Location');
    res.location(`${getFullURL(req)}`);

    res.status(201);
    next();
  }

  function updateFull(req, res, next) {
    db.set(name, req.body).value();

    res.locals.data = db.get(name).value();
    next();
  }

  function updatePartial(req, res, next) {
    db.set(name, jsonpatch.apply_patch(db.get(name).value(), req.body)).value();

    res.locals.data = db.get(name).value();
    next();
  }

  var w = write(db);

  router.route('/').get(show).post(create, w).put(updateFull, w).patch(updatePartial, w);

  return router;
};