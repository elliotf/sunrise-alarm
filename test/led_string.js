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

  describe('#fill', function() {
    let from;
    let to;

    beforeEach(async function() {
      options.width = 1;

      inst = new LedString(options);
      from = [[0,0,255],[0,0,128],[0,0,64]];
      to = [[255,255,0],[128,128,0],[64,64,0]];
    });

    it('should fill the LEDs with an interpolation of two gradients', async function() {
      inst.fill(from,to,0.5);

      expect(inst.displayForTest()).to.deep.equal([
        "128 128 128",
        "64  64  64 ",
        "33  33  33 ",
      ]);

      inst.fill(from,to,0.1);

      expect(inst.displayForTest()).to.deep.equal([
        "26  26  230",
        "13  13  115",
        "8   8   59 ",
      ]);
    });

    context('when there are multiple columns of LEDs', function() {
      beforeEach(async function() {
        from = [[0,0,0]];
        to = undefined;
        options.width = 4;
        options.height = 1;
        inst = new LedString(options);
      });

      it('should fill one column at a time with brightness', async function() {
        const expected = [
          {
            input: [from, [[64,64,64]],1],
            result: [
              "255 255 255",
              "0   0   0  ",
              "0   0   0  ",
              "0   0   0  ",
            ],
          },
          {
            input: [from, [[127.5,127.5,127.5]],1],
            result: [
              "255 255 255",
              "255 255 255",
              "0   0   0  ",
              "0   0   0  ",
            ],
          },
          {
            input: [from, [[191,191,191]],1],
            result: [
              "255 255 255",
              "255 255 255",
              "255 255 255",
              "0   0   0  ",
            ],
          },
          {
            input: [from, [[255,255,255]],1],
            result: [
              "255 255 255",
              "255 255 255",
              "255 255 255",
              "255 255 255",
            ],
          },
        ];

        const actual = expected.map(({input}) => {
          return {
            input,
            result: function() {
              inst.fill(...input);
              return inst.displayForTest();
            }(),
          };
        });

        expect(actual).to.deep.equal(expected);

        /*

        expect(inst.displayForTest()).to.deep.equal([
        ]);

        inst.fill(from,[[128,0,0]],1);

        expect(inst.displayForTest()).to.deep.equal([
        ]);

        inst.fill(from,[[192,0,0]],1);

        expect(inst.displayForTest()).to.deep.equal([
          "255 255 255",
          "255 255 255",
          "255 255 255",
          "0   0   0  ",
        ]);

        inst.fill(from,[[255,0,0]],1);

        expect(inst.displayForTest()).to.deep.equal([
          "255 255 255",
          "255 255 255",
          "255 255 255",
          "255 255 255",
        ]);
        */
      });
    });
  });

  describe('.valueForColumn', function() {
    it('should return a proportional value of the column in the width', async function() {
      const expected = [
        { width: 1, col: 0, raw_val: 128, result: 128 },
        { width: 2, col: 0, raw_val: 128, result: 255 },
        { width: 3, col: 0, raw_val: 32, result: 97 },
        { width: 4, col: 0, raw_val: 64, result: 255 },
        { width: 4, col: 1, raw_val: 95.5, result: 128 },
        { width: 4, col: 2, raw_val: 127, result: 0 },
        { width: 4, col: 3, raw_val: 191, result: 0 },
        { width: 4, col: 3, raw_val: 255, result: 255 },
      ];

      const actual = expected.map(({ width, col, raw_val }) => {
        return {
          width,
          col,
          raw_val,
          result: LedString.valueForColumn(width, col, raw_val),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });
});
