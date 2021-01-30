<script>
  import { schueler, medien, configData } from "./../../stores.js";
  import { chunk } from "./../../helpers.js";
  const s = $schueler[0];
  const anzahl = 30;
  $: medien_filter =
    $configData.kontoauszug_beleg_filter && $configData.kontoauszug_beleg
    ? $medien.filter(m=>m.beleg_filter)
    : $medien
</script>

{#each chunk(medien_filter, anzahl) as slice, i}
  <div class="page grid" orientation="portrait" size="A4">
    <div class="main">
      <div class="subtitle">
        {`${s.name}, ${s.vorname}`}
        {#if s.klasse}– {s.klasse}{/if}
        <div style="float:right">
          {new Date().toLocaleDateString("de", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      </div>
      <i>{s.memo || ""}</i>
      {#if $medien.length}
        <table class="table">
          <thead>
            <tr>
              <th />
              <th>Titel</th>
              <th>Barcode</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {#each slice as m, ii}
              <tr>
                <td>{i * anzahl + ii + 1}</td>
                <td>{m.name}</td>
                <td>{m.barcode}</td>
                <td>{m.memo || "–"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}– Keine Medien geliehen –{/if}
    </div>
    <div class="grid-footer">
      {#if $configData.kontoauszug_beleg}
        <br />
        <b>{`${s.name}, ${s.vorname}`}</b> bestätigt, die oben aufgeführten
        Medien/Gegenstände engegengenommen und allen dazugehörigen
        Nutzungsvereinbarungen und Einverständniserklärungen zugestimmt zu
        haben. <br /> Sofern der Nutzer oder die Nutzerin nicht volljährig ist,
        wurde von einer sorgeberechtigen Person zugestimmt.
        <br />
        <br />Datum, Unterschrift: _________________________________
      {/if}
    </div>
  </div>
{/each}
