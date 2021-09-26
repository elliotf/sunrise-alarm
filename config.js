const log = require('./lib/log')(__filename);
const defaults = require('./config/default');
Object.assign(exports, defaults);

const env = process.env.NODE_CONFIG_ENV;

try {
  const env_config = require(`./config/${env}`);
  Object.assign(exports, env_config);
} catch(e) {
  log.info({
    e,
    env,
  }, `Could not load configuration file for env ${env}: ${e}`);
}
