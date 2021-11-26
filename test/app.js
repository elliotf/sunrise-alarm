const { expect, sinon } = require('./helper');
const request = require('supertest');
const cheerio = require('cheerio');
const { app, runner } = require('../app');

// probably want to
describe('HTTP API', function() {
  describe('GET /', function() {
    let url;

    beforeEach(async function() {
      url = '/';
    });

    it('should display the current idle animation', async function() {
      const res = await request(app)
        .get(url)
        .expect(200);

      const $ = cheerio.load(res.text);

      const buttons = $('.current .btn.animation');
      expect(buttons).to.have.length(3);

      expect(buttons.eq(0).attr('value')).to.equal("off");
      expect(buttons.eq(0).attr('disabled')).to.equal("disabled");
      expect(buttons.eq(1).attr('value')).to.equal("on");
      expect(buttons.eq(1).attr('disabled')).to.equal(undefined);
      expect(buttons.eq(2).attr('value')).to.equal("rainbow");
      expect(buttons.eq(2).attr('disabled')).to.equal(undefined);
    });

    it.skip('should show existing alarms with an additional empty new alarm', async function() {
      const res = await request(app)
        .get(url)
        .expect(200);

      const $ = cheerio.load(res.text);

      const alarms = $('.alarm.container');
      expect(alarms).to.have.length(3);
      expect(alarms.eq(0).children('.timepicker')).to.have.length(1);
      expect(alarms.eq(0).children('.timepicker').attr('value')).to.equal('watsss');
    });

    context.skip('when there are no alarms configured', function() {
      it('should show an empty new alarm', async function() {
        const res = await request(app)
          .get(url)
          .expect(200);

        const $ = cheerio.load(res.text);

        expect($('.alarm')).to.have.length(3);
      });
    });
  });

  describe('POST /api/animation/toggle', function() {
    let url;
    let data;

    beforeEach(async function() {
      url = '/api/animation/toggle';
      data = {
      };
    });

    it('should return 200', async function() {
      const res = await request(app)
        .post(url)
        .send(data)
        .expect(200, {});
    });

    it('should toggle the idle animation', async function() {
      sinon.spy(runner, 'toggleIdleAnimation');

      const res = await request(app)
        .post(url)
        .send(data);

      expect(runner.toggleIdleAnimation.args).to.deep.equal([
        [],
      ]);
    });
  });

  describe('PUT /api/animation/current', function() {
    let url;
    let data;

    beforeEach(async function() {
      url = '/api/animation/current';
      data = {
        animation: 'rainbow',
      };
    });

    it('should return 200', async function() {
      const res = await request(app)
        .put(url)
        .send(data)
        .expect(200, {});
    });

    it('should toggle the idle animation', async function() {
      sinon.spy(runner, 'setIdleAnimation');

      const res = await request(app)
        .put(url)
        .send(data);

      expect(runner.setIdleAnimation.args).to.deep.equal([
        ['rainbow'],
      ]);
    });

    context('when provided an invalid animation', function() {
      beforeEach(async function() {
        data.animation = 'fake-invalid-animation';
      });

      it('should return a 400', async function() {
        const res = await request(app)
          .put(url)
          .send(data)
          .expect(400, {
            error: 'Invalid animation specified',
            field: 'animation',
            value: 'fake-invalid-animation',
          });
      });
    });
  });
});
