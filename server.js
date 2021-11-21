#!/usr/bin/env node

const fs = require('fs').promises;
const { DateTime } = require('luxon');

const app = require('./app');
const Runner = require('./runner');
const Store = require('./store');
const util = require('./util');
const LedString = require('./led_string');
const log = require('./lib/log')(__filename);

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

const listen_port = 3000;
app.listen(listen_port, function(err) {
  if (err) {
    throw err;
  }

  log.info(`Listening on port ${listen_port}`);
});

function start() {
  // this should probably be done more intelligent to avoid a race between LED updates and the interval
  // it's not a problem so far, though

  if (false) {
    // normal operation
    const fps = 60;
    const update_interval_ms = util.SECOND_IN_MS/fps;
    setInterval(() => {
      const now = new Date();
      runner.updateNow(now, display);
    }, update_interval_ms);
  } else {
    // debug
    const update_interval_ms = 5;
    const increment_by_ms = 50;
    const rate = increment_by_ms / update_interval_ms;
    const start = new Date('2021-01-01T05:40:00.000-06:00');
    log.info(`Running in debug at ${rate}x speed, starting fake lock at ${start.getHours()}:${start.getMinutes()}`);

    const start_ms = start.valueOf();
    let i = 0;
    setInterval(() => {
      const now = new Date(start_ms+i);
      runner.updateNow(now, display);
      i += increment_by_ms;
    }, update_interval_ms);
  }
}

start();
