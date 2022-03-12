const { DateTime } = require('luxon');

const config = require('./config');
const util = require('./util');

const Animation = require('./animation');

class Alarm {
  constructor(attrs) {
    const {
      animation="sunrise",
      height,
      begin,
      end,
    } = attrs;

    const AnimationKlass = Animation[animation];

    if (!AnimationKlass) {
      throw new Error(`"${animation}" is not a valid animation`);
    }

    this.animation = animation;
    if (!height) {
      throw new Error('need a height');
    }
    this._animator = new AnimationKlass({
      height,
    });
    this.height = height;

    this.begin = begin;
    this.end = end;
    this.window_ms = end - begin;
  }

  determineOffset(d) {
    const ms = d.valueOf();

    const ms_through = ms - this.begin;
    const pct_through = ms_through / this.window_ms;
    return util.round(pct_through, 8);
  }

  async updateNow(d, led_string) {
    const offset = this.determineOffset(d);

    // pass offset and date to animator
    const colors = this._animator.at(offset, d);

    await led_string.fill(colors);

    if (offset > 1) {
      return false;
    }

    return true;
  }

  /*
  run(from, until) {
    const begin = from.valueOf();
    const end = until.valueOf();

    const attrs = {
      ...this,
      begin,
      end,
    };

    return new Alarm(attrs);
  }

  /*
  startingOn(start_date) {
    const ldate = DateTime.fromJSDate(start_date);

    const peak = ldate.set({
      hour: this.hour,
      minute: this.minute,
    });

    const begin = peak.minus({ minute: this.warmup });
    const end = peak.plus({ minute: this.cooldown });

    const begin = begin.toMillis();
    const peak_ms = peak.toMillis();
    const end = end.toMillis();

    const attrs = {
      ...this,
      begin,
      peak_ms,
      end,
    };

    return new Alarm(attrs);
  }
  */
}

module.exports = Alarm;
