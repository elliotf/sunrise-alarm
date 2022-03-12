const { expect, sinon } = require('./helper');
const Alarm = require('../alarm');
const LedString = require('../led_string');
const Runner = require('../runner');
const memfs = require('memfs');

describe('Runner', function() {
  let vol;
  let instance;
  let opts;
  let attrs;
  let fake_now;
  let fake_display;
  let alarm_data;

  beforeEach(async function() {
    vol = memfs.Volume.fromJSON({});

    attrs = {
      alarms: [
        {
          hour: 6,
          minute: 0,
          days: [ false,true,true,true,true,true,false ],
        },
        {
          hour: 8,
          minute: 0,
          days: [ false,true,true,true,true,true,false ],
        },
        {
          hour: 8,
          minute: 0,
          days: [ true,false,false,false,false,false,true ],
        },
      ],
      fs: vol.promisesApi,
      height: 6,
    };

    alarm_data = {
      alarms: attrs.alarms,
    };

    fake_now = new Date('2021-01-01T08:00:00.000-06:00');

    fake_display = new LedString({
      width: 1,
      height: 1,
    });

    fake_display._fake = 'display';

    instance = new Runner(attrs);
  });

  describe('constructor', function() {
    context('when alarms are not provided', function() {
      beforeEach(async function() {
        delete attrs.alarms;
      });

      it('should default to no alarms with no error', async function() {
        instance = new Runner(attrs);
      });
    });
  });

  describe('#updateNow', function() {
    context('when there is a current alarm', function() {
      beforeEach(async function() {
        await instance.updateNow(fake_now, fake_display);
      });

      it('should delegate to #updateNow on the current alarm', async function() {
        sinon.spy(instance.current_alarm, 'updateNow');

        await instance.updateNow(fake_now, fake_display);

        expect(instance.current_alarm.updateNow.args).to.deep.equal([
          [fake_now, fake_display],
        ]);
      });

      context('when the time is past the lifetime of the current alarm (Alarm#updateNow returns false)', function() {
        beforeEach(async function() {
          fake_now = new Date('2021-01-02T10:00:00.000-06:00');
        });

        it('should replace the alarm with the noop alarm', async function() {
          await instance.updateNow(fake_now, fake_display);

          expect(instance.current_alarm.animation).to.equal('off');
        });
      });
    });

    context('when there is no current alarm', function() {
      it('should delegate to #getForDate', async function() {
        sinon.spy(instance, 'getForDate');

        await instance.updateNow(fake_now, fake_display);

        expect(instance.getForDate.args).to.deep.equal([
          [fake_now],
        ]);

        expect(instance.current_alarm).to.be.an.instanceof(Alarm);
        expect(instance.current_alarm.animation).to.equal('sunrise');
      });

      context('and there should be no alarm', function() {
        beforeEach(async function() {
          fake_now = new Date('2021-01-02T00:00:00.000-06:00');
        });

        it('should return without error', async function() {
          await instance.updateNow(fake_now, fake_display);
        });
      });
    });
  });

  describe('#getCurrentAnimation', function() {
    it('should return the animation of the `current_alarm`', async function() {
      expect(instance.getCurrentAnimation()).to.equal('off');
    });
  });

  describe('#getAnimations', function() {
    it('should return a list of valid idle animations', async function() {
      expect(instance.getAnimations()).to.deep.equal([
        'off',
        'on',
        'rainbow',
      ]);
    });
  });

  describe('#setAnimation', function() {
    it('should set the `current_alarm` to the new mode', async function() {
      const starting = instance.current_alarm;

      expect(starting.animation).to.equal('off');
      expect(instance.idle_alarm).to.equal(starting);

      instance.setAnimation('on');

      const set_on = instance.current_alarm;
      expect(instance.idle_alarm).to.equal(set_on);
      expect(set_on.animation).to.equal('on');

      instance.setAnimation('rainbow');

      const set_rainbow = instance.current_alarm;
      expect(instance.idle_alarm).to.equal(set_rainbow);
      expect(set_rainbow.animation).to.equal('rainbow');
    });

    context('when an invalid mode is specified', function() {
      it('should throw an error', async function() {
        expect(function() {
          instance.setAnimation('invalid');
        }).to.throw(Error, /invalid.*animation/i);
      });
    });
  });

  describe('#toggleIdleAnimation', function() {
    it('should cycle through idle animations', async function() {
      expect(instance.current_alarm.animation).to.equal('off');

      instance.toggleIdleAnimation();
      expect(instance.current_alarm.animation).to.equal('on');

      instance.toggleIdleAnimation();
      expect(instance.current_alarm.animation).to.equal('rainbow');

      instance.toggleIdleAnimation();
      expect(instance.current_alarm.animation).to.equal('off');

      instance.toggleIdleAnimation();
      expect(instance.current_alarm.animation).to.equal('on');
    });

    context('when an alarm is active', function() {
      beforeEach(async function() {
        await instance.updateNow(fake_now, fake_display);
      });

      it('should replace it with an idle animation', async function() {
        expect(instance.current_alarm.animation).to.equal('sunrise');

        instance.toggleIdleAnimation();
        expect(instance.current_alarm.animation).to.equal('off');

        instance.toggleIdleAnimation();
        expect(instance.current_alarm.animation).to.equal('on');

        instance.toggleIdleAnimation();
        expect(instance.current_alarm.animation).to.equal('rainbow');

        instance.toggleIdleAnimation();
        expect(instance.current_alarm.animation).to.equal('off');
      });
    });
  });


  describe('#update', function() {
    beforeEach(async function() {
      const without_alarms = {
        ...attrs,
        alarms: [],
      };
      instance = new Runner(without_alarms);
    });

    it('should populate alarms', async function() {
      instance.update(attrs);

      expect(instance.currentState()).to.deep.equal({
        alarms: attrs.alarms,
      });
    });

    it('should update available alarms', async function() {
      instance.update(attrs);

      const new_alarm = instance.getForDate(new Date('2021-10-01T06:00:00.000-05:00'));
      expect(new_alarm).to.be.an.instanceOf(Alarm);
      expect(new_alarm.begin).to.deep.equal(new Date("2021-10-01T06:00:00.000-05:00"));
      expect(new_alarm.end).to.deep.equal(new Date("2021-10-01T07:59:59.999-05:00"));
    });
  });

  describe('#loadFromDisk', function() {
    beforeEach(async function() {
      vol.fromJSON({
        '/var/run/alarm/state.json': JSON.stringify(alarm_data),
      });
      attrs.alarms = [];
      instance = new Runner(attrs);
    });

    it('should load state from disk', async function() {
      sinon.spy(instance, 'update');

      await instance.loadFromDisk();

      expect(instance.update.args).to.deep.equal([
        [alarm_data],
      ]);
    });

    context('when the file does not exist', function() {
      beforeEach(async function() {
        await vol.promisesApi.unlink('/var/run/alarm/state.json');
      });

      it('should return without error', async function() {
        await instance.loadFromDisk();
      });
    });

    context('when the directory does not exist', function() {
      beforeEach(async function() {
        await vol.promisesApi.unlink('/var/run/alarm/state.json');
        await vol.promisesApi.rmdir('/var/run/alarm');
      });

      it('should return without error', async function() {
        await instance.loadFromDisk();
      });
    });

    context('when there is a permissions problem', function() {
      beforeEach(async function() {
        await vol.promisesApi.chmod('/var/run/alarm/state.json', 000);
      });

      it('should return without error', async function() {
        await instance.loadFromDisk();
      });
    });
  });

  describe('#saveToDisk', function() {
    context('when the folder exists', function() {
      beforeEach(async function() {
        vol.mkdirSync('/var/run/alarm', { recursive: true });
      });

      context('and the file exists', function() {
        beforeEach(async function() {
          await vol.promisesApi.writeFile('/var/run/alarm/state.json', '{}');
        });

        it('should save state to disk', async function() {
          await instance.saveToDisk();

          expect(vol.toJSON()).to.deep.equal({
            '/var/run/alarm/state.json': JSON.stringify({ ...attrs, fs: undefined, height: undefined }),
          });
        });

        context('when there is a permissions problem', function() {
          beforeEach(async function() {
            await vol.promisesApi.chmod('/var/run/alarm/state.json', 000);
          });

          /* // This test does not fail, probably because memfs does not implement permissions
          it('should reject with an error', async function() {
            let err;
            try {
              await instance.saveToDisk();
            } catch(e) {
              err = e;
            }

            expect(err).to.be.an.instanceof(Error);
          });
          */
        });
      });

      context('and the file does not exist', function() {
        it('should create the file and save state to disk', async function() {
          await instance.saveToDisk();

          expect(vol.toJSON()).to.deep.equal({
            '/var/run/alarm/state.json': JSON.stringify({ ...attrs, fs: undefined, height: undefined }),
          });
        });
      });
    });

    context('when the directory does not exist', function() {
      it('should reject with an error', async function() {
        let err;
        try {
          await instance.saveToDisk();
        } catch(e) {
          err = e;
        }

        expect(err).to.be.an.instanceof(Error);
        expect(err.code).to.equal('ENOENT');
        expect(err.message).to.match(/no such file or directory/);
      });
    });
  });

  describe('#_getNextAlarm', function() {
    let day;
    let alarm_i;

    beforeEach(async function() {
      day = 5;
      alarm_i = 0;
    });

    it('should return the next alarm', async function() {
      expect(instance._getNextAlarm(day, alarm_i)).to.deep.equal({
        added_days: 0,
        next_alarm: {
          hour: 8,
          minute: 0,
          days: [ false,true,true,true,true,true,false ],
        },
      });
    });

    context('when provided the last alarm of the day', function() {
      beforeEach(async function() {
        alarm_i = 1;
      });

      it('should return the first alarm of the next day', async function() {
        expect(instance._getNextAlarm(day, alarm_i)).to.deep.equal({
          added_days: 1,
          next_alarm: {
            hour: 8,
            minute: 0,
            days: [ true,false,false,false,false,false,true ],
          },
        });
      });

      context('of the last day of the week (Saturday)', function() {
        beforeEach(async function() {
          day = 6;
        });

        it('should return the first alarm of the next day', async function() {
          expect(instance._getNextAlarm(day, alarm_i)).to.deep.equal({
            added_days: 1,
            next_alarm: {
              hour: 8,
              minute: 0,
              days: [ true,false,false,false,false,false,true ],
            },
          });
        });
      });

      context('when there are no alarms for some days', function() {
        beforeEach(async function() {
          attrs.alarms.pop();
          instance = new Runner(attrs);
        });

        it('should look for the next day that has alarms', async function() {
          expect(instance._getNextAlarm(day, alarm_i)).to.deep.equal({
            added_days: 3,
            next_alarm: {
              hour: 6,
              minute: 0,
              days: [ false,true,true,true,true,true,false ],
            },
          });
        });
      });
    });
  });

  describe('#getForDate', function() {
    let fake_now;

    beforeEach(async function() {
      fake_now = new Date('2021-10-01T06:00:00.729-05:00');
    });

    it('should return an event for that date', async function() {
      const result = instance.getForDate(fake_now);
      expect(result).to.be.an.instanceOf(Alarm);
      expect(result.begin).to.deep.equal(new Date("2021-10-01T06:00:00.000-05:00"));
      expect(result.end).to.deep.equal(new Date("2021-10-01T07:59:59.999-05:00"));
    });

    context('when there are multiple events for that day of the week', function() {
      it('should return the event that overlaps with the specified time', async function() {
        const expected = [
          {
            // first alarm starts, runs until second alarm
            input: new Date('2021-10-01T06:00:00.000-05:00'),
            output: {
              begin: new Date('2021-10-01T06:00:00.000-05:00'),
              end: new Date('2021-10-01T07:59:59.999-05:00'),
            },
          },
          {
            // just before second alarm is still first alarm
            input: new Date('2021-10-01T07:59:59.999-05:00'),
            output: {
              begin: new Date('2021-10-01T06:00:00.000-05:00'),
              end: new Date('2021-10-01T07:59:59.999-05:00'),
            },
          },
          {
            // second alarm runs Friday until Sunday morning
            input: new Date('2021-10-01T08:00:00.000-05:00'),
            output: {
              begin: new Date('2021-10-01T08:00:00.000-05:00'),
              end: new Date('2021-10-02T07:59:59.999-05:00'),
            },
          },
          {
            // Saturday alarm runs until Sunday morning
            input: new Date('2021-10-02T08:00:00.000-05:00'),
            output: {
              begin: new Date('2021-10-02T08:00:00.000-05:00'),
              end: new Date('2021-10-03T07:59:59.999-05:00'),
            },
          },
        ];

        const actual = [];

        expected.forEach(({input}) => {
          const alarm = instance.getForDate(input) || { begin: null, end: null };
          actual.push({
            input,
            output: {
              begin: alarm.begin,
              end: alarm.end,
            },
          });
        });

        expect(actual).to.deep.equal(expected);
      });
    });

    context('when no alarm matches', function() {
      beforeEach(async function() {
        attrs.alarms = [];

        instance = new Runner(attrs);
      });

      // FIXME: return a known "no alarm" value or an "off" alarm instead of null
      it('should return null', async function() {
        expect(instance.getForDate(new Date('2021-10-01T07:00:00.729-05:00'))).to.equal(null);
      });
    });
  });

  describe('#getAlarms', function() {
    it('should return current alarms', async function() {
      expect(instance.getAlarms()).to.deep.equal([
        {
          hour: 6,
          minute: 0,
          days: [ false,true,true,true,true,true,false ],
        },
        {
          hour: 8,
          minute: 0,
          days: [ false,true,true,true,true,true,false ],
        },
        {
          hour: 8,
          minute: 0,
          days: [ true,false,false,false,false,false,true ],
        },
      ]);
    });

    it('should return copies of state, in case caller modifies something', async function() {
      const first = instance.getAlarms();
      const second = instance.getAlarms();
      expect(first).to.deep.equal(second);
      expect(first).to.not.equal(second);
    });

    context('when there are no alarms', function() {
      beforeEach(async function() {
        instance.update({
          alarms: [],
        });
      });

      it('should return an empty array', async function() {
        expect(instance.getAlarms()).to.deep.equal([]);
      });
    });
  });
});
