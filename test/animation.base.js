const { expect } = require('./helper');

const AnimationBase = require('../animation/base');

describe('Animation/Base', function() {
  let inst;
  let opts;

  beforeEach(async function() {
    opts = {
      height: 3,
    };

    inst = new AnimationBase(opts);
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
        const inst = new AnimationBase(opts);
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
        inst = new AnimationBase(opts);
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
        inst = new AnimationBase(opts);
        expect(function() {
          inst.gradientFrom([[0,255,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
        }).to.throw('Cannot fit 4 deltas into 3 pixels');
      });
    });
  });
});
