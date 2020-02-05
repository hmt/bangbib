<script>
  import { medien } from "./../../stores.js";
  import { group_by, chunk } from "./../../helpers.js";

  const anzahl = 30;
  $: medien_filter = group_by($medien, "medien_id");
</script>

{#each chunk(Object.entries(medien_filter), anzahl) as slice, i}
  <div class="page grid" orientation="portrait" size="A4">
    <div class="main">
      <h2 class="subtitle">
        Verfügbare Medien – {new Date().toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </h2>
      {#if $medien.length}
        <table class="table">
          <thead>
            <tr>
              <th />
              <th>Titel</th>
              <th>Verliehen/Gesamtbestand</th>
            </tr>
          </thead>
          <tbody>
            {#each slice as [n, m], ii}
              <tr>
                <td>{i * anzahl + ii + 1}</td>
                <td>{m[0].medien_name}</td>
                <td>
                  {m.filter(i => i.verliehen).length}/{m.filter(i => i.exemplar_id).length}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}– Bibliothek? Es sind noch keine Medien eingetragen –{/if}
    </div>
  </div>
{/each}
