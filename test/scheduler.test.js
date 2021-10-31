require('./helper');

const expect = require('chai').expect;
const Scheduler = require('../scheduler');

describe('Scheduler', function() {
  let instance;

  beforeEach(async function() {
    instance = new Scheduler();
  });

  it('can be instantiated', async function() {
    const scheduler = new Scheduler();
  });

  describe('#load', function() {
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

  describe('#save', function() {
    it.skip('should save state to disk', async function() {
    });

    context.skip('when the file does not exist', function() {
      it('should save state to disk', async function() {
      });
    });

    context.skip('when the directory does not exist', function() {

    });

    context.skip('when there is a permissions problem', function() {

    });

    context.skip('when there is no filesystem path', function() {

    });
  });
});
