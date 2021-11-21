const { expect, sinon } = require('./helper');

const Store = require('../store');
const Alarm = require('../alarm');
const util = require('../util');
const memfs = require('memfs');

describe('Store', function() {
  let vol;
  let instance;
  let attrs;
  let alarm_data;

  beforeEach(async function() {
    vol = memfs.Volume.fromJSON({});

    attrs = {
      alarms: [
        {
          hour: 8,
          days: [ true,false,false,false,false,false,true ],
        },
        {
          hour: 6,
          days: [ false,true,true,true,true,true,false ],
        },
        {
          hour: 8,
          days: [ false,true,true,true,true,true,false ],
        },
      ],
      fs: vol.promisesApi,
      height: 6,
    };

    alarm_data = {
      alarms: attrs.alarms,
    };

    instance = new Store(attrs);
  });

  describe('constructor', function() {
    context('when alarms are not provided', function() {
      beforeEach(async function() {
        delete attrs.alarms;
      });

      it('should default to no alarms with no error', async function() {
        instance = new Store(attrs);
      });
    });
  });

  describe('#update', function() {
    beforeEach(async function() {
      const without_alarms = {
        ...attrs,
        alarms: [],
      };
      instance = new Store(without_alarms);
    });

    it('should populate alarms', async function() {
      instance.update(attrs);

      expect(instance.currentState()).to.deep.equal({
        alarms: attrs.alarms,
      });
    });

    it('should update available alarms', async function() {
      instance.update(attrs);

      const new_alarm = instance.getForDate(new Date('2021-10-01T05:40:00.000-05:00'));
      expect(new_alarm).to.be.an.instanceOf(Alarm);
      expect(new_alarm.hour).to.equal(6);
      expect(new_alarm.height).to.equal(6);
    });
  });

  describe('#loadFromDisk', function() {
    beforeEach(async function() {
      vol.fromJSON({
        '/var/run/alarm/state.json': JSON.stringify(alarm_data),
      });
      attrs.alarms = [];
      instance = new Store(attrs);
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

  describe('#getForDate', function() {
    let fake_now;

    beforeEach(async function() {
      fake_now = new Date('2021-10-01T05:40:00.729-05:00');
    });

    it('should return an event for that date', async function() {
      const result = instance.getForDate(fake_now);
      expect(result).to.be.an.instanceOf(Alarm);
      expect(result.hour).to.equal(6);
      expect(result.minute).to.equal(0);
    });

    context('when there are multiple events for that day of the week', function() {
      it('should return the matching event', async function() {

        const six_am_starting_on = sinon.spy(instance._days[util.FRIDAY_INDEX][0], 'startingOn');
        const six_am = new Date('2021-10-01T05:40:00.729-05:00');
        const six_am_alarm = instance.getForDate(six_am);
        expect(six_am_alarm).to.be.an.instanceOf(Alarm);
        expect(six_am_alarm.hour).to.equal(6);
        expect(six_am_alarm.minute).to.equal(0);
        expect(six_am_starting_on.args).to.deep.equal([
          [six_am],
        ]);

        const eight_am_starting_on = sinon.spy(instance._days[util.FRIDAY_INDEX][1], 'startingOn');
        const eight_am = new Date('2021-10-01T07:40:00.729-05:00')
        const eight_am_alarm = instance.getForDate(eight_am);
        expect(eight_am_alarm).to.be.an.instanceOf(Alarm);
        expect(eight_am_alarm.hour).to.equal(8);
        expect(eight_am_alarm.minute).to.equal(0);
        expect(eight_am_starting_on.args).to.deep.equal([
          [eight_am],
        ]);
      });
    });

    context('when no alarm matches', function() {
      beforeEach(async function() {
        fake_now = new Date('2021-10-01T01:30:00.000-05:00');
      });

      // FIXME: return a known "no alarm" value instead of null
      it('should return null', async function() {
        const seven_am = instance.getForDate(new Date('2021-10-01T07:00:00.729-05:00'));
        expect(seven_am).to.be.equal(null);
      });
    });
  });
});
