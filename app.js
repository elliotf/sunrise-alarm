const BodyParser = require('body-parser');
const express = require('express');
const fs = require('fs').promises;

const LedString = require('./led_string');
const Runner = require('./runner');
const Store = require('./store');
const log = require('./lib/log')(__filename);
const Animations = require('./animation');

const num_pixels = 32*4; // 32pixels/M, 4M
const width = 4;
const height = Math.floor(num_pixels/width);

const store = new Store({
  fs,
  height,
  alarms: [
    {
      hour: 7,
      minute: 30,
      days: [ true,false,false,false,false,false,true ],
    },
    {
      hour: 6,
      days: [ false,true,true,true,true,true,false ],
    },
  ],
});

const display = new LedString({
  width,
  height,
  bottom_start: false,
});

const runner = new Runner({
  width,
  height,
  store,
});

const app = express();

app.use(BodyParser.json())

app.get('/', function(req, res, next) {
  res.send('ok');
});

app.post('/api/animation/toggle', function(req, res, next) {
  runner.toggleIdleAnimation();

  res.send({});
});

app.put('/api/animation/current', function(req, res, next) {
  const animation = req.body.animation;

  if (!Animations[animation]) {
    return res.status(400).send({
      error: 'Invalid animation specified',
      field: 'animation',
      value: animation,
    });
  }

  runner.setIdleAnimation(animation);

  res.send({});
});

exports.app = app;
exports.runner = runner;
exports.display = display;
