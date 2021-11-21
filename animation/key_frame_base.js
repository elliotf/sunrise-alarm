const AnimationBase = require('./base');
const util = require('../util');

class KeyFrameBase extends AnimationBase{
  constructor(opts) {
    super(opts);

    const {
      key_frames,
    } = opts;

    this.gradient_schedule = key_frames.map(({ index, formula }) => {
      const gradient = this.gradientFrom(formula);
      return {
        index,
        gradient,
      };
    });

    this.off = {
      from: this.gradientFrom([[0,0,0,0],[1,0,0,0]]),
      to: this.gradientFrom([[0,0,0,0],[1,0,0,0]]),
      pct: 0,
    };
  }

  at(offset) {
    const {
      from,
      to,
      pct,
    } = this.keyFramesAt(offset);

    const channels = [0,1,2]; // R G B indexes into color array

    const result = [];

    for (let y = 0; y < this.height; ++y) {
      const color = new Array(3);

      channels.forEach((ch) => {
        const delta = to[y][ch] - from[y][ch];
        color[ch] = from[y][ch] + delta*pct;
      });

      result.push(color);
    }

    return result;
  }

  keyFramesAt(offset) {
    const last = this.gradient_schedule.length - 1;
    if (offset < this.gradient_schedule[0].index || offset > this.gradient_schedule[last].index) {
      return this.off;
    }

    // find two gradients that offset fits between
    for(let i = 0; i < this.gradient_schedule.length - 1; ++i) {
      const from = this.gradient_schedule[i];
      const to = this.gradient_schedule[i+1];

      // percentage between the two indices
      const dist = (to.index - from.index);
      const gone = (offset - from.index);
      const pct = util.round(gone / dist, 8);

      if (offset >= from.index && offset <= to.index) {
        return {
          pct,
          from: from.gradient,
          to: to.gradient,
        }
      }
    }

    throw new Error('Should not get here');
  }
}

module.exports = KeyFrameBase;
