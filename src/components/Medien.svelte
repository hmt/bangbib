<script>
  import Scanner from "./Scanner.svelte";
  import Medium from "./Medium.svelte";
  import { db, print, medien, configData } from "./../stores.js";
  import { group_by, sql } from "./../helpers.js";
  import * as notifier from "./../notifier.js";

  function update() {
    $medien = $db
      .prepare(
        sql`
      SELECT m.id AS medien_id,
      m.name AS medien_name, m.beleg_filter,
      x.id AS exemplar_id,
      x.barcode, x.memo,
      a.id AS verliehen, a.jahr AS ausleih_jahr,
      s.name, s.vorname, s.klasse, s.jahr, s.id AS schueler_id
      FROM medienbezeichnung AS m
      LEFT JOIN medienexemplar AS x ON x.medienbezeichnung_id = m.id
      LEFT JOIN ausleihe AS a ON a.medienexemplar_id = x.id
      LEFT JOIN schueler AS s ON s.id = a.schueler_id
      ORDER BY medien_name DESC
    `
      )
      .all();
  }
  function rueckgabe(exemplar) {
    console.log(exemplar);
    const res = $db
      .prepare(
        sql`
      DELETE FROM ausleihe WHERE id = ?
    `
      )
      .run(exemplar.ausleihe_id);
    if (res) {
      notifier.rueckgabe(exemplar.name, exemplar.barcode);
    }
  }
  function zuordnung(barcode) {
    if (!modal) throw "Barcode unbekannt";
    const res = $db
      .prepare(
        sql`
      INSERT INTO medienexemplar (barcode, medienbezeichnung_id) VALUES (?,?)
    `
      )
      .run(barcode, medien_filter[selected][0].medien_id);
    console.log(res);
    if (res) {
      update();
      notifier.zuordnung(medien_filter[selected][0].medien_name, barcode);
    }
  }
  function neu_anlegen() {
    if (!suche) return
    try {
    const res = $db
      .prepare(
        sql`
      INSERT INTO medienbezeichnung (name) VALUES (?)
    `
      )
      .run(suche.trim());
      update()
    } catch (e) {
      console.log("Fehler beim Anlegen eines neuen Titels: ", e)
    }
  }
  let selected,
    suche = "",
    modal

  update();

  const sort_by_medien_name = (a, b) =>
    a[1][0].medien_name.toUpperCase() < b[1][0].medien_name.toUpperCase()
      ? -1
      : 1;

  $: medien_filter = group_by(
    $medien.filter(
      (m) =>
        m.medien_name.toLowerCase().includes(suche.toLowerCase()) ||
        (m.barcode && m.barcode.toLowerCase().includes(suche.toLowerCase()))
    ),
    "medien_id"
  );
  $: Object.keys(medien_filter).length === 1 &&
    (selected = Object.keys(medien_filter)[0]);
  const scaninterface = { update, rueckgabe, zuordnung };
</script>

{#if !$print}
  <Scanner {scaninterface} />
{/if}
<h2 class="title">Verfügbare Medien</h2>
<div class="field has-addons">
  <div class="control">
    <input class="input" style="width: 30rem" type="text" placeholder="Medium neu anlegen oder suche nach Titel/Barcode" bind:value={suche} />
  </div>
  {#if !Object.keys(medien_filter).length && suche}
  <div class="control">
    <button class="button is-info" on:click={neu_anlegen}>
      Anlegen
    </button>
  </div>
  {/if}
</div>
{#if Object.keys(medien_filter).length}
  <table class="table">
    <thead>
      <tr>
        <th>Titel</th>
        <th>V/G</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(medien_filter).sort(sort_by_medien_name) as [n, m], i}
        <tr
          class="pointer"
          on:click={(_) => (modal = true)}
          on:mouseover:focus={() => (selected = n)}>
          <td>
            {#if $configData.kontoauszug_beleg && $configData.kontoauszug_beleg_filter && m[0].beleg_filter}<span class="has-text-success">✔︎</span>{/if} {m[0].medien_name}</td>
          <td>
            {m.filter((i) => i.verliehen).length}/{m.filter((i) => i.exemplar_id).length}
          </td>
          <td />
        </tr>
      {/each}
    </tbody>
  </table>
{:else if suche} Dieser Titel existiert noch nicht.
{:else} – Bibliothek? Es sind noch keine Medien eingetragen –
{/if}
{#if modal}
  <Medium medium={medien_filter[selected]} bind:modal {update} />
{/if}
