const { expect, sinon } = require('./helper');
const Alarm = require('../alarm');
const LedString = require('../led_string');
const Runner = require('../runner');
const Store = require('../store');
const minute_in_ms = 60*1000;
const hour_in_ms = 60*minute_in_ms;

describe('Runner', function() {
  let inst;
  let opts;
  let store_attrs;
  let store;
  let fake_now;
  let fake_display;

  beforeEach(async function() {
    store_attrs = {
      alarms: [
        {
          hour: 8,
          warmup: 0,
          cooldown: 0,
          days: [ true,false,false,false,false,false,true ],
        },
      ],
      fs: null, // not hitting disk in this test
      height: 5,
    };

    store = new Store(store_attrs);

    fake_now = new Date('2021-01-02T08:00:00.000-06:00');

    fake_display = new LedString({
      width: 1,
      height: 1,
    });

    fake_display._fake = 'display';

    opts = {
      store: store,
    };

    inst = new Runner(opts);
  });

  describe('#updateNow', function() {
    context('when there is a current alarm', function() {
      beforeEach(async function() {
        await inst.updateNow(fake_now, fake_display);
      });

      it('should delegate to #updateNow on the current alarm', async function() {
        sinon.spy(inst.current_alarm, 'updateNow');

        await inst.updateNow(fake_now, fake_display);

        expect(inst.current_alarm.updateNow.args).to.deep.equal([
          [fake_now, fake_display],
        ]);
      });

      context('when the time is past the lifetime of the current alarm (Alarm#updateNow returns false)', function() {
        beforeEach(async function() {
          fake_now = new Date('2021-01-02T10:00:00.000-06:00');
        });

        it('should replace the alarm with the noop alarm', async function() {
          await inst.updateNow(fake_now, fake_display);

          expect(inst.current_alarm.animation).to.equal('off');
        });
      });
    });

    context('when there is no current alarm', function() {
      it('should delegate to Store#getForDate', async function() {
        sinon.spy(store, 'getForDate');

        await inst.updateNow(fake_now, fake_display);

        expect(store.getForDate.args).to.deep.equal([
          [fake_now],
        ]);

        expect(inst.current_alarm).to.be.an.instanceof(Alarm);
        expect(inst.current_alarm.animation).to.equal('sunrise');
      });

      context('and there should be no alarm', function() {
        beforeEach(async function() {
          fake_now = new Date('2021-01-02T00:00:00.000-06:00');
        });

        it('should return without error', async function() {
          await inst.updateNow(fake_now, fake_display);
        });
      });
    });
  });
});
