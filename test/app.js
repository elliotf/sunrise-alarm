const { expect, sinon } = require('./helper');
const request = require('supertest');
const { app, runner } = require('../app');

// probably want to
describe('HTTP API', function() {
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