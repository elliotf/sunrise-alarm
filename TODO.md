# todo

* todo
  * better fitting cherry MX sockets
    * don't latch correctly
    * a little too tall
    * fixes
      * don't recess the buttons, for more accurate thickness?
      * angle the contact edge for more support
        * surface farthest from the key switch is the bridge that is susceptible to sag
        * supports the angled surface that interfaces with the key retainer clip
  * more flexible scheduling
    * have start/stop for animation schedules
      * or have a given event run until the next
    * auto-on, auto-off, auto-rainbow, etc.
    * begin/end
      * which would make animations more consistent
        * no more "warmup" for the sunrise
        * everything would have a float for its animation cycle?
          * 0 is start, 1 is end of cycle, 0.000005 is very close to start
      * The sunrise would be separate from the "full on"
      * The warmup would be separate from the "full on"
      * more composable animations
        * sunrise to rainbow is an option
  * reduce CPU requirements, increase framerate
    * pre-generate or cache animations
    * C++ animation generation?
  * away mode?
    * random times?
  * production-ize
    * caddy?
    * expose via oauth gateway?
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
  * web UI
    * adjust schedule
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
  * smoother gradients
    * try out multi-column lighting
      * gang columns together, so that N light up together?
        * now `const value = LedString.valueForColumn(this.width, x, from[y][ch] + delta[ch]*pct);`
        * maybe `const value = LedString.valueForColumn(this.width, x % num_columns, from[y][ch] + delta[ch]*pct);`
  * multiple events per day
    * alarm has a "current alarm"
      * this would let us get rid of "disabled until" for snoozing purposes
      * otherwise asks scheduler if there is an alarm to process
    * scheduler
      * normalized view of alarms is stored on-disk as json
      * hydrates into denormalized view?
    * have a sunset animation as well as sunrise
  * update state on a schedule
    * every N milliseconds/seconds
      * `setInterval(function() { Alarm#updateNow(new Date); }, 1000);`
      * which will get interpolated
  * hardware
    * test out LED strip to make sure it's not busted
  * gamma correction
  * hardware
    * find a ws2801 library or make one using https://github.com/fivdi/spi-device
      * akin to https://github.com/Jorgen-VikingGod/node-rpi-ws2801
    * LED strip's (odd?) wiring colors
      * SPI
        * BLUE: GND
        * RED: SI (GPIO 10, PIN 19)
        * GREEN: CLK (GPIO 11, PIN 23)
        * BLACK: 5V
      * power
        * RED: 5V
        * BLACK: GND
  * redesign/organization
    * alarm runner
      * takes in
        * scheduler
        * led_string
          * or display?
          * or a render function that takes a display?
    * alarm store
      * takes in
        * fs
    * animator
      * stores keyframes for animations by name
        * sunrise
        * sunset
        * on
        * off
        * etc
* todistract
  * once the alarm is going off, flash the lights?
    * that sounds kind of unpleasant, but maybe a pulse?
  * dismiss/on/off button
    * toggle between on/off
    * setting that state for N minutes?
    * added three buttons, could do on/off toggle and brighter/dimmer, etc.
    * add a light sensor?
      * how to avoid self pollution?
  * web UI
    * YAGNI: adjust animations
