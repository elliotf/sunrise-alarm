const { DateTime } = require('luxon');

const config = require('./config');
const util = require('./util');

const Animation = require('./animation');

class Alarm {
  constructor(attrs) {
    const {
      hour,
      minute=0,
      warmup=20,
      cooldown=30,
      days=[],
      animation="sunrise",
      height,
      start_date,
      begin_ms=0,
      peak_ms=0,
      end_ms=0,
    } = attrs;

    const AnimationKlass = Animation[animation];

    this.hour = hour;
    this.minute = minute;
    this.warmup = warmup;
    this.cooldown = cooldown;
    this.days = days;
    this.animation = animation;
    if (!height) {
      throw new Error('need a height');
    }
    this._animator = new AnimationKlass({
      height,
    });
    this.height = height;

    this.warmup_ms = this.warmup*util.MINUTE_IN_MS;
    this.cooldown_ms = this.cooldown*util.MINUTE_IN_MS;
    this.begin_ms = begin_ms;
    this.peak_ms = peak_ms;
    this.end_ms = end_ms;
  }

  determineOffset(d) {
    const ms = d.valueOf();
    const delta = ms - this.peak_ms;
    if (delta === 0) {
      return 0;
    }
    // FIXME: avoid divide by 0 due to no warmup/cooldown
    const offset = (delta < 0)
                 ? delta / (this.warmup_ms)
                 : delta / (this.cooldown_ms);
    return util.round(offset, 5);
  }

  async updateNow(d, led_string) {
    const offset = this.determineOffset(d);

    // pass offset and date to animator
    const colors = this._animator.at(offset, d);

    await led_string.fill(colors);
  }

  startingOn(start_date) {
    const ldate = DateTime.fromJSDate(start_date);

    const peak = ldate.set({
      hour: this.hour,
      minute: this.minute,
    });

    const begin = peak.minus({ minute: this.warmup });
    const end = peak.plus({ minute: this.cooldown });

    const begin_ms = begin.toMillis();
    const peak_ms = peak.toMillis();
    const end_ms = end.toMillis();

    const attrs = {
      ...this,
      begin_ms,
      peak_ms,
      end_ms,
    };

    return new Alarm(attrs);
  }
}

module.exports = Alarm;
