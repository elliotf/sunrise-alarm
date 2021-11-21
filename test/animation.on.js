const { expect, sinon } = require('./helper');
const On = require('../animation/on');

describe('Animation/On', function() {
  let inst;
  let opts;
  let unused;

  beforeEach(async function() {
    opts = {
      height: 5,
    };
    unused = null;

    inst = new On(opts);
  });

  describe('#at', function() {
    it('should return a list of colors to fill, from bottom to top', async function() {
      expect(inst.at(unused, unused)).to.deep.equal([
        [192,192,192],
        [192,192,192],
        [192,192,192],
        [192,192,192],
        [192,192,192],
      ]);
    });
  });
});
