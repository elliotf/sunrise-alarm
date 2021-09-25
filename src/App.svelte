<script>
  import { writable } from 'svelte/store';
  import Alarm from '../alarm';

  const loop_period = 5*1000;
  let start = Date.now();
  let offset = writable(-1, () => {
    let interval = setInterval(() => {
      const pct = ((Date.now() - start) / loop_period) - 1;
      offset.update(value => pct);

      if (pct > 1.1) {
        start = Date.now();
      }
    }, 100)

    return () => {
      clearInterval(interval);
    }
  });

  const num_pixels = 160; // 5M @ 32 pixels/M
  //const num_pixels = 40; // for testing
  const width = 8;
  const height = Math.floor(num_pixels/width);

	const minute_in_ms = 60*1000;
	const hour_in_ms = 60*minute_in_ms;
  const alarm = new Alarm({
    width,
    height,
		warm_up_time_ms: 20*minute_in_ms,
		cool_down_time_ms: 10*minute_in_ms,
		alarm_schedule: [
			null, // Sunday
			6*hour_in_ms, // Monday
			6*hour_in_ms, // Tuesday
			6*hour_in_ms, // Wednesday
			6*hour_in_ms, // Thursday
			6*hour_in_ms, // Friday
			null, // Saturday
		],
  });

  function cssColor(color) {
    const str = color.map(function(ch) {
      return ch.toString(16).padStart(2, '0');
    });

    return '#' + str.join('');
  }

  function renderAtOffset(offset) {
    alarm.updateOffset(offset);
    return alarm.leds.toRowsAndColumns();
  }

  function labelForPixel({ x, y, offset }) {
    return '';
    return `${offset}:${x},${y}`;
    return `${offset}`;
  }
</script>

<main>
  <div class="container">
    {#each renderAtOffset($offset) as pixels}
      <div class="row">
      {#each pixels as p}
        <div class="pixel" style="background-color: {cssColor(p.color)}">{labelForPixel(p)}</div>
      {/each}
      </div>
    {/each}
  </div>
  <!-- <h1>{ $tick }</h1> -->
</main>

<style>
  .container {
    display: table;
    align: center;
    margin: auto;
    border: 1px solid grey;
  }

  .row {
    display: table-row;
  }

  .pixel {
    text-align: center;
    vertical-align: middle;
    display: table-cell;
    height: 64px;
    width: 64px;
    color: white;
    /* padding: 1px; */
    border: 0px;
    /* background-color: red; */
    font-size: 9px;
  }

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
