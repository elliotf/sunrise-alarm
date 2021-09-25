const util = require('./util');

const gradient_schedule = [
  // start black
  {
    index: -1,
    formula: [
      [0,0,0,0],
      [1,0,0,0],
    ],
  },
  /*
  // purple/blue?
  {
    index: -0.9,
    formula: [
      [0,64,0,0],
      [1,0,0,64],
    ],
  },
  */
  // red slowly fading up from bottom
  {
    index: -0.5,
    formula: [
      [0,255,0,0],
      //[1,0,0,64],
      [1,0,0,0],
    ],
  },
  // orange -> yellow
  {
    index: -0.25,
    formula: [
      [0,255,255,0],
      [0.25,255,128,0],
      [1,255,0,0],
    ],
  },
  /*
  // full-ish yellow
  {
    index: -0.125,
    formula: [
      [0,255,255,0],
      [1,255,128,0],
    ],
  },
  */
  // full white
  {
    index: 0,
    formula: [
      [0,255,255,255],
      [1,255,255,255],
    ],
  },
  // for a while
  {
    index: 0.8,
    formula: [
      [0,255,255,255],
      [1,255,255,255],
    ],
  },
  // fade to black
  {
    index: 1,
    formula: [
      [0,0,0,0],
      [1,0,0,0],
    ],
  },
]

class KeyFrames {
  constructor(opts) {
    const {
      height,
    } = opts;

    this.height = height;

    this.gradient_schedule = gradient_schedule.map(({ index, formula }) => {
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
      const pct = util.round(gone / dist, 3);

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

  gradientFrom(stops) {
    if ((stops.length-1) > this.height) {
      throw new Error(`Cannot fit ${stops.length-1} deltas into ${this.height} pixels`);
    }

    const gradient = new Array(this.height);

    const channels = [0,1,2]; // R G B indexes into color array

    for (let i = 0; i < stops.length - 1; ++i) {
      const [from_pct, ...from] = stops[i];
      const [to_pct, ...to] = stops[i+1];
      const delta = channels.map((ch) => {
        return to[ch] - from[ch];
      });

      const start = Math.floor(from_pct*this.height);
      const stop = Math.ceil(to_pct*this.height);

      for (let y = start; y < stop && y < this.height; ++y) {
        const pct_up = (y-start) / Math.max(stop-start-1,1);

        const color = [];
        channels.forEach((ch) => {
          color[ch] = Math.floor(from[ch] + delta[ch]*pct_up);
        });

        gradient[y] = color;
      }
    }

    return gradient;
  }
}

module.exports = KeyFrames;
