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

  setGradient(from,to) {
    // TODO: gamma correction
    const channels = [0,1,2];
    const delta = channels.map((ch) => {
      return to[ch] - from[ch];
    });
    this.pixels.forEach((p) => {
      const pct_up = (p.y) / (this.height-1);

      channels.forEach((ch) => {
        p.color[ch] = Math.floor(from[ch] + delta[ch]*pct_up);
      });

    })
  }
}

module.exports = LedString;
