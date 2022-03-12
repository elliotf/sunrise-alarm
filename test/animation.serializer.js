require('./helper');

const expect = require('chai').expect;
const Serializer = require('../animation/serializer');
const Animations = require('../animation');

function hexColors(pixels) {
  if (Array.isArray(pixels[0])) {
    return pixels.map(hexColors);
  }
  return pixels.map((rgb) => {
    return rgb.toString(16);
  });
}

describe.skip('Animation/Serializer', function() {
  let instance;
  let height;
  let animator;

  beforeEach(async function() {
    height = 2;
    instance = new Serializer({
      height,
    });
    animator = new Animations.sunrise({
      height,
    });
  });

  describe('#serialize', function() {
    let frames;

    beforeEach(async function() {
      frames = 5;
    });

    it('should serialize an animation into the given number of frames', async function() {
      expect(hexColors(instance.serialize(animator, frames))).to.deep.equal([
        [ "0", "0" ],
        [ "4a1500", "2a0015" ],
        [ "ffe1e1", "ffe1e1" ],
        [ "fff3f3", "fff3f3" ],
        [ "0", "0" ],
      ]);
    });
  });
});
