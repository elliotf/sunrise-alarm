const pino = require('pino');

const log = pino({
  enabled: !process.env.DISABLE_LOGGING,
});

module.exports = function(file_path) {
  if (!file_path) {
    return log;
  }

  return log.child({
    file_name: file_path,
  });
};

// in case libraries log via `console.*`, duck-punch console.* into using our logger
module.exports.duckPunchConsole = function() {
  console.log   = log.info.bind(log,  '');

  console.trace = log.trace.bind(log, '');
  console.debug = log.debug.bind(log, '');
  console.info  = log.info.bind(log,  '');
  console.warn  = log.warn.bind(log,  '');
  console.error = log.error.bind(log, '');
};
