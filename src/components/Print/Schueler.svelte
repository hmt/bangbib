<script>
  import { schueler, medien, titel } from "./../../stores.js";
  import { group_by, chunk } from "./../../helpers.js";
  const s = $schueler[0];
  const anzahl = 30;
</script>

{#each chunk($medien, anzahl) as slice, i}
  <div class="page grid" orientation="portrait" size="A4">
    <div class="main">
      <h2 class="subtitle">
        {`${s.name}, ${s.vorname}`}
        {#if s.klasse}– {s.klasse}{/if}
        <br />
        {new Date().toLocaleDateString('de', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </h2>
      <i>{s.memo || ''}</i>
      {#if $medien.length}
        <table class="table">
          <thead>
            <tr>
              <th />
              <th>Titel</th>
              <th>Barcode</th>
            </tr>
          </thead>
          <tbody>
            {#each slice as m, ii}
              <tr>
                <td>{i * anzahl + ii + 1}</td>
                <td>{m.name}</td>
                <td>{m.barcode}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}– Keine Medien geliehen –{/if}
    </div>
  </div>
{/each}
