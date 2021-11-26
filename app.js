const BodyParser = require('body-parser');
const express = require('express');
// const { Gpio } = require('onoff');
const fs = require('fs').promises;

const LedString = require('./led_string');
const Runner = require('./runner');
const Store = require('./store');
const util = require('./util');
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

/*
const button = new Gpio(4, 'in', 'rising', { debounceTimeout: 10 });
button.watch(() => {
  if (err) {
    throw err;
  }

  console.log('button pressed!');
});
*/

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res, next) {
  const current_animation = runner.getCurrentAnimation();
  const animations = runner.getIdleAnimations().map((name) => {
    return {
      name,
      disabled: name === current_animation,
      id: `set-animation-${name}`,
    };
  });

  const alarms = store.getAlarms().map((alarm) => {
    const hours = util.range(0,23).map((value) => {
      return {
        value,
        label: value.toString().padStart(2, '0'),
        selected: value === alarm.hour,
      };
    });

    const minutes = util.range(0,59).map((value) => {
      return {
        value,
        label: value.toString().padStart(2, '0'),
        selected: (value === alarm.minute) ? 1 : 0,
      };
    });

    const days = alarm.days.map((day) => {
      return {
        checked: (day) ? true : false,
      };
    });

    return {
      hours,
      minutes,
      days,
    }
  });

  console.log('alarms', alarms);

  const context = {
    alarms,
    animations,
  };

  return res.render('index.pug', context);
});

app.post('/forms/animation', function(req, res, next) {
  // untested
  runner.setIdleAnimation(req.body.animation);

  return res.redirect('/')
});

app.post('/forms/alarm', function(req, res, next) {
  // untested

  return res.redirect('/')
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
