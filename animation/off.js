const util = require('../util');
const AnimationBase = require('./base');

class Off extends AnimationBase {
  constructor(opts) {
    super(opts);

    // pre-generate the array of colors, since it's not going to change
    this.colors = Array.apply(null, { length: this.height }).map(() => {
      return [0,0,0];
    });
  }

  at(offset, date) {
    return this.colors;
  }
}

module.exports = Off;
