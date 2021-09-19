class LedString {
  constructor({width,height}) {
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

  getOffsetForCoord({x,y}) {
    return y+(x*this.height);
  }

  getCoordForOffset(i) {
    const y = i % this.height;
    const x = Math.floor(i/this.height);

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
        const offset = this.getOffsetForCoord({x,y});

        rows[(this.height-1)-y][x] = this.pixels[offset];
      }
    }

    return rows;
  }

  // TODO: gamma correction
  setGradient(...stops) {
    if ((stops.length-1) > this.height) {
      throw new Error(`Cannot fit ${stops.length-1} deltas into ${this.height} pixels`);
    }

    const channels = [0,1,2]; // R G B indexes into color array
    const p_per_stop = Math.ceil(this.height/(stops.length-1));

    let start = 0;
    let stop = p_per_stop;
    for (let i = 0; i < stops.length - 1; ++i) {
      const from = stops[i];
      const to = stops[i+1];
      const delta = channels.map((ch) => {
        return to[ch] - from[ch];
      });

      let y;
      for (y = start; y < stop && y < this.height; ++y) {
        const pct_up = (y-start) / Math.max(p_per_stop-1,1);

        for (let x = 0; x < this.width; ++x) {
          const offset = this.getOffsetForCoord({x,y})
          channels.forEach((ch) => {
            this.pixels[offset].color[ch] = Math.floor(from[ch] + delta[ch]*pct_up);
          });
        }
      }

      start = y;
      stop = y + p_per_stop;
    }
  }
}

module.exports = LedString;
