<script>
  import Scanner from "./Scanner.svelte";
  import Medium from "./Medium.svelte";
  import Schueler from "./Schueler.svelte";
  import { view, db, print, medien } from "./../stores.js";
  import { group_by } from "./../helpers.js";
  import * as notifier from "./../notifier.js";
  import { get_schueler } from "./../getter.js";

  function update() {
    $medien = $db
      .prepare(
        `
      SELECT m.id AS medien_id,
      m.name AS medien_name,
      x.id AS exemplar_id,
      x.barcode,
      a.id AS verliehen,
      s.name, s.vorname, s.klasse, s.jahr, s.id AS schueler_id
      FROM medienbezeichnung AS m
      LEFT JOIN medienexemplar AS x ON x.medienbezeichnung_id = m.id
      LEFT JOIN ausleihe AS a ON a.medienexemplar_id = x.id
      LEFT JOIN schueler AS s ON s.id = a.schueler_id
    `
      )
      .all();
  }
  function rueckgabe(exemplar) {
    console.log(exemplar);
    const res = $db
      .prepare(
        `
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
        `
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
  let selected,
    suche = "",
    modal,
    neuer_titel = "",
    add = false;

  const add_medienbezeichnung = _ => {
    const res = $db
      .prepare(
        `
      INSERT INTO medienbezeichnung (name) VALUES (?)
    `
      )
      .run(neuer_titel);
    neuer_titel = "";
    add = false;
    update();
  };
  const schueler_action = s => {
    if (s.verliehen) {
      get_schueler({ id: s.schueler_id });
      $view = Schueler;
    }
  };
  const focus = node => node.focus();
  update();
  $: medien_filter = group_by(
    $medien.filter(
      m =>
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
<div class="field">
  <div class="control">
    <input class="input" type="text" placeholder="Filter" bind:value={suche} />
  </div>
</div>
<div class="columns">
  <div class="column">
    <button
      class="button is-fullwidth is-primary"
      on:click={() => (add = true)}>
      Medium hinzufügen
    </button>
    {#if add}
      <div class="field">
        <label class="label">Medien-Titel</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={neuer_titel}
            use:focus
            on:keydown={e => e.key === 'Enter' && add_medienbezeichnung()} />
        </div>
      </div>
    {/if}
    {#if Object.keys(medien_filter).length}
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titel</th>
            <th>V/G</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(medien_filter) as [n, m], i}
            <tr
              class="pointer"
              on:click={_=> modal = true}
              on:mouseover={() => (selected = n)}>
              <td>{m[0].medien_id}</td>
              <td>{m[0].medien_name}</td>
              <td>
                {m.filter(i => i.verliehen).length}/{m.filter(i => i.exemplar_id).length}
              </td>
              <td />
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}– Bibliothek? Es sind noch keine Medien eingetragen –
    {/if}
  </div>
  <div class="column" style="height:90vh; position: sticky; top: .2rem;">
    {#if selected && Object.keys(medien_filter).length && medien_filter[selected]}
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            {medien_filter[selected][0].medien_name}
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            {#if medien_filter[selected].filter(i => i.exemplar_id).length}
              <table class="table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Schüler</th>
                    <th>Klasse</th>
                    <th>Jahr</th>
                  </tr>
                </thead>
                <tbody>
                  {#each medien_filter[selected].sort((a, b) => b.jahr - a.jahr) as s}
                    <tr
                      class="pointer"
                      class:has-background-success={medien_filter[selected].length === 1 && s.barcode && s.barcode.toLowerCase() === suche.toLowerCase()}
                      on:click={() => schueler_action(s)}>
                      <td>{s.barcode}</td>
                      {#if s.verliehen}
                        <td>{s.name}, {s.vorname}</td>
                        <td>{s.klasse || '–'}</td>
                        <td>{s.jahr || '–'}</td>
                      {:else}
                        <td colspan="4" />
                      {/if}
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}Noch keine Exemplare vorhanden{/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
{#if modal}
  <Medium medium={medien_filter[selected]} bind:modal {update} />
{/if}
