const crypto = require('crypto');
const config = require('./config');
const util = require('./util');
const log = require('./lib/log')(__filename);

class Scheduler {
  constructor(attrs) {
    const {
      alarms,
      fs,
    } = attrs;

    this._fs = fs;

    this.update(attrs);
  }

  update(attrs) {
    const {
      alarms,
    } = attrs;
    this._current_state = {
      alarms,
    };
    this._days = Array.apply(null, { length: 7 }).map(() => {
      return [];
    });

    alarms.forEach((alarm) => {
      alarm.days.forEach((active,i) => {
        if (!active) {
          return;
        }

        this._days[i].push({
          time_ms: alarm.time,
          start_ms: alarm.time-alarm.warmup*util.MINUTE_IN_MS,
          stop_ms: alarm.time+alarm.cooldown*util.MINUTE_IN_MS,
          animation: alarm.animation,
        });
      });
    });

    this._days.forEach((day) => {
      day.sort((a,b) => {
        return a.time - b.time;
      });
    });
  }

  currentState() {
    return JSON.parse(JSON.stringify(this._current_state));
  }

  async saveToDisk() {
    const path = config.scheduler_state_path;
    const data = {
      something: 'whatever',
    };
    const tmp_path = path + '-' + crypto.randomBytes(20).toString('hex');
    // UNTESTED: avoid corrupting the file if we die halfway through or multiple process save at the same time
    await this._fs.writeFile(tmp_path, JSON.stringify(this.currentState())); // first write to a temp file
    await this._fs.rename(tmp_path, path); // then atomically rename
  }

  async loadFromDisk() {
    const path = config.scheduler_state_path;
    try {
      const contents = await this._fs.readFile(path);
      const {alarms} = JSON.parse(contents);
      this.update({alarms});
    } catch(err) {
      // swallow errors so that we can start
      log.error({ err: err, stack: err.stack }, `Could not load state from disk: ${err}`);
    }
  }

  getForDate(date) {
    const day = date.getDay();
    const rounded_ms = 1000*Math.round(date.valueOf()/1000);
    const ms_into_day = util.msIntoDay(date);

    const alarms = this._days[day];
    for (let i = 0; i < alarms.length; ++i) {
      const alarm = alarms[i];

      if (ms_into_day >= alarm.start_ms) {
        return {
          time_ms: alarm.time_ms,
          start_ms: alarm.start_ms,
          stop_ms: alarm.stop_ms,
          animation: alarm.animation,
        };
      }
    }

    return null;
  }
}

module.exports = Scheduler;
