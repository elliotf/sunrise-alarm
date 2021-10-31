const LedString = require('./led_string');
const KeyFrames = require('./key_frames');
const util = require('./util');
const { DateTime } = require('luxon');

const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;
const day_in_ms = 24*hour_in_ms;

const ROUND_PLACES = 5;

class Alarm {
  constructor(opts) {
    const attrs = [
      'width',
      'height',
      'alarm_schedule',
      'warm_up_time_ms',
      'cool_down_time_ms',
    ];

    attrs.forEach((attr) => {
      this[attr] = opts[attr];
    });

    if (!this.alarm_schedule || this.alarm_schedule.length !== 7) {
      throw new Error('Alarm schedule does not match the number of days in the week');
    }

    this._resume_at = null;

    this.leds = new LedString({
      width: this.width,
      height: this.height,
    });

    this.key_frames = new KeyFrames({
      height: this.height,
    });
  }

  determineOffset(d) {
    const offset = d.getTimezoneOffset();
    const alarm_time_ms = this.getAlarmTimeForDate(d);
    if (null == alarm_time_ms) {
      return -Infinity;
    }
    const t = d.valueOf();
    const ms_into_day = t % day_in_ms - offset*minute_in_ms;
    const delta = ms_into_day - alarm_time_ms;
    const comparator = (delta <= 0) ? this.warm_up_time_ms : this.cool_down_time_ms;
    return util.round(delta / comparator, ROUND_PLACES);
  }

  async updateOffset(offset_raw) {
    const offset = util.round(offset_raw, ROUND_PLACES);
    const {
      from,
      to,

      pct,
    } = this.key_frames.at(offset);

    await this.leds.fill(from,to,pct);
  }

  async updateNow(d) {
    if (this._resume_at > d) {
      await this.updateOffset(this.determineOffset(this._resume_at));
      return;
    } else {
      this.resumeAt(null);
    }
    const offset = this.determineOffset(d);
    await this.updateOffset(offset);
  }

  // disable the alarm until after a given time, for snooze/dismiss/disable
  resumeAt(d) {
    if (undefined !== d) {
      this._resume_at = d;
    }

    return this._resume_at;
  }

  dismiss() {
    const now = new Date();
    const offset = this.determineOffset(now);
    if (offset < -1) {
      return;
    }

    const day_start = DateTime.fromJSDate(now).startOf('day');

    const alarm_time_ms = this.getAlarmTimeForDate(now);
    const alarm_start = day_start.plus({
      milliseconds: alarm_time_ms,
    });
    const alarm_end = alarm_start.plus({
      milliseconds: this.cool_down_time_ms,
    });

    this.resumeAt(alarm_end.toJSDate());
  }

  getAlarmTimeForDate(d) {
    const day_index = d.getDay();
    return this.alarm_schedule[day_index];
  }
}

module.exports = Alarm;
