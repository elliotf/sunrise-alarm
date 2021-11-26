const crypto = require('crypto');
const config = require('./config');
const util = require('./util');
const log = require('./lib/log')(__filename);
const Alarm = require('./alarm');

class Store {
  constructor({ alarms=[], height, fs }) {
    this.height = height;
    this._fs = fs;

    this.update({
      alarms,
    });
  }

  update(update_attrs) {
    const {
      alarms,
    } = update_attrs;

    this._current_state = {
      alarms,
    };

    this._days = Array.apply(null, { length: 7 }).map(() => {
      return [];
    });

    alarms.forEach((alarm_input) => {
      const alarm = new Alarm({
        ...alarm_input,
        height: this.height,
      });

      alarm.days.forEach((active,day_i) => {
        if (!active) {
          return;
        }

        this._days[day_i].push(alarm)
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
    const path = config.state_path;
    const tmp_path = path + '-' + crypto.randomBytes(20).toString('hex');
    // UNTESTED: avoid corrupting the file if we die halfway through or multiple process save at the same time
    await this._fs.writeFile(tmp_path, JSON.stringify(this.currentState())); // first write to a temp file
    await this._fs.rename(tmp_path, path); // then atomically rename
  }

  async loadFromDisk() {
    const path = config.state_path;
    try {
      const contents = await this._fs.readFile(path);
      const {alarms} = JSON.parse(contents);
      this.update({alarms});
    } catch(err) {
      // swallow errors so that we can start
      log.error({ err: err, stack: err.stack }, `Could not load state from disk: ${err}`);
    }
  }

  getAlarms() {
    return this.currentState().alarms;
  }

  getForDate(date) {
    const day = date.getDay();

    const alarms = this._days[day];
    for (let i = 0; i < alarms.length; ++i) {
      const alarm = alarms[i];
      const maybe = new Date(date.valueOf() + alarm.warmup_ms);

      if (maybe.getHours() === alarm.hour && maybe.getMinutes() === alarm.minute) {
        return alarm.startingOn(date);
      }
    }

    return null;
  }
}

module.exports = Store;
