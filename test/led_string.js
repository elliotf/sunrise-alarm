require('./helper');

const expect = require('chai').expect;
const LedString = require('../led_string');

describe('LedString', function() {
  let inst;
  let options;

  beforeEach(async function() {
    options = {
      width: 2,
      height: 3,
    };

    inst = new LedString(options);
  });

  describe('#getOffsetForCoord', function() {
    let inst;

    beforeEach(async function() {
      inst = new LedString(options);
    });

    it('should return the offset for a given X/Y', async function() {
      const expected = [
        { x: 0, y: 0, offset: 0 },
        { x: 0, y: 1, offset: 1 },
        { x: 0, y: 2, offset: 2 },
        { x: 1, y: 2, offset: 3 },
        { x: 1, y: 1, offset: 4 },
        { x: 1, y: 0, offset: 5 },
      ];

      const actual = expected.map(function({x,y}) {
        return {
          x,
          y,
          offset: inst.getOffsetForCoord({x,y}),
        }
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#getCoordForOffset', function() {
    let inst;

    beforeEach(async function() {
      inst = new LedString(options);
    });

    it('should return the X/Y coord for a given offset', async function() {
      const expected = [
        { x: 0, y: 0, offset: 0 },
        { x: 0, y: 1, offset: 1 },
        { x: 0, y: 2, offset: 2 },
        { x: 1, y: 2, offset: 3 },
        { x: 1, y: 1, offset: 4 },
        { x: 1, y: 0, offset: 5 },
      ];

      const actual = expected.map(function({offset}) {
        const {x,y} = inst.getCoordForOffset(offset);
        return {
          x,
          y,
          offset,
        }
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#toRowsAndColumns', function() {
    it('should return an array of arrays of pixel data for HTML display', async function() {
      expect(inst.toRowsAndColumns()).to.deep.equal([
        [
          {x: 0, y: 2, offset: 2, color: [0,0,0]},
          {x: 1, y: 2, offset: 3, color: [0,0,0]},
        ],
        [
          {x: 0, y: 1, offset: 1, color: [0,0,0]},
          {x: 1, y: 1, offset: 4, color: [0,0,0]},
        ],
        [
          {x: 0, y: 0, offset: 0, color: [0,0,0]},
          {x: 1, y: 0, offset: 5, color: [0,0,0]},
        ],
      ]);
    });
  });

  describe('#setGradient', function() {
    let getPixelColors;

    beforeEach(async function() {
      getPixelColors = function() {
        return inst.pixels.map((p) => {
          return p.color;
        })
      }
    });

    it('should apply a gradient to the pixels', async function() {
      inst.setGradient([0,255,0,0],[1,0,0,0]);

      expect(getPixelColors()).to.deep.equal([
        [255,0,0],
        [127,0,0],
        [0,0,0],
        [0,0,0],
        [127,0,0],
        [255,0,0],
      ]);
    });

    context('when more than one stop is provided', function() {
      beforeEach(async function() {
        options = {
          width: 1,
          height: 5,
        };

        inst = new LedString(options);
      });

      it('should interpolate correctly', async function() {
        inst.setGradient([0,255,0,0],[0.5,1,0,0],[1,3,0,0]);

        expect(getPixelColors()).to.deep.equal([
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
        options = {
          width: 1,
          height: 2,
        };

        inst = new LedString(options);
      });

      it('should use those stops as the pixel values', async function() {
        inst.setGradient([0,255,0,0],[0.5,0,0,0],[1,0,0,0]);

        const actual = inst.pixels.map((p) => {
          return p.color;
        })

        expect(actual).to.deep.equal([
          [255,0,0],
          [0,0,0],
        ]);
      });
    });

    context('when more stops are provided than there are pixels', function() {
      it('should throw', async function() {
        expect(function() {
          inst.setGradient([0,255,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]);
        }).to.throw('Cannot fit 4 deltas into 3 pixels');
      });
    });
  });
});
