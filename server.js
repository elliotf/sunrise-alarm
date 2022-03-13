#!/usr/bin/env node

const { DateTime } = require('luxon');

const util = require('./util');
const log = require('./lib/log')(__filename);

const {
  app,
  runner,
  display,
} = require('./app');

const listen_port = 3000;
app.listen(listen_port, function(err) {
  if (err) {
    throw err;
  }

  log.info(`Listening on port ${listen_port}`);
});

async function start() {
  // this should probably be done more intelligent to avoid a race between LED updates and the interval
  // it's not a problem so far, though

  await runner.loadFromDisk();

  if (true) {
    // normal operation
    const fps = 120;
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
    log.info(`Running in debug at ${rate}x speed, starting fake lock at ${start.getHours()}:${start.getMinutes()} on a Friday`);

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
