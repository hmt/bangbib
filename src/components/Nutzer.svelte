<script>
  import Schueler from "./Schueler.svelte";
  import { view, db, print } from "./../stores.js";
  import { group_by } from "./../helpers.js";
  import { get_schueler } from "./../getter.js";

  let active;
  let klasse;
  function ausleiher() {
    const res = $db
      .prepare(
        `
      SELECT DISTINCT s.name, s.vorname, s.klasse, s.id
      FROM ausleihe AS a
      LEFT JOIN medienexemplar AS x ON (x.id = a.medienexemplar_id)
      LEFT JOIN medienbezeichnung AS m ON (m.id = x.medienbezeichnung_id)
      LEFT JOIN schueler AS s ON (s.id = a.schueler_id)
    `
      )
      .all();
    active = 1;
    return group_by(res, "klasse");
  }
  function ausleiher_vorjahr() {
    const res = $db
      .prepare(
        `
      SELECT DISTINCT s.name, s.vorname, s.klasse, s.id
      FROM ausleihe AS a
      LEFT JOIN medienexemplar AS x ON (x.id = a.medienexemplar_id)
      LEFT JOIN medienbezeichnung AS m ON (m.id = x.medienbezeichnung_id)
      LEFT JOIN schueler AS s ON (s.id = a.schueler_id)
      WHERE a.jahr != s.jahr
    `
      )
      .all();
    active = 2;
    return group_by(res, "klasse");
  }
  function nutzer_gesperrt() {
    const res = $db
      .prepare(
        `
      SELECT s.name, s.vorname, s.id, s.klasse
      FROM schueler AS s
      WHERE s.gesperrt = 1;
    `
      )
      .all();
    active = 3;
    return group_by(res, "klasse");
  }
  function sonstige_nutzer() {
    const res = $db
      .prepare(
        `
      SELECT s.name, s.vorname, s.memo, s.id, s.klasse
      FROM schueler AS s
      WHERE s.nichtschueler = 1;
    `
      )
      .all();
    active = 4;
    return group_by(res, "nichtschueler");
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div class="tabs is-boxed">
  <ul>
    <li class:is-active={active === 1} on:click={_ => (klasse = ausleiher())}>
      <a>
        <span>Nutzer mit Ausleihe</span>
      </a>
    </li>
    <li
      class:is-active={active === 2}
      on:click={_ => (klasse = ausleiher_vorjahr())}>
      <a>
        <span>Nutzer mit Ausleihe aus Vorjahren</span>
      </a>
    </li>
    <li
      class:is-active={active === 3}
      on:click={_ => (klasse = nutzer_gesperrt())}>
      <a>
        <span>Gesperrte Nutzer</span>
      </a>
    </li>
    <li
      class:is-active={active === 4}
      on:click={_ => (klasse = sonstige_nutzer())}>
      <a>
        <span>Sonstige Nutzer</span>
      </a>
    </li>
  </ul>
</div>
{#if klasse}
  <div class="box">
    {#each Object.entries(klasse) as [k, schueler]}
      <h2 class="title">{k && k != "null" && k != "undefined" ? k : "Sonstige"}</h2>
      <table class="table">
        <thead>
          <tr>
            <th />
            <th>Name</th>
            <th>Vorame</th>
            <th>Bemerkung</th>
          </tr>
        </thead>
        <tbody>
          {#each schueler as s, i}
            <tr
              class="pointer"
              on:click={_ => {
                get_schueler({ id: s.id });
                $view = Schueler;
              }}>
              <td>{i + 1}</td>
              <td>{s.name}</td>
              <td>{s.vorname}</td>
              <td>{s.memo}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else} – Keine Nutzer eingetragen bisher –
    {/each}
  </div>
{/if}
