<script>
  import { ipcRenderer } from "electron";
  import { onMount } from "svelte";
  import { schueler, medien, titel, configData } from "./../../stores.js";
  import { chunk } from "./../../helpers.js";

  const runner = (_) => {
    const d = new Date().getTime();
    const pdf_name = `${$schueler[0].klasse}_${$schueler[0].kurs || ""}_${$schueler[0].jahr}_${d}.pdf`;
    $configData.gruppe_print_dialog && ipcRenderer.send("print");
    $configData.gruppe_auto_pdf && ipcRenderer.send("pdf", pdf_name);
  };

  onMount(() => {
    setTimeout(runner, 500);
  });

  const anzahl = 30;
</script>

{#each chunk($schueler, anzahl) as slice, i}
  <div class="page grid" orientation="portrait" size="A4">
    <div class="main">
      <h2 class="subtitle">
        {$schueler[0].klasse} – {$schueler[0].kurs} – {$schueler[0].kurs_lehrer}
        – {new Date().toLocaleDateString('de', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </h2>
      <h2 class="subtitle">{$titel || ''}</h2>
      <table class="table">
        <thead>
          <tr>
            <th />
            <th>Name</th>
            <th>Vorname</th>
            <th>Barcode</th>
            <th>Unterschrift</th>
          </tr>
        </thead>
        <tbody>
          {#each slice as s, ii}
            <tr>
              <td>{i * anzahl + ii + 1}</td>
              <td>{s.name}</td>
              <td>{s.vorname}</td>
              <td>{s.gesperrt ? '– gesperrt –' : ''}{$medien[s.id] || ''}</td>
              <td />
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="grid-footer">
      {$schueler[0].klasse} – {$schueler[0].kurs} – {$schueler[0].kurs_lehrer} –
      {new Date().toLocaleDateString('de', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
    </div>
  </div>
{/each}
