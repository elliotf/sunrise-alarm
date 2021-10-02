const express = require('express');
const log = require('./lib/log')(__filename);

const app = module.exports = express();

app.get('/', function(req, res, next) {
  res.send('ok');
});
