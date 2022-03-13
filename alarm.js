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

    return (d >= this.begin && d <= this.end);
  }
}

module.exports = Alarm;
