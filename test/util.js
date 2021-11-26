const { expect } = require('./helper');

const util = require('../util');

describe('Util', function() {
  describe('#msIntoDay', function() {
    let fake_now;

    beforeEach(async function() {
      fake_now = new Date('2021-10-01T01:02:03.456-05:00');
    });

    it('should return ms into day, rounded to nearest second', async function() {
      expect(util.msIntoDay(new Date('2021-01-01T06:00:00.456-06:00'))).to.equal(21600000);
      expect(util.msIntoDay(new Date('2021-10-01T06:00:00.456-05:00'))).to.equal(21600000);
      expect(util.msIntoDay(fake_now)).to.equal(3723000);
    });
  });

  /*
  describe('hsl2rgb', function() {
    it('should translate from HSL to RGB', async function() {
      const expected = [
        // white is going to be ~3x brighter than full bright red -- do we care?
        { h: 1, s: 1, l: 1, result: [255,255,255] },
        { h: 1, s: 1, l: 0.5, result: [255,0,0] },
        { h: 1, s: 1, l: 0.25, result: [128,0,0] },
        { h: 0.5, s: 1, l: 0.5, result: [0,255,255] },
        { h: 0.5, s: 1, l: 0.25, result: [0,127,128] },
      ];

      const actual = expected.map(({h,s,l}) => {
        return {
          h,
          s,
          l,
          result: util.hsl2rgb(h,s,l),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('hsv2rgb', function() {
    it('should translate from HSL to RGB', async function() {
      const expected = [
        // white is going to be ~3x brighter than full bright red -- do we care?
        { h: 0, s: 0, l: 1, result: [255,255,255] },
        { h: 0, s: 1, l: 1, result: [255,0,0] },
        { h: 120, s: 1, l: 1, result: [0,255,0] },
        { h: 240, s: 1, l: 1, result: [0,0,255] },
        //{ h: 0.33333, s: 1, l: 1, result: [255,1.4166524,0] },
        //{ h: 0, s: 1, l: 1, result: [255,1.4166524,0] },
        //{ h: 1, s: 1, l: 0.5, result: [255,0,0] },
        //{ h: 1, s: 1, l: 0.25, result: [128,0,0] },
        //{ h: 0.5, s: 1, l: 0.5, result: [0,255,255] },
        //{ h: 0.5, s: 1, l: 0.25, result: [0,127,128] },
      ];

      const actual = expected.map(({h,s,l}) => {
        return {
          h,
          s,
          l,
          result: util.hsv2rgb(h,s,l),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });
  */
});
