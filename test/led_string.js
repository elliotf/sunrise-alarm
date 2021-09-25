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

  describe('constructor', function() {
    context('when provided no options', function() {
      it('should return a string with defaults', async function() {
        const inst = new LedString();

        expect(inst.width).to.equal(5);
        expect(inst.height).to.equal(8);
      });
    });

    context('when provided empty options', function() {
      it('should return a string with defaults', async function() {
        const inst = new LedString({});

        expect(inst.width).to.equal(5);
        expect(inst.height).to.equal(8);
      });
    });
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

    it('should apply a gradient to the pixels', async function() {
      inst.setGradient([0,255,0,0],[1,0,0,0]);

      expect(inst.displayForTest()).to.deep.equal([
        '255 0   0  ',
        '128 0   0  ',
        '0   0   0  ',
        '0   0   0  ',
        '128 0   0  ',
        '255 0   0  ',
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

        expect(inst.displayForTest()).to.deep.equal([
          '255 0   0  ',
          '128 0   0  ',
          '1   0   0  ',
          '2   0   0  ',
          '3   0   0  ',
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

  describe('.interpolate', function() {
    it('should return a number some proportion between two numbers', async function() {
      const expected = [
        {
          input: [0,255,0.5],
          output: 128,
        },
        {
          input: [0,255,0.1],
          output: 26,
        },
        {
          input: [0,12,0.1],
          output: 1,
        },
        {
          input: [0,15,0.1],
          output: 2,
        },
      ];

      const actual = expected.map(({ input }) => {
        return {
          input,
          output: LedString.interpolate.apply(null, input),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#fill', function() {
    let from;
    let to;

    beforeEach(async function() {
      from = [[0,0,255],[0,0,128],[0,0,64]];
      to = [[255,255,0],[128,128,0],[64,64,0]];
    });

    it('should fill the LEDs with an interpolation of two gradients', async function() {
      inst.fill(from,to,0.5);

      expect(inst.displayForTest()).to.deep.equal([
        "128 128 128",
        "64  64  64 ",
        "32  32  32 ",
        "32  32  32 ",
        "64  64  64 ",
        "128 128 128",
      ]);

      inst.fill(from,to,0.1);

      expect(inst.displayForTest()).to.deep.equal([
        "26  26  230",
        "13  13  115",
        "6   6   58 ",
        "6   6   58 ",
        "13  13  115",
        "26  26  230",
      ]);
    });
  });
});
