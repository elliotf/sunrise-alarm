const util = require('../util');
const AnimationBase = require('./base');

function colorWheel(pos, max_brightness=0.3) {
  const max_times = max_brightness*3;
  const max_val = 85*max_times;
  if (pos < 85) {
    const red = pos*max_times;
    return [ red, max_val - red, 0 ];
  } else if (pos < 170) {
    pos -= 85
    const blue = pos*max_times;
    return [ max_val - blue, 0, blue ];
  } else {
    pos -= 170
    const green = pos*max_times;
    return [ 0, green, max_val - green ];
  }
}

class Rainbow extends AnimationBase {
  at(offset, date) {
    const brightness = 0.2;
    const colors_at_once=128;
    const speed = 3000;
    const pos = Math.floor((date.valueOf() % speed / speed) * 256);

    const colors = [];
    for (let y = 0; y < this.height; ++y) {
      const t = Math.floor((this.height-1-y)/this.height * colors_at_once) + pos;

      const color = colorWheel(t % 256, brightness).map((val) => {
        return util.round(val, 4);
      });
      colors.push(color);
    }
    return colors;
  }
}

module.exports = Rainbow;
