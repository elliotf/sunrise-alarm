const util = require('../util');

class Serializer {
  serialize(animator, num_frames) {
    /*
    const min_offset = -1;
    const max_offset = 1;
    const dist_to_go = max_offset - min_offset;
    const offset_step_per_frame = (dist_to_go)/(num_frames-1);
    const frames = [];

    for(let o = min_offset; o <= max_offset; o += offset_step_per_frame) {
      const pixels = animator.at(o);
      frames.push(pixels.map((rgb) => {
        return util.packRGB(rgb);
      }));
    }

    return frames;
    */
  }
}

module.exports = Serializer;
