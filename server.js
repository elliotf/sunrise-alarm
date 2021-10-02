#!/usr/bin/env node

const app = require('./app');
const alarm = require('./alarm');

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
