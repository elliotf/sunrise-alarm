require('./helper');

const expect = require('chai').expect;
const Sunrise = require('../animation/sunrise');

describe('Animation/Sunrise', function() {
  let inst;
  let opts;

  beforeEach(async function() {
    opts = {
      height: 3,
    };

    inst = new Sunrise(opts);
  });

  describe('#at', function() {
    context('when provided the central index', function() {
      it('should return the peak phase', async function() {
        expect(inst.at(0)).to.deep.equal([
          [0,0,0],[0,0,0],[0,0,0],
        ]);
      });
    });

    context('when provided the last index', function() {
      it('should return the last phase', async function() {
        expect(inst.at(1)).to.deep.equal([
          [255,225,225],[255,225,225],[255,225,225],
        ]);
      });
    });
  });
});
