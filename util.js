const SECOND_IN_MS = exports.SECOND_IN_MS = 1000;
const MINUTE_IN_MS = exports.MINUTE_IN_MS = 60*SECOND_IN_MS;
const HOUR_IN_MS = exports.HOUR_IN_MS = 60*MINUTE_IN_MS;
const DAY_IN_MS = exports.DAY_IN_MS = 24*HOUR_IN_MS;

exports.SUNDAY_INDEX = 0;
exports.MONDAY_INDEX = 1;
exports.TUESDAY_INDEX = 2;
exports.WEDNESDAY_INDEX = 3;
exports.THURSDAY_INDEX = 4;
exports.FRIDAY_INDEX = 5;
exports.SATURDAY_INDEX = 6;

exports.round = function(number, places) {
  const t = Math.pow(10,places);
  return Math.round(number*t)/t;
};

exports.msIntoDay = function(date) {
  const offset = date.getTimezoneOffset();
  const ms_adjusted = date.valueOf() - offset*MINUTE_IN_MS;
  const ms_truncated = 1000*(Math.floor(ms_adjusted/1000));
  const ms_into_day = ms_truncated % DAY_IN_MS;

  return ms_into_day;
};

exports.range = function(begin,end) {
  const result = [];
  for(let i = begin; i <= end; ++i) {
    result.push(i);
  }

  return result;
};

/*
exports.hsl2rgb = function(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

exports.hsv2rgb = function(H, S, V) {
  const Hp = H / 60; // quadrant?
  const C = V*S;
  const X = C*(1-((Hp % 2) - 1));
  const m = V - C;

  console.log({
    H,
    S,
    V,
    Hp,
    C,
    X,
    m,
  });
};

exports.hsv2rgb = function(h,s,v) {
  function f(n,k=(n+h/60)%6) {
    return 255*(v - v*s*Math.max( Math.min(k,4-k,1), 0));
  }
  return [f(5),f(3),f(1)];
}

function mix(a,b,v) {
  return (1-v)*a + v*b;
}

exports.hsv2rgb	= function(H, S, V) {
    var V2 = V * (1 - S);
    var r  = ((H>=0 && H<=60) || (H>=300 && H<=360)) ? V : ((H>=120 && H<=240) ? V2 : ((H>=60 && H<=120) ? mix(V,V2,(H-60)/60) : ((H>=240 && H<=300) ? mix(V2,V,(H-240)/60) : 0)));
    var g  = (H>=60 && H<=180) ? V : ((H>=240 && H<=360) ? V2 : ((H>=0 && H<=60) ? mix(V2,V,H/60) : ((H>=180 && H<=240) ? mix(V,V2,(H-180)/60) : 0)));
    var b  = (H>=0 && H<=120) ? V2 : ((H>=180 && H<=300) ? V : ((H>=120 && H<=180) ? mix(V2,V,(H-120)/60) : ((H>=300 && H<=360) ? mix(V,V2,(H-300)/60) : 0)));

    return [
        exports.round(r * 255, 3),
        exports.round(g * 255, 3),
        exports.round(b * 255, 3)
    ];
}
*/
