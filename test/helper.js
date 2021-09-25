const chai = require('chai');
const sinon = require('sinon');

beforeEach(async function() {
  if (this.sinon) {
    this.sinon.restore();
  } else {
    this.sinon = sinon.createSandbox();
  }
});
