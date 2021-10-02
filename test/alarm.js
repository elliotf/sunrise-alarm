require('./helper');

const expect = require('chai').expect;
const Alarm = require('../alarm');
const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;

describe('Alarm', function() {
  let inst;
  let opts;

  beforeEach(async function() {
    opts = {
      width: 2,
      height: 3,
      warm_up_time_ms: 20*minute_in_ms,
      cool_down_time_ms: 10*minute_in_ms,
      alarm_schedule: [
        null, // Sunday
        6*hour_in_ms, // Monday
        6*hour_in_ms, // Tuesday
        6*hour_in_ms, // Wednesday
        6*hour_in_ms, // Thursday
        6*hour_in_ms, // Friday
        null, // Saturday
      ],
    };
    inst = new Alarm(opts);
  });

  describe('constructor', function() {
    context('when there are too many days in the alarm schedule', function() {
      it('should throw an error', async function() {
        opts.alarm_schedule = [
          100,

          100,
          100,
          100,
          100,
          100,

          100,
          100, // extra day
        ];

        expect(function() {
          new Alarm(opts);
        }).to.throw('Alarm schedule does not match the number of days in the week');
      });
    });
  });

  describe('#determineOffset', function() {
    it('should generate an offset based on alarm, warmup, and cool down', async function() {
      const expected = [
        {
          input: '2021-01-01T00:00:00',
          output: -18,
        },
        {
          input: '2021-01-01T05:40:00',
          output: -1,
        },
        {
          input: '2021-01-01T05:50:00',
          output: -0.5,
        },
        {
          input: '2021-09-24T05:59:50',
          output: -0.01,
        },
        {
          input: '2021-09-24T06:00:00',
          output: 0,
        },
        {
          input: '2021-09-24T06:09:50',
          output: 0.98,
        },
        {
          input: '2021-09-24T06:10:00',
          output: 1,
        },
        {
          input: '2021-09-24T18:00:00',
          output: 72,
        },
      ];

      const actual = expected.map(({ input }) => {
        return {
          input,
          output: inst.determineOffset(new Date(input)),
        };
      });

      expect(actual).to.deep.equal(expected);
    });

    context('when the date passed in is a day of the week that has no alarm set', function() {
      it('should return an offset that will result in a disabled alarm', async function() {
        const expected = [
          {
            input: '2006-01-01T06:00:00',
            output: -Infinity,
          },
          {
            input: '2006-01-02T06:00:00',
            output: 0,
          },
          {
            input: '2006-01-03T06:00:00',
            output: 0,
          },
          {
            input: '2006-01-04T06:00:00',
            output: 0,
          },
          {
            input: '2006-01-05T06:00:00',
            output: 0,
          },
          {
            input: '2006-01-06T06:00:00',
            output: 0,
          },
          {
            input: '2006-01-07T06:00:00',
            output: -Infinity,
          },
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
  });

  describe('#updateOffset', function() {
    it('should fill the alarms LEDs with a gradient', async function() {
      this.sinon.spy(inst.leds, 'fill');

      inst.updateOffset(-1);
      inst.updateOffset(-0.99);
      inst.updateOffset(0);
      inst.updateOffset(1);

      expect(inst.leds.fill.args).to.deep.equal([
        [[[0,0,0],[0,0,0],[0,0,0]],[[255,0,0],[127,0,0],[0,0,0]],0],
        [[[0,0,0],[0,0,0],[0,0,0]],[[255,0,0],[127,0,0],[0,0,0]],0.02],
        [[[255,128,0],[255,64,0],[255,0,0]],[[255,255,255],[255,255,255],[255,255,255]],1],
        [[[255,255,255],[255,255,255],[255,255,255]],[[0,0,0],[0,0,0],[0,0,0]],1],
      ]);
    });
  });

  describe('#updateNow', function() {
    let now;

    beforeEach(async function() {
      now = new Date('2006-01-02T00:00:00');
    });

    it('should delegate to #determineOffset and #updateOffset', async function() {
      this.sinon.spy(inst, 'updateOffset');

      inst.updateNow(new Date('2006-01-02T00:00:00'));
      inst.updateNow(new Date('2006-01-02T06:00:00'));

      expect(inst.updateOffset.args).to.deep.equal([
        [-18],
        [0],
      ]);
    });

    context('when the alarm is disabled until a time', function() {
      let now;
      let resume_at;

      beforeEach(async function() {
        now = new Date('2000-01-01T00:00:00.000Z');
        resume_at = null;
      });

      context('that is after now', function() {
        beforeEach(async function() {
          resume_at = new Date(now.valueOf() + 1000);
          inst.resumeAt(resume_at);
        });

        it('should use the reactivate time to determine the offset', async function() {
          this.sinon.spy(inst, 'determineOffset');

          inst.updateNow(now);

          expect(inst.determineOffset.args).to.deep.equal([
            [resume_at],
          ]);

          expect(inst._resume_at).to.deep.equal(resume_at);
        });
      });

      context('that is before now', function() {
        beforeEach(async function() {
          resume_at = new Date(now.valueOf() - 1000);
          inst.resumeAt(resume_at);
        });

        it('should use now to determine the offset', async function() {
          this.sinon.spy(inst, 'determineOffset');

          inst.updateNow(now);

          expect(inst.determineOffset.args).to.deep.equal([
            [now],
          ]);
        });

        it('should clear the reactivation time', async function() {
          inst.updateNow(now);

          expect(inst._resume_at).to.deep.equal(null);
        });
      });
    });
  });

  describe('#resumeAt', function() {
    it('record the time that it should reactivate', async function() {
      inst.resumeAt(new Date('2010-01-01T00:00:00.000Z'));

      expect(inst._resume_at).to.deep.equal(new Date('2010-01-01T00:00:00.000Z'));
    });

    it('should return whatever the current state is', async function() {
      expect(inst.resumeAt()).to.deep.equal(null);
      expect(inst.resumeAt(undefined)).to.deep.equal(null);
      expect(inst.resumeAt(0)).to.deep.equal(0);
      expect(inst.resumeAt()).to.deep.equal(0);
      expect(inst.resumeAt(undefined)).to.deep.equal(0);
    });
  });

  describe('#dismiss', function() {
    let now;

    beforeEach(async function() {
      now = new Date('2021-01-01T05:50:00');
    });

    it('should freeze the alarm until the end of the current alarm cycle', async function() {
      const clock = this.sinon.useFakeTimers(now);
      inst.dismiss();

      expect(inst._resume_at).to.deep.equal(new Date('2021-01-01T06:10:00'));
    });

    context('when it is before the alarm', function() {
      beforeEach(async function() {
        now = new Date('2021-01-01T03:00:00');
      });

      it('should leave the state alone', async function() {
        const clock = this.sinon.useFakeTimers(now);
        inst.dismiss();

        expect(inst._resume_at).to.deep.equal(null);
      });
    });

    context('on a day that does not have an alarm', function() {
      beforeEach(async function() {
        this.sinon.stub(inst, 'getAlarmTimeForDate').returns(null);
      });

      it('should leave the state alone', async function() {
        const clock = this.sinon.useFakeTimers(now);
        inst.dismiss();

        expect(inst._resume_at).to.deep.equal(null);
      });
    });
  });

  describe('#getAlarmTimeForDate', function() {
    it('should return the alarm time for the provided date', async function() {
      const expected = [
        {
          input: '2006-01-01T06:00:00',
          output: null,
        },
        {
          input: '2006-01-02T06:00:00',
          output: 21600000,
        },
        {
          input: '2006-01-03T06:00:00',
          output: 21600000,
        },
        {
          input: '2006-01-04T06:00:00',
          output: 21600000,
        },
        {
          input: '2006-01-05T06:00:00',
          output: 21600000,
        },
        {
          input: '2006-01-06T06:00:00',
          output: 21600000,
        },
        {
          input: '2006-01-07T06:00:00',
          output: null,
        },
      ];

      const actual = expected.map(({ input }) => {
        return {
          input,
          output: inst.getAlarmTimeForDate(new Date(input)),
        };
      });

      expect(actual).to.deep.equal(expected);
    });
  });
});
