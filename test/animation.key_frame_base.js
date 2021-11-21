const { expect } = require('./helper');

const KeyFrameBase = require('../animation/key_frame_base');

describe('Animation/KeyFrameBase', function() {
  let inst;
  let opts;
  let key_frames;

  beforeEach(async function() {
    key_frames = [
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

    opts = {
      key_frames,
      height: 3,
    };

    inst = new KeyFrameBase(opts);
  });

  describe('#at', function() {
    it('should return a list of colors to fill, from bottom to top', async function() {
      expect(inst.at(-1)).to.deep.equal([
        [0,0,0],
        [0,0,0],
        [0,0,0],
      ]);

      expect(inst.at(-0.25)).to.deep.equal([
        [255,128,0],
        [255,64,0],
        [255,0,0],
      ]);

      expect(inst.at(0)).to.deep.equal([
        [255,255,255],
        [255,255,255],
        [255,255,255],
      ]);
    });
  });

  describe('#keyFramesAt', function() {
    context('when provided the first index', function() {
      it('should return the first phase', async function() {
        expect(inst.keyFramesAt(-1)).to.deep.equal({
          from: [[0,0,0],[0,0,0],[0,0,0]],
          to: [[255,0,0],[127,0,0],[0,0,0]],
          pct: 0,
        });
      });
    });

    context('when provided the central index', function() {
      it('should err towards the earlier phase', async function() {
        expect(inst.keyFramesAt(0)).to.deep.equal({
          from: [[255,128,0],[255,64,0],[255,0,0]],
          to: [[255,255,255],[255,255,255],[255,255,255]],
          pct: 1,
        });
      });
    });

    context('when provided the last index', function() {
      it('should return the last phase', async function() {
        expect(inst.keyFramesAt(1)).to.deep.equal({
          from: [[255,255,255],[255,255,255],[255,255,255]],
          to: [[0,0,0],[0,0,0],[0,0,0]],
          pct: 1,
        });
      });
    });

    it('should return two gradients that surround that time (inclusive)', async function() {
      const expected = [
        {
          input: -1,
          output: {
            pct: 0,
            from: [[0,0,0],[0,0,0],[0,0,0]],
            to: [[255,0,0],[127,0,0],[0,0,0]],
          },
        },
        {
          input: -0.99,
          output: {
            pct: 0.02,
            from: [[0,0,0],[0,0,0],[0,0,0]],
            to: [[255,0,0],[127,0,0],[0,0,0]],
          },
        },
        {
          input: -0.9111111111,
          output: {
            pct: 0.17777778,
            from: [[0,0,0],[0,0,0],[0,0,0]],
            to: [[255,0,0],[127,0,0],[0,0,0]],
          },
        },
        {
          input: 0.01,
          output: {
            pct: 0.01,
            from: [[255,255,255],[255,255,255],[255,255,255]],
            to: [[0,0,0],[0,0,0],[0,0,0]],
          },
        },
        {
          input: 1,
          output: {
            pct: 1,
            from: [[255,255,255],[255,255,255],[255,255,255]],
            to: [[0,0,0],[0,0,0],[0,0,0]],
          },
        },
      ];

      const actual = [];

      expected.forEach(function({ input }) {
        actual.push({
          input,
          output: inst.keyFramesAt(input),
        });
      });

      expect(actual).to.deep.equal(expected);
    });

    context('when the time index that is provided is outside -1 and 1', function() {
      it('should entirely off gradients', async function() {
        const expected = [
          {
            input: -100,
            output: {
              from: [[0,0,0],[0,0,0],[0,0,0]],
              to: [[0,0,0],[0,0,0],[0,0,0]],
              pct: 0,
            },
          },
          {
            input: -1.01,
            output: {
              from: [[0,0,0],[0,0,0],[0,0,0]],
              to: [[0,0,0],[0,0,0],[0,0,0]],
              pct: 0,
            },
          },
          {
            input: 1.01,
            output: {
              from: [[0,0,0],[0,0,0],[0,0,0]],
              to: [[0,0,0],[0,0,0],[0,0,0]],
              pct: 0,
            },
          },
          {
            input: 100,
            output: {
              from: [[0,0,0],[0,0,0],[0,0,0]],
              to: [[0,0,0],[0,0,0],[0,0,0]],
              pct: 0,
            },
          },
        ];

        const actual = [];

        expected.forEach(function({ input }) {
          actual.push({
            input,
            output: inst.keyFramesAt(input),
          });
        });

        expect(actual).to.deep.equal(expected);
      });
    });
  });
});
