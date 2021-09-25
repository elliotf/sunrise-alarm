class LedString {
  constructor(opts) {
    const {
      width=5,
      height=8,
    } = opts || {};

    this.width = width;
    this.height = height;
    this.pixels = Array
      .apply(null, { length: this.height*this.width })
      .map((ignored,offset) => {
        const {x,y} = this.getCoordForOffset(offset);
        return {
          offset,
          x,
          y,
          color: [0,0,0],
        };
      });
  }

  getPixelAtCoord({x,y}) {
    const offset = this.getOffsetForCoord({x,y});
    return this.pixels[offset];
  }

  getPixelAtOffset(offset) {
    return this.pixels[offset];
  }

  getOffsetForCoord({x,y}) {
    const y_part = (x % 2) ? (this.height - y - 1) : y;
    return y_part + x*this.height;
  }

  getCoordForOffset(i) {
    const x = Math.floor(i/this.height);

    const y_mod = i % this.height;
    const y = (x % 2) ? (this.height - y_mod - 1): y_mod

    return {
      x,
      y,
    };
  }

  toRowsAndColumns() {
    let rows = Array
      .apply(null, { length: this.height })
      .map(function() {
        return ['a'];
      });

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        rows[(this.height-1)-y][x] = this.getPixelAtCoord({x,y});
      }
    }

    return rows;
  }

  // TODO: gamma correction: `255 * Math.pow(( val / 255), gammacorrection_factor);`
  setGradient(...stops) {
    if ((stops.length-1) > this.height) {
      throw new Error(`Cannot fit ${stops.length-1} deltas into ${this.height} pixels`);
    }

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

        for (let x = 0; x < this.width; ++x) {
          const pixel = this.getPixelAtCoord({x,y});
          channels.forEach((ch) => {
            pixel.color[ch] = Math.floor(from[ch] + delta[ch]*pct_up);
          });
        }
      }
    }
  }
}

module.exports = LedString;
