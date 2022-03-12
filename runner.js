const config = require('./config');
const Alarm = require('./alarm');
const LedString = require('./led_string');
const util = require('./util');

const idle_animations = [
  'off',
  'on',
  'rainbow',
];

class Runner {
  constructor({ store }) {
    this.store = store;

    this.setAnimation('off');

    this.current_alarm = this.idle_alarm;
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
      height: 100, // because we don't know the height of alarm here, over-generate colors
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
      const new_alarm = this.store.getForDate(d);

      if (new_alarm) {
        this.current_alarm = new_alarm;
      }
    }

    const still_valid = await this.current_alarm.updateNow(d, display); // take in LED string?
    if (!still_valid) {
      this.current_alarm = this.idle_alarm;
    }
  }
}

module.exports = Runner;
