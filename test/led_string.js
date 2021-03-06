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

    context('when the first pixel is at max Y instead of min Y', function() {
      beforeEach(async function() {
        options.bottom_start = false;

        inst = new LedString(options);
      });

      it('should adjust the offsets accordingly', async function() {
        const expected = [
          { x: 0, y: 0, offset: 2 },
          { x: 0, y: 1, offset: 1 },
          { x: 0, y: 2, offset: 0 },
          { x: 1, y: 2, offset: 5 },
          { x: 1, y: 1, offset: 4 },
          { x: 1, y: 0, offset: 3 },
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

  describe('#fill', function() {
    let colors;

    beforeEach(async function() {
      options.width = 1;

      inst = new LedString(options);
      colors = [[255,0,0],[0,255,0],[0,0,255]];
    });

    it('should fill the LEDs with the specified colors', async function() {
      inst.fill(colors);

      expect(inst.displayForTest()).to.deep.equal([
        "255 0   0  ",
        "0   255 0  ",
        "0   0   255",
      ]);
    });

    context('when there are multiple columns of LEDs', function() {
      beforeEach(async function() {
        options.width = 2;
        inst = new LedString(options);
      });

      it('should fill all the LEDs with the specified colors', async function() {
        inst.fill(colors);

        expect(inst.displayForTest()).to.deep.equal([
          "255 0   0  ",
          "0   255 0  ",
          "0   0   255",
          "0   0   255",
          "0   255 0  ",
          "255 0   0  ",
        ]);
      });
    });
  });
});
