const KeyFrameBase = require('./key_frame_base');

const key_frames = [
  // start black
  {
    index: 0,
    formula: [
      [0,0,0,0],
      [1,0,0,0],
    ],
  },
  // red at the bottom
  {
    index: 0.1,
    formula: [
      [0,32,0,0],
      [1,0,0,0],
    ],
  },
  // red fading up from bottom
  {
    index: 0.4,
    formula: [
      [0,64,0,0],
      [1,16,0,32],
    ],
  },
  // orange -> yellow
  {
    index: 0.7,
    formula: [
      [0,64,64,0],
      [0.25,96,64,0],
      [1,96,0,0],
    ],
  },
  // full-ish yellow
  {
    index: 0.8,
    formula: [
      [0,255,128,0],
      [1,255,32,0],
    ],
  },
  // full white
  {
    index: 0.9,
    formula: [
      [0,255,225,225],
      [1,255,225,225],
    ],
  },
  // for a while
  {
    index: 1,
    formula: [
      [0,255,225,225],
      [1,255,225,225],
    ],
  },
];

class Sunrise extends KeyFrameBase{
  constructor(opts_input) {
    const opts = {
      ...opts_input,
      key_frames,
    }

    super(opts);
  }
}

module.exports = Sunrise;
