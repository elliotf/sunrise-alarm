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
});
