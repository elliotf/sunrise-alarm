const util = require('./util');
const log = require('./lib/log')(__filename);

function gammaCorrect(val) {
  // darken low values
  const correction = 2;
  const corrected = Math.pow((val / 255), correction) * 255;

  return corrected;
}

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

    // FIXME: untested, done to avoid blowing up under test
    if (process.env.NODE_ENV === 'production') {
      const LedController = require('ws2801-pi').default;
      this.led_controller = new LedController(width*height);
    } else {
      log.warn({ NODE_ENV: process.env.NODE_ENV }, "Node env is not `production`, not enabling WS2801 display");
    }
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

  static valueForColumn(width, col, raw_val) {
    const max = 255;
    const per_col = max/width;
    const cols = util.round(raw_val / per_col, 2);
    const over = Math.max(util.round((cols - col) * max, 0), 0);

    if (Math.floor(cols) > col) {
      return 255;
    }

    return over;
  }

  async fill(from, to, pct) {
    const channels = [0,1,2]; // R G B indexes into color array

    for (let y = 0; y < this.height && y < this.height; ++y) {
      const delta = channels.map((ch) => {
        return to[y][ch] - from[y][ch];
      });

      for (let x = 0; x < this.width; ++x) {
        const pixel = this.getPixelAtCoord({x,y});
        channels.forEach((ch) => {
          const value = LedString.valueForColumn(this.width, x, from[y][ch] + delta[ch]*pct);
          pixel.color[ch] = value;
        });

        const color = {
          red: Math.round(gammaCorrect(pixel.color[0])),
          green: Math.round(gammaCorrect(pixel.color[2])),
          blue: Math.round(gammaCorrect(pixel.color[1])),
        };

        if (0 == y && 0 == x) {
          // console.log('color.red', color.red);
        }

        if (this.led_controller) {
          await this.led_controller.setLed(pixel.offset, color);
        }
      }
    }

    if (this.led_controller) {
      await this.led_controller.show();
    }
  }
}

module.exports = LedString;
