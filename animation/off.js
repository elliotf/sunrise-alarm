const util = require('../util');
const AnimationBase = require('./base');

class Off extends AnimationBase {
  at(offset, date) {
    const colors = Array.apply(null, { length: 100 }).map(() => {
      return [0,0,0];
    });

    return colors;
  }
}

module.exports = Off;
