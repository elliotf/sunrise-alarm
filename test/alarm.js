const { expect, sinon } = require('./helper');

const Alarm = require('../alarm');
const Animation = require('../animation');
const LedString = require('../led_string');
const util = require('../util');

describe('Alarm', function() {
  let attrs;
  let instance;
  let fake_display;

  beforeEach(async function() {
    attrs = {
      begin: new Date('2021-01-01T00:00:00-06:00').valueOf(),
      end: new Date('2021-01-01T00:10:00-06:00').valueOf(),
      animation: 'sunrise',
      height: 5,
    };

    fake_display = new LedString({
      width: 1,
      height: 1,
    });

    fake_display._fake = 'display';

    instance = new Alarm(attrs);
  });

  describe('constructor', function() {
    it('should return an instance', async function() {
      instance = new Alarm(attrs);

      expect(instance).excluding(['_animator']).to.deep.equal({
        animation: "sunrise",
        begin: new Date('2021-01-01T00:00:00-06:00').valueOf(),
        end: new Date('2021-01-01T00:10:00-06:00').valueOf(),
        height: 5,
        window_ms: 600000,
      });
    });

    context('when an invalid animation is provided', function() {
      beforeEach(async function() {
        attrs.animation = 'sunnrise';
      });

      it('should throw an error', async function() {
        expect(function() {
          instance = new Alarm(attrs);
        }).to.throw(Error, `"sunnrise" is not a valid animation`);
      });
    });
  });

  describe.skip('#run', function() {
    let from;
    let until;

    beforeEach(async function() {
      from = new Date('1970-01-01T07:00:00.000Z');
      until = new Date('1970-01-01T07:30:00.000Z');
    });

    it('should an instance of an Alarm', async function() {
      const result = instance.run(from, until);

      expect(result).to.be.an.instanceOf(Alarm);
      expect(result._animator).to.be.an.instanceOf(Animation.sunrise);
      expect(result).to.not.equal(instance);

      expect(result).excluding(['_animator']).to.deep.equal({
        animation: 'sunrise',
        height: 5,
        begin: from.valueOf(),
        end: until.valueOf(),
      });
    });
  });

  describe.skip('#startingOn', function() {
    let date;

    beforeEach(async function() {
      date = new Date('1970-01-01T07:00:00.000Z');
    });

    it('should return a cloned object', async function() {
      const result = instance.startingOn(date);

      expect(result).excluding(['begin','peak_ms','end']).to.deep.equal(instance);
      expect(result).to.not.equal(instance);

      expect(result).excluding(['_animator']).to.deep.equal({
        animation: 'sunrise',
        height: 5,
        hour: 0,
        minute: 4,
        warmup: 1,
        cooldown: 20,
        days: [false,true,true,true,true,true,false],
        begin: 21780000,
        peak_ms: 21840000,
        end: 23040000,
        cooldown_ms: 1200000,
        warmup_ms: 60000,
      });
    });
  });

  describe('#determineOffset', function() {
    it('should generate an offset based on alarm, warmup, and cool down', async function() {
      const expected = [
        { input: '2021-01-01T00:00:00.000-06:00', output: 0, },
        { input: '2021-01-01T00:00:00.001-06:00', output: 0.00000167, },
        { input: '2021-01-01T00:05:00.000-06:00', output: 0.5, },
        { input: '2021-01-01T00:10:00.000-06:00', output: 1, },
        { input: '2021-01-01T08:59:00.000-06:00', output: 53.9, },
      ];

      const actual = expected.map(({ input }) => {
        return {
          input,
          output: instance.determineOffset(new Date(input)),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#updateNow', function() {
    let date;

    it('should resolve true', async function() {
      expect(await instance.updateNow(new Date('2021-01-01T00:04:00-06:00'), fake_display)).to.equal(true);
      expect(await instance.updateNow(new Date('2021-01-01T00:09:59.999-06:00'), fake_display)).to.equal(true);
      expect(await instance.updateNow(new Date('2021-01-01T00:10:00-06:00'), fake_display)).to.equal(true);
    });

    context('when the alarm has passed its period', function() {
      it('should resolve false', async function() {
        expect(await instance.updateNow(new Date('2021-01-01T00:10:00.001-06:00'), fake_display)).to.equal(false);
        expect(await instance.updateNow(new Date('2021-01-01T05:00:00-06:00'), fake_display)).to.equal(false);
      });
    });
  });
});
