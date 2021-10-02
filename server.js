#!/usr/bin/env node

const app = require('./app');
const Alarm = require('./alarm');
const log = require('./lib/log')(__filename);

const num_pixels = 160; // 5M @ 32 pixels/M
const width = 4;
const height = Math.floor(num_pixels/width);

const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;
const alarm = new Alarm({
  width,
  height,
  warm_up_time_ms: 20*minute_in_ms,
  cool_down_time_ms: 10*minute_in_ms,
  alarm_schedule: [
    null, // Sunday
    6*hour_in_ms, // Monday
    6*hour_in_ms, // Tuesday
    6*hour_in_ms, // Wednesday
    6*hour_in_ms, // Thursday
    6*hour_in_ms, // Friday
    null, // Saturday
  ],
});

const listen_port = 3000;
app.listen(listen_port, function(err) {
  if (err) {
    throw err;
  }

  log.info(`Listening on port ${listen_port}`);
});

// this should probably be done more intelligent to avoid a race between LED updates and the interval
const update_interval = 500;
setInterval(() => {
  const now = new Date();
  alarm.updateNow(now);
}, update_interval);
