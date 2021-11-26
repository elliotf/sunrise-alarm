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

  const alarms = store.getAlarms().map((alarm, index) => {
    const time = `${(alarm.hour || 0).toString().padStart(2, '0')}:${(alarm.minute || 0).toString().padStart(2,'0')}`;

    return {
      days: alarm.days,
      time,
    };
  });

  // dummy blank alarm, to be able to add a new alarm
  alarms.push({
    hour: 9,
    minute: 0,
    days: [false,false,false,false,false,false,false],
  });

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
  const alarm_index = req.body.alarm_index;
  const current_state = store.currentState();
  const match = req.body.alarm_time.match(/^(\d+):(\d+)$/);
  if (!match) {
    // 400 of some sort
  }
  const alarm = current_state.alarms[alarm_index] || {};

  alarm.hour = (match) ? Number(match[1]) : 0;
  alarm.minute = (match) ? Number(match[2]) : 0;

  alarm.days = [];
  for(let i = 0; i < 7; ++i) {
    alarm.days[i] = (req.body[`day_${i}`]) ? true : false;
  }

  current_state.alarms[alarm_index] = alarm;

  store.update(current_state);

  store.saveToDisk()
    .then(function() {
      return res.redirect('/')
    })
    .catch(next);
});

app.post('/forms/delete_alarm', function(req, res, next) {
  // untested
  const alarm_index = req.body.alarm_index;
  const current_state = store.currentState();

  current_state.alarms.splice(alarm_index);

  store.update(current_state);

  store.saveToDisk()
    .then(function() {
      return res.redirect('/')
    })
    .catch(next);
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
