exports.gradient_schedule = [
  // start black
  {
    index: -1,
    formula: [
      [0,0,0,0],
      [1,0,0,0],
    ],
  },
  // red slowly fading up from bottom
  {
    index: -0.5,
    formula: [
      [0,255,0,0],
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
  // full white
  {
    index: 0,
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
