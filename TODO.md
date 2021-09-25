# todo

* todo
  * be able to get keyframes for a given point in time
  * given two keyframes and a float between them
    * interpolate colors
  * be able to have a testing version of the cycle
    * to demo/try out animations
    * quickly cycle through -1..0..1 time indexes?
  * update state on a schedule
    * every N milliseconds/seconds
      * update "now" timestamp of alarm with Date.now()
        * if Date.now() is > current "now" value
          * to support snooze/on/off?
      * "now" state determines current keyframes
        * based on difference between now and alarm time, including warmup, cooldown
      * which will get interpolated
  * hardware
    * find a ws2801 library or make one using https://github.com/fivdi/spi-device
      * akin to https://github.com/Jorgen-VikingGod/node-rpi-ws2801
    * test out LED strip
  * support weekly schedule
    * array of daily offsets?
  * snooze/on/off button
    * toggle between on/off, setting that state for N minutes
* todone
  * gradient formula
* todistract
  * once the alarm is going off, flash the lights?
    * that sounds kind of unpleasant, but maybe a pulse?
