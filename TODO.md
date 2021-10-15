# todo

* todo
  * hardware
    * find a ws2801 library or make one using https://github.com/fivdi/spi-device
      * akin to https://github.com/Jorgen-VikingGod/node-rpi-ws2801
    * test out LED strip to make sure it's not busted
    * LED strip's (odd?) wiring colors
      * SPI
        * BLUE: GND
        * RED: SI (GPIO 10, PIN 19)
        * GREEN: CLK (GPIO 11, PIN 23)
        * BLACK: 5V
      * power
        * RED: 5V
        * BLACK: GND
  * dismiss/on/off button
    * toggle between on/off
    * setting that state for N minutes?
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
  * assertions on animation/gradient config
    * avoid duplicate indices in schedule and gradients
* eventually, maybe, but probably not
  * snooze button
  * swap out time generating/scheduling/gradient functions
    * snooze = now() + delay
  * separate display from alarm
    * Tidier DI style
    * easier to stub out WS2801/phy under test?
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
  * make LED schedule configuration rather than inside of code
    * config/default vs config/test ?
  * Alarm#snooze (made it #dismiss instead of snooze)
    * make #updateNow() do nothing if new now < current now
  * update state on a schedule
    * every N milliseconds/seconds
      * `setInterval(() => { Alarm#updateNow(new Date); }, 1000);`
      * which will get interpolated
* todistract
  * once the alarm is going off, flash the lights?
    * that sounds kind of unpleasant, but maybe a pulse?
