const config = require('./config');
const LedString = require('./led_string');
const util = require('./util');

const noop_alarm = {
  updateNow: function() {
    // noop, or turn LEDs off?
  },
};

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

    const result = await this.current_alarm.updateNow(d, display); // take in LED string?
    // if <some sort of result>, replace current alarm with noop
  }
}

module.exports = Runner;
