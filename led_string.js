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

  displayForTest() {
    return this.pixels.map((p) => {
      return p.color.map((c) => {
        return c.toString().padEnd(3, ' ');
      }).join(' ');
    })
  }

  static interpolate(from, to, pct) {
    return Math.round(from + (to - from)*pct);
  }

  fill(from, to, pct) {
    const channels = [0,1,2]; // R G B indexes into color array

    for (let y = 0; y < this.height && y < this.height; ++y) {
      const delta = channels.map((ch) => {
        return to[y][ch] - from[y][ch];
      });

      for (let x = 0; x < this.width; ++x) {
        const pixel = this.getPixelAtCoord({x,y});
        channels.forEach((ch) => {
          pixel.color[ch] = Math.round(from[y][ch] + delta[ch]*pct);
        });
      }
    }
  }
}

module.exports = LedString;
