const { expect } = require('./helper');

const Rainbow = require('../animation/rainbow');

describe('Animation/Rainbow', function() {
  let inst;
  let opts;
  let unused;

  beforeEach(async function() {
    opts = {
      height: 5,
    };
    unused = null;

    inst = new Rainbow(opts);
  });

  describe('#at', function() {
    it('should return a list of colors to fill, from bottom to top', async function() {
      expect(inst.at(unused, new Date(0))).to.deep.equal([
        [40.8,0,10.2],
        [45.6,5.4,0],
        [30.6,20.4,0],
        [15,36,0],
        [0,51,0],
      ]);

      expect(inst.at(unused, new Date(50))).to.deep.equal([
        [38.4,0,12.6],
        [48,3,0],
        [33,18,0],
        [17.4,33.6,0],
        [2.4,48.6,0],
      ]);
    });
  });
});
