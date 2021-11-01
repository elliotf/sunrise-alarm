const { expect, sinon } = require('./helper');

const Scheduler = require('../scheduler');
const util = require('../util');
const memfs = require('memfs');

describe('Scheduler', function() {
  let vol;
  let instance;
  let schedule_data;

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

    instance = new Scheduler(schedule_data);
  });

  describe.skip('#loadFromDisk', function() {
    it.skip('should load state from disk', async function() {
    });

    context.skip('when the file does not exist', function() {

    });

    context.skip('when the directory does not exist', function() {

    });

    context.skip('when there is a permissions problem', function() {

    });

    context.skip('when there is no filesystem path', function() {

    });
  });

  describe.skip('#loadState', function() {
  });

  describe('#persistToDisk', function() {
    context('when the folder exists', function() {
      beforeEach(async function() {
        vol.mkdirSync('/var/run/alarm', { recursive: true });
      });

      context('and the file exists', function() {
        beforeEach(async function() {
          await vol.promisesApi.writeFile('/var/run/alarm/state.json', '{}');
        });

        it('should save state to disk', async function() {
          await instance.persist();

          expect(vol.toJSON()).to.deep.equal({
            '/var/run/alarm/state.json': JSON.stringify(schedule_data.alarms),
          });
        });
      });

      context('and the file does not exist', function() {
        it('should create the file and save state to disk', async function() {
          await instance.persist();

          expect(vol.toJSON()).to.deep.equal({
            '/var/run/alarm/state.json': JSON.stringify(schedule_data.alarms),
          });
        });
      });
    });


    context.skip('when the directory does not exist', function() {

    });

    context.skip('when there is a permissions problem', function() {

    });

    context.skip('when there is no filesystem path', function() {

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
      // FIXME: would be better to return a known "no alarm" value
      it('should return null', async function() {
        fake_now = new Date('2021-10-01T05:30:00.000-05:00');
        expect(instance.getForDate(fake_now)).to.deep.equal(null);
      });
    });

    context('when there is no alarm that matches the provided js date', function() {
      it.skip('should return null', async function() {
        // FIXME: would be better to return a known "no alarm" value
      });
    });
  });
});
