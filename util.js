exports.round = function(number, places) {
  const t = Math.pow(10,places);
  return Math.round(number*t)/t;
}
