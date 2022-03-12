const chai = require('chai');
const sinon = require('sinon');
const { store } = require('../app');

chai.use(require('chai-exclude'));

exports.sinon = sinon.createSandbox();
exports.expect = chai.expect;

beforeEach(async function() {
  exports.sinon.restore();
  store.update({
    alarms: [],
  });
});
