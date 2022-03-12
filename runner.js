const config = require('./config');
const crypto = require('crypto');
const { DateTime } = require('luxon');
const log = require('./lib/log')(__filename);
const Alarm = require('./alarm');
const LedString = require('./led_string');
const util = require('./util');

const idle_animations = [
  'off',
  'on',
  'rainbow',
];

class Runner {
  constructor({ alarms=[], height, fs }) {
    this.height = height;
    this._fs = fs;

    this.setAnimation('off');

    this.current_alarm = this.idle_alarm;

    this.update({
      alarms,
    });
  }

  getCurrentAnimation() {
    return this.current_alarm.animation;
  }

  getAnimations() {
    return [...idle_animations];
  }

  setAnimation(animation) {
    const animation_i = idle_animations.indexOf(animation);
    if (animation_i < 0) {
      throw new Error(`${animation} is an ivalid idle animation`);
    }

    this.current_alarm = this.idle_alarm = new Alarm({
      animation,
      height: this.height,
    });
  }

  toggleIdleAnimation() { // for use by hardware buttons
    const current_index = idle_animations.indexOf(this.current_alarm.animation);
    const next_index = (current_index + 1) % idle_animations.length;
    const next_animation = idle_animations[next_index];

    this.setAnimation(next_animation);
  }

  async updateNow(d, display) {
    if (this.current_alarm === this.idle_alarm) {
      const new_alarm = this.getForDate(d);

      if (new_alarm) {
        this.current_alarm = new_alarm;
      }
    }

    const still_valid = await this.current_alarm.updateNow(d, display); // take in LED string?
    if (!still_valid) {
      this.current_alarm = this.idle_alarm;
    }
  }


  update(input) {
    const {
      alarms,
    } = input;

    this._days = Array.apply(null, { length: 7 }).map(() => {
      return [];
    });

    const with_defaults = alarms.map((alarm_input) => {
      const alarm = {
        ...alarm_input,
      };

      alarm.hour = alarm.hour || 0;
      alarm.minute = alarm.minute || 0;

      alarm.days.forEach((active,day_i) => {
        if (!active) {
          return;
        }

        this._days[day_i].push(alarm)
      });

      return alarm;
    });

    with_defaults.sort((a,b) => {
      const hour_diff = a.hour - b.hour;
      const minute_diff = a.minute - b.minute;
      if (hour_diff) {
        return hour_diff;
      }

      return minute_diff;
    });

    this._current_state = {
      alarms: with_defaults,
    };

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

  _getNextAlarm(day, alarm_i) {
    let alarms = this._days[day];
    let next_i = alarm_i + 1;
    let added_days = 0;
    let next_alarm = alarms[next_i];
    while (!next_alarm && added_days < 7) {
      // alarm_i was the last alarm on that day, so let's go to the next
      ++added_days;
      const next_day = (day+added_days) % 7; // wrap day of week around if necessary
      next_i = 0;
      next_alarm = this._days[next_day][next_i];
    }

    return {
      next_alarm,
      added_days,
    };
  }

  getForDate(date) {
    const day = date.getDay();
    date.setSeconds(0);
    date.setMilliseconds(0);

    let candidate = null;

    const alarms = this._days[day];
    for (let i = 0; i < alarms.length; ++i) {
      const alarm = alarms[i];

      if (date.getHours() >= alarm.hour && date.getMinutes() >= alarm.minute) {
        const begin = DateTime.fromJSDate(date).set({ hour: alarm.hour, minute: alarm.minute }).toJSDate();
        const {next_alarm, added_days} = this._getNextAlarm(day, i);
        const end = DateTime.fromJSDate(date).set({ hour: next_alarm.hour, minute: next_alarm.minute }).plus({ milliseconds: -1, days: added_days }).toJSDate()
        candidate = {
          ...alarm,
          begin,
          end,
        };
      }
    }

    if (candidate) {
      return new Alarm({
        ...candidate,
        height: this.height,
      });
    }

    return null;
  }
}

module.exports = Runner;
