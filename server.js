#!/usr/bin/env node

const app = require('./app');
const Alarm = require('./alarm');
const log = require('./lib/log')(__filename);

const { DateTime } = require('luxon');
const debug = false;

const num_pixels = 32; // 5M @ 32 pixels/M
const width = 1;
const height = Math.floor(num_pixels/width);

const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;
const alarm = new Alarm({
  width,
  height,
  warm_up_time_ms: 20*minute_in_ms,
  cool_down_time_ms: 30*minute_in_ms,
  alarm_schedule: [
    (debug) ? 6*hour_in_ms : null, // Sunday
    6*hour_in_ms, // Monday
    6*hour_in_ms, // Tuesday
    6*hour_in_ms, // Wednesday
    6*hour_in_ms, // Thursday
    6*hour_in_ms, // Friday
    (debug) ? 6*hour_in_ms : null, // Saturday
  ],
});

const listen_port = 3000;
app.listen(listen_port, function(err) {
  if (err) {
    throw err;
  }

  log.info(`Listening on port ${listen_port}`);
});

if (debug) {
  console.log('debug', debug);
  const update_interval_ms = 5;
  const increment_by_ms = 50;
  const rate = increment_by_ms / update_interval_ms;
  console.log(`updating at ${rate}x speed`);
  let i = 0;
  setInterval(() => {
    const day_start = DateTime.fromJSDate(new Date()).startOf('day');
    i += 100;
    const now = day_start.plus({
      milliseconds: 6*hour_in_ms - 20*minute_in_ms + i,
    });

    alarm.updateNow(now.toJSDate());
  }, update_interval_ms);
} else {
  // this should probably be done more intelligent to avoid a race between LED updates and the interval
  const update_interval = 25;
  setInterval(() => {
    const now = new Date();
    alarm.updateNow(now);
  }, update_interval);
}
