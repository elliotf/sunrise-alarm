const chai = require('chai');
const sinon = require('sinon');
const { runner } = require('../app');

chai.use(require('chai-exclude'));

exports.sinon = sinon.createSandbox();
exports.expect = chai.expect;

beforeEach(async function() {
  exports.sinon.restore();
  runner.update({
    alarms: [],
  });
});
