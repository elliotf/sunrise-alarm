# todo

* todo
  * make LED schedule configuration rather than inside of code
    * config/default vs config/test ?
  * update state on a schedule
    * every N milliseconds/seconds
      * `setInterval(() => { Alarm#updateNow(new Date); }, 1000);`
      * which will get interpolated
  * hardware
    * find a ws2801 library or make one using https://github.com/fivdi/spi-device
      * akin to https://github.com/Jorgen-VikingGod/node-rpi-ws2801
    * test out LED strip to make sure it's not busted
  * Alarm#snooze
    * make #updateNow() do nothing if new now < current now
  * snooze/on/off button
    * toggle between on/off, setting that state for N minutes
  * gamma correction
  * web UI
    * adjust schedule
    * YAGNI: adjust animations
  * multiple events per day?
  * away mode?
    * random times?
  * production-ize
    * caddy?
    * expose via Oauth gateway?
* todone
  * gradient formula
  * be able to get keyframes for a given point in time
  * given two keyframes and a float between them
    * interpolate colors
  * be able to have a testing version of the cycle
    * to demo/try out animations
    * quickly cycle through -1..0..1 time indexes?
  * support weekly schedule
    * array of daily offsets?
  * "now" state determines current keyframes
    * based on difference between now and alarm time, including warmup, cooldown
* todistract
  * once the alarm is going off, flash the lights?
    * that sounds kind of unpleasant, but maybe a pulse?
