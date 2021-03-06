const { expect, sinon } = require('./helper');
const Off = require('../animation/off');

describe('Animation/Off', function() {
  let inst;
  let opts;
  let unused;

  beforeEach(async function() {
    opts = {
      height: 5,
    };
    unused = null;

    inst = new Off(opts);
  });

  describe('#at', function() {
    it('should return a list of colors to fill, from bottom to top', async function() {
      expect(inst.at(unused, unused)).to.deep.equal([
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
      ]);
    });
  });
});
