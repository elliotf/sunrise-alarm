const LedString = require('./led_string');
const KeyFrames = require('./key_frames');
const util = require('./util');

const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;
const day_in_ms = 24*hour_in_ms;

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
    const day_index = d.getDay();
    const alarm_time_ms = this.alarm_schedule[day_index];
    if (null == alarm_time_ms) {
      // no alarm set
      return -Infinity;
    }
    const t = d.valueOf();
    const ms_into_day = t % day_in_ms - offset*minute_in_ms;
    const delta = ms_into_day - alarm_time_ms;
    const comparator = (delta <= 0) ? this.warm_up_time_ms : this.cool_down_time_ms;
    return util.round(delta / comparator,2);
  }

  updateOffset(offset_raw) {
    const offset = util.round(offset_raw,3);
    const {
      from,
      to,
      pct,
    } = this.key_frames.at(offset);

    this.leds.fill(from,to,pct);
  }

  updateNow(d) {
    const offset = this.determineOffset(d);
    this.updateOffset(offset);
  }
}

module.exports = Alarm;
