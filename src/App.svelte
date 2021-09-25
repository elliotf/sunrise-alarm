<script>
  import LedString from '../led_string';

  //const num_pixels = 160; // 5M @ 32 pixels/M
  const num_pixels = 40; // for testing
  const width = 5;
  const height = Math.floor(num_pixels/width);

  const string = new LedString({
    width,
    height,
  });

  string.setGradient(
    [0,255,0,0],
    [0.75,0,0,0],
    [1,0,0,0]
  )

  /*
  string.setGradient(
    [0,255,64,64],
    [0.75,0,0,0],
    [1,0,0,0]
  )
  */

  let rows = string.toRowsAndColumns();

  function cssColor(color) {
    const str = color.map(function(ch) {
      return ch.toString(16).padStart(2, '0');
    });

    return '#' + str.join('');
  }

  function labelForPixel({ x, y, offset }) {
    return '';
    return `${offset}:${x},${y}`;
    return `${offset}`;
  }
</script>

<main>
  <div class="container">
    {#each rows as pixels}
      <div class="row">
      {#each pixels as p}
        <div class="pixel" style="background-color: {cssColor(p.color)}">{labelForPixel(p)}</div>
      {/each}
      </div>
    {/each}
  </div>
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
