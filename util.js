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
