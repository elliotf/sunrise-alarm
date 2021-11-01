const config = require('./config');
const util = require('./util');

class Scheduler {
  constructor(attrs) {
    const {
      alarms,
      fs,
    } = attrs;

    this._fs = fs;

    this._user_readable_state = alarms;
    this._days = Array.apply(null, { length: 7 }).map(() => {
      return [];
    });

    alarms.forEach((alarm) => {
      alarm.days.forEach((active,i) => {
        if (!active) {
          return;
        }

        this._days[i].push({
          time_ms: alarm.time,
          start_ms: alarm.time-alarm.warmup*util.MINUTE_IN_MS,
          stop_ms: alarm.time+alarm.cooldown*util.MINUTE_IN_MS,
          animation: alarm.animation,
        });
      });
    });

    this._days.forEach((day) => {
      day.sort((a,b) => {
        return a.time - b.time;
      });
    });
  }

  async persist() {
    const path = config.scheduler_state_path;
    const data = {
      something: 'whatever',
    };
    await this._fs.writeFile(path, JSON.stringify(this._user_readable_state));
  }

  getForDate(date) {
    const day = date.getDay();
    const rounded_ms = 1000*Math.round(date.valueOf()/1000);
    const ms_into_day = util.msIntoDay(date);

    const alarms = this._days[day];
    for (let i = 0; i < alarms.length; ++i) {
      const alarm = alarms[i];

      if (ms_into_day >= alarm.start_ms) {
        return {
          time_ms: alarm.time_ms,
          start_ms: alarm.start_ms,
          stop_ms: alarm.stop_ms,
          animation: alarm.animation,
        };
      }
    }

    return null;
  }
}

module.exports = Scheduler;
