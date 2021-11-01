require('./helper');

const expect = require('chai').expect;
const KeyFrames = require('../key_frames');
const config = require('../config');

describe('KeyFrames', function() {
  let inst;
  let opts;

  beforeEach(async function() {
    opts = {
      height: 3,
      animation: config.animations.sunrise,
    };

    inst = new KeyFrames(opts);
  });

  describe('#at', function() {
    context('when provided the first index', function() {
      it('should return the first phase', async function() {
        expect(inst.at(-1)).to.deep.equal({
          from: [[0,0,0],[0,0,0],[0,0,0]],
          to: [[255,0,0],[127,0,0],[0,0,0]],
          pct: 0,
        });
      });
    });

    context('when provided the central index', function() {
      it('should err towards the earlier phase', async function() {
        expect(inst.at(0)).to.deep.equal({
          from: [[255,128,0],[255,64,0],[255,0,0]],
          to: [[255,255,255],[255,255,255],[255,255,255]],
          pct: 1,
        });
      });
    });

    context('when provided the last index', function() {
      it('should return the last phase', async function() {
        expect(inst.at(1)).to.deep.equal({
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
          output: inst.at(input),
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
            output: inst.at(input),
          });
        });

        expect(actual).to.deep.equal(expected);
      });
    });
  });

  describe('#gradientFrom', function() {
    it('should return a gradient from the description', async function() {
      expect(inst.gradientFrom([[0,0,0,0],[1,255,0,0]])).to.deep.equal([
        [0,0,0],
        [127,0,0],
        [255,0,0],
      ]);
    });

    context('when more than one stop is provided', function() {
      it('should interpolate correctly', async function() {
        opts.height = 5;
        const inst = new KeyFrames(opts);
        expect(inst.gradientFrom([[0,255,0,0],[0.5,1,0,0],[1,3,0,0]])).to.deep.equal([
          [255,0,0],
          [128,0,0],
          [1,0,0],
          [2,0,0],
          [3,0,0],
        ]);
      });
    });

    context('when a stop is provided for each pixel in the Y', function() {
      beforeEach(async function() {
        opts.height = 2;
        inst = new KeyFrames(opts);
      });

      it('should use those stops as the pixel values', async function() {
        expect(inst.gradientFrom([[0,255,0,0],[0.5,0,0,0],[1,0,0,0]])).to.deep.equal([
          [255,0,0],
          [0,0,0],
        ]);
      });
    });

    context('when more stops are provided than there are pixels', function() {
      it('should throw', async function() {
        inst = new KeyFrames(opts);
        expect(function() {
          inst.gradientFrom([[0,255,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
        }).to.throw('Cannot fit 4 deltas into 3 pixels');
      });
    });
  });
});
