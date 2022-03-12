const { expect, sinon } = require('./helper');
const Alarm = require('../alarm');
const LedString = require('../led_string');
const Runner = require('../runner');
const Store = require('../store');

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
          animation: 'sunrise',
          days: [ true,false,false,false,false,false,true ],
        },
        {
          hour: 9,
          animation: 'off',
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

  describe('#getCurrentAnimation', function() {
    it('should return the animation of the `current_alarm`', async function() {
      expect(inst.getCurrentAnimation()).to.equal('off');
    });
  });

  describe('#getAnimations', function() {
    it('should return a list of valid idle animations', async function() {
      expect(inst.getIdleAnimations()).to.deep.equal([
        'off',
        'on',
        'rainbow',
      ]);
    });
  });

  describe('#setIdleAnimation', function() {
    it('should set the `current_alarm` to the new mode', async function() {
      const starting = inst.current_alarm;

      expect(starting.animation).to.equal('off');
      expect(inst.idle_alarm).to.equal(starting);

      inst.setIdleAnimation('on');

      const set_on = inst.current_alarm;
      expect(inst.idle_alarm).to.equal(set_on);
      expect(set_on.animation).to.equal('on');

      inst.setIdleAnimation('rainbow');

      const set_rainbow = inst.current_alarm;
      expect(inst.idle_alarm).to.equal(set_rainbow);
      expect(set_rainbow.animation).to.equal('rainbow');
    });

    context('when an invalid mode is specified', function() {
      it('should throw an error', async function() {
        expect(function() {
          inst.setIdleAnimation('invalid');
        }).to.throw(Error, /invalid.*animation/i);
      });
    });
  });

  describe('#toggleIdleAnimation', function() {
    it('should cycle through idle animations', async function() {
      expect(inst.current_alarm.animation).to.equal('off');

      inst.toggleIdleAnimation();
      expect(inst.current_alarm.animation).to.equal('on');

      inst.toggleIdleAnimation();
      expect(inst.current_alarm.animation).to.equal('rainbow');

      inst.toggleIdleAnimation();
      expect(inst.current_alarm.animation).to.equal('off');

      inst.toggleIdleAnimation();
      expect(inst.current_alarm.animation).to.equal('on');
    });

    context('when an alarm is active', function() {
      beforeEach(async function() {
        await inst.updateNow(fake_now, fake_display);
      });

      it('should replace it with an idle animation', async function() {
        expect(inst.current_alarm.animation).to.equal('sunrise');

        inst.toggleIdleAnimation();
        expect(inst.current_alarm.animation).to.equal('off');

        inst.toggleIdleAnimation();
        expect(inst.current_alarm.animation).to.equal('on');

        inst.toggleIdleAnimation();
        expect(inst.current_alarm.animation).to.equal('rainbow');

        inst.toggleIdleAnimation();
        expect(inst.current_alarm.animation).to.equal('off');
      });
    });
  });
});
