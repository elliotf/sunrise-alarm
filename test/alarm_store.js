const { expect, sinon } = require('./helper');

const AlarmStore = require('../alarm_store');
const util = require('../util');
const memfs = require('memfs');

describe('AlarmStore', function() {
  let vol;
  let instance;
  let schedule_data;
  let alarm_data;

  beforeEach(async function() {
    vol = memfs.Volume.fromJSON({});

    schedule_data = {
      alarms: [
        {
          time: 8*util.HOUR_IN_MS,
          days: [ true,false,false,false,false,false,true ],
          animation: 'sunrise',
          warmup: 20,
          cooldown: 30,
        },
        {
          time: 6*util.HOUR_IN_MS,
          days: [ false,true,true,true,true,true,false ],
          animation: 'sunrise',
          warmup: 20,
          cooldown: 30,
        },
        {
          time: 6*util.HOUR_IN_MS+10*util.MINUTE_IN_MS,
          days: [ false,true,true,true,true,true,false ],
          animation: 'sunrise',
          warmup: 20,
          cooldown: 30,
        },
      ],
      fs: vol.promisesApi,
    };

    alarm_data = {
      alarms: schedule_data.alarms,
    };

    instance = new AlarmStore(schedule_data);
  });

  describe('#update', function() {
    beforeEach(async function() {
      instance = new AlarmStore({
        alarms: [],
      });
    });

    it('should populate alarms', async function() {
      instance.update(schedule_data);

      expect(instance.currentState()).to.deep.equal({
        alarms: schedule_data.alarms,
      });
    });

    it('should update human readable state', async function() {
      instance.update(schedule_data);

      expect(instance.getForDate(new Date('2021-10-01T05:45:00.000-05:00'))).to.deep.equal({
        time_ms: 21600000,
        start_ms: 20400000,
        stop_ms: 23400000,
        animation: 'sunrise',
      });
    });
  });

  describe('#loadFromDisk', function() {
    beforeEach(async function() {
      vol.fromJSON({
        '/var/run/alarm/state.json': JSON.stringify(alarm_data),
      });
      schedule_data.alarms = [];
      instance = new AlarmStore(schedule_data);
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
            '/var/run/alarm/state.json': JSON.stringify({ ...schedule_data, fs: undefined }),
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
            '/var/run/alarm/state.json': JSON.stringify({ ...schedule_data, fs: undefined }),
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
      fake_now = new Date('2021-10-01T05:45:00.729-05:00');
    });

    it('should return an event for that date', async function() {
      expect(instance.getForDate(fake_now)).to.deep.equal({
        time_ms: 21600000,
        start_ms: 20400000,
        stop_ms: 23400000,
        animation: 'sunrise',
      });
    });

    context('when there are multiple events for that day of the week', function() {
      beforeEach(async function() {
        fake_now = new Date('2021-10-01T06:00:00.729-05:00');
      });

      it('should return the first event that has started', async function() {
        expect(instance.getForDate(fake_now)).to.deep.equal({
          time_ms: 21600000,
          start_ms: 20400000,
          stop_ms: 23400000,
          animation: 'sunrise',
        });
      });
    });

    context('when no alarm has started', function() {
      it('should return null', async function() {
        fake_now = new Date('2021-10-01T05:30:00.000-05:00');
        // FIXME: would be better to return a known "no alarm" value
        expect(instance.getForDate(fake_now)).to.deep.equal(null);
      });
    });

    context('when there is no alarm that matches the provided js date', function() {
      beforeEach(async function() {
        instance.update({
          alarms: [],
        });
      });

      it('should return null', async function() {
        // FIXME: would be better to return a known "no alarm" value
        expect(instance.getForDate(fake_now)).to.deep.equal(null);
      });
    });
  });
});
