class AnimationBase {
  constructor({height}) {
    this.height = height;
  }

  at(offset,ms) {
    throw new Error('Needs to be implemented');
  }

  gradientFrom(stops) {
    if ((stops.length-1) > this.height) {
      throw new Error(`Cannot fit ${stops.length-1} deltas into ${this.height} pixels`);
    }

    const gradient = new Array(this.height);

    const channels = [0,1,2]; // R G B indexes into color array

    for (let i = 0; i < stops.length - 1; ++i) {
      const [from_pct, ...from] = stops[i];
      const [to_pct, ...to] = stops[i+1];
      const delta = channels.map((ch) => {
        return to[ch] - from[ch];
      });

      const start = Math.floor(from_pct*this.height);
      const stop = Math.ceil(to_pct*this.height);

      for (let y = start; y < stop && y < this.height; ++y) {
        const pct_up = (y-start) / Math.max(stop-start-1,1);

        const color = [];
        channels.forEach((ch) => {
          color[ch] = Math.floor(from[ch] + delta[ch]*pct_up);
        });

        gradient[y] = color;
      }
    }

    return gradient;
  }
}

module.exports = AnimationBase;
