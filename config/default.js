exports.scheduler_state_path = '/var/run/alarm/state.json';

exports.animations = {};
exports.animations.sunrise = [
  // start black
  {
    index: -1,
    formula: [
      [0,0,0,0],
      [1,0,0,0],
    ],
  },
  // purple/blue?
  {
    index: -0.9,
    formula: [
      [0,64,0,0],
      [1,0,0,64],
    ],
  },
  // red slowly fading up from bottom
  {
    index: -0.5,
    formula: [
      [0,255,0,0],
      [1,0,0,64],
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
  // full-ish yellow
  {
    index: -0.125,
    formula: [
      [0,255,255,0],
      [1,255,128,0],
    ],
  },
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
];
