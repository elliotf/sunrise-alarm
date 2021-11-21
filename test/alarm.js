const { expect, sinon } = require('./helper');

const Alarm = require('../alarm');
const LedString = require('../led_string');
const util = require('../util');

describe('Alarm', function() {
  let attrs;
  let instance;
  let fake_display;

  beforeEach(async function() {
    attrs = {
      hour: 0,
      minute: 4,
      warmup: 1,
      cooldown: 20,
      days: [false,true,true,true,true,true,false],
      animation: 'sunrise',
      height: 5,
      begin_ms: 10,
      peak_ms: 150,
      end_ms: 999,
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
        animation: 'sunrise',
        height: 5,
        hour: 0,
        minute: 4,
        warmup: 1,
        cooldown: 20,
        days: [false,true,true,true,true,true,false],
        begin_ms: 10,
        peak_ms: 150,
        end_ms: 999,
        cooldown_ms: 1200000,
        warmup_ms: 60000,
      });
    });

    context('when optional attributes are not provided', function() {
      beforeEach(async function() {
        attrs = {
          hour: 6,
          height: 6,
        };

        instance = new Alarm(attrs);
      });

      it('should populate with defaults', async function() {
        expect(instance.hour).to.equal(6);
        expect(instance.minute).to.equal(0);
        expect(instance.warmup).to.equal(20);
        expect(instance.cooldown).to.equal(30);
        expect(instance.days).to.deep.equal([]);
        expect(instance.animation).to.equal('sunrise');
      });
    });

    context.skip('when an invalid animation is provided', function() {
      beforeEach(async function() {
        attrs.animation = 'sunnrise';
      });

      it('should throw an error', async function() {
        expect(function() {
          instance = new Alarm(attrs);
        }).to.throw(Error, /waffles/);
      });
    });
  });

  describe('#startingOn', function() {
    let date;

    beforeEach(async function() {
      date = new Date('1970-01-01T07:00:00.000Z');
    });

    it('should return a cloned object', async function() {
      const result = instance.startingOn(date);

      expect(result).excluding(['begin_ms','peak_ms','end_ms']).to.deep.equal(instance);
      expect(result).to.not.equal(instance);

      expect(result).excluding(['_animator']).to.deep.equal({
        animation: 'sunrise',
        height: 5,
        hour: 0,
        minute: 4,
        warmup: 1,
        cooldown: 20,
        days: [false,true,true,true,true,true,false],
        begin_ms: 21780000,
        peak_ms: 21840000,
        end_ms: 23040000,
        cooldown_ms: 1200000,
        warmup_ms: 60000,
      });
    });
  });

  describe('#determineOffset', function() {
    let inst;
    let date;

    beforeEach(async function() {
      date = new Date('2021-01-01T00:00:00-06:00');
      inst = instance.startingOn(date);
    });

    it('should generate an offset based on alarm, warmup, and cool down', async function() {
      const expected = [
        { input: '2021-01-01T00:00:00.000-06:00', output: -4, },
        { input: '2021-01-01T00:03:00.000-06:00', output: -1, },
        { input: '2021-01-01T00:03:30.000-06:00', output: -0.5, },
        { input: '2021-01-01T00:03:59.500-06:00', output: -0.00833, },
        { input: '2021-01-01T00:04:00.000-06:00', output: 0, },
        { input: '2021-01-01T00:05:01.000-06:00', output: 0.05083, },
        { input: '2021-01-01T00:22:04.000-06:00', output: 0.90333, },
        { input: '2021-01-01T00:24:00.000-06:00', output: 1, },
        { input: '2021-01-01T08:59:00.000-06:00', output: 26.75, },
      ];

      const actual = expected.map(({ input }) => {
        return {
          input,
          output: inst.determineOffset(new Date(input)),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#updateNow', function() {
  });
});
