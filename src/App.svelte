<script>
  import LedString from '../led_string';

  const string = new LedString({
    width: 8,
    height: 10,
  });

  string.setGradient([255,0,0],[0,0,0],[0,0,0])

  let rows = string.toRowsAndColumns();

  function cssColor(color) {
    const str = color.map(function(ch) {
      return ch.toString(16).padStart(2, '0');
    });

    return '#' + str.join('');
  }
</script>

<main>
  <div class="container">
    {#each rows as pixels}
      <div class="row">
      {#each pixels as p}
        <div class="pixel" style="background-color: {cssColor(p.color)}">{p.offset}:{p.x},{p.y}&nbsp;</div>
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
