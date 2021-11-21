const config = require('./config');
const Alarm = require('./alarm');
const LedString = require('./led_string');
const util = require('./util');

const noop_alarm = new Alarm({
  animation: 'off',
  height: 100, // because we don't know the height of alarm here, over-generate colors
});

class Runner {
  constructor({ store }) {
    this.store = store;

    this.current_alarm = noop_alarm;
  }

  async updateNow(d, display) {
    if (this.current_alarm === noop_alarm) {
      const new_alarm = this.store.getForDate(d);

      if (new_alarm) {
        this.current_alarm = new_alarm;
      } else {
        this.current_alarm = noop_alarm;
      }
    }

    const still_valid = await this.current_alarm.updateNow(d, display); // take in LED string?
    if (!still_valid) {
      this.current_alarm = noop_alarm;
    }
  }
}

module.exports = Runner;
