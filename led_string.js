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
      bottom_start=true,
    } = opts || {};

    this.width = width;
    this.height = height;
    this.bottom_start = (bottom_start) ? true : false;
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
    const y_part = (Boolean(x % 2) === this.bottom_start) ? (this.height - y - 1) : y;
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
    let max_length = 0;
    this.pixels.forEach((p) => {
      p.color.forEach((c) => {
        const len = c.toString().length;
        if (len > max_length) {
          max_length = len;
        }
      });
    });

    return this.pixels.map((p) => {
      return p.color.map((c) => {
        return c.toString().padEnd(max_length, ' ');
      }).join(' ');
    })
  }

  async fill(colors) {
    const per_pixel = 1/this.width;
    const channels = [0,1,2]; // RGB indexes

    // a form of dithering, to make light changes more gradual
    function selectiveRound(x, val) {
      // untested
      return ((val % 1) > x*per_pixel) ? Math.ceil(val) : Math.floor(val);
    }

    for (let y = 0; y < this.height && y < this.height; ++y) {
      const rgb = colors[y];

      for (let x = 0; x < this.width; ++x) {
        const pixel = this.getPixelAtCoord({x,y});
        pixel.color = rgb;

        const color = {
          red: selectiveRound(x, gammaCorrect(rgb[0])),
          green: selectiveRound(x, gammaCorrect(rgb[2])*0.9),
          blue: selectiveRound(x, gammaCorrect(rgb[1])),
        };

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
