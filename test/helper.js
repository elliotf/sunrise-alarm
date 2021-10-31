const chai = require('chai');
const sinon = require('sinon');

global.context = describe;

exports.sinon = sinon.createSandbox();
exports.expect = chai.expect;

beforeEach(async function() {
  exports.sinon.restore();
});
