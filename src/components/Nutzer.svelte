<script>
  import Schueler from "./Schueler.svelte";
  import { db } from "./../stores.js";
  import { group_by, sql } from "./../helpers.js";
  import { get_schueler } from "./../getter.js";

  let active;
  let klasse;
  let modal;
  function ausleiher() {
    const res = $db
      .prepare(
        sql`
      SELECT s.name, s.vorname, s.klasse, s.id, m.name as titel
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
        sql`
      SELECT s.name, s.vorname, s.klasse, s.id, m.name as titel
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
  function schueler() {
    const res = $db
      .prepare(
        sql`
      SELECT s.name, s.vorname, s.id, s.klasse
      FROM schueler AS s
    `
      )
      .all();
    active = 5;
    return group_by(res, "klasse");
  }
  function nutzer_gesperrt() {
    const res = $db
      .prepare(
        sql`
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
        sql`
      SELECT s.name, s.vorname, s.memo, s.id, s.klasse
      FROM schueler AS s
      WHERE s.nichtschueler = 1;
    `
      )
      .all();
    active = 4;
    return group_by(res, "nichtschueler");
  }
  const zahlen_a = $db
    .prepare(
      sql`
      SELECT
        sum(case when a.jahr != s.jahr then 1 else 0 end) as s,
        count(DISTINCT s.id) as a
      FROM ausleihe AS a
      LEFT JOIN schueler AS s ON (s.id = a.schueler_id)
    `
    )
    .get();
  const zahlen = $db
    .prepare(
      sql`
    SELECT
      Count(*) as a,
      sum(case when nichtschueler = 1 then 0 else 1 end) as sch,
      sum(case when nichtschueler = 1 then 1 else 0 end) as s,
      sum(case when gesperrt = 1 then 1 else 0 end) as g,
      sum(case when gesperrt = 1 then 1 else 0 end) as g
    FROM schueler
    `
    )
    .get();

  const sort_by_name = (a, b) =>
    a[1][0].name.toUpperCase() < b[1][0].name.toUpperCase() ? -1 : 1;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div class="tabs is-boxed">
  <ul>
    <li class:is-active={active === 5} on:click={(_) => (klasse = schueler())}>
      <a>
        <span class="tag is-primary">{zahlen.sch || 0}</span>
        &nbsp;
        <span>Schüler nach Gruppe</span>
      </a>
    </li>
    <li class:is-active={active === 1} on:click={(_) => (klasse = ausleiher())}>
      <a>
        <span class="tag is-primary">{zahlen_a.a || 0}</span>
        &nbsp;
        <span>Nutzer mit Ausleihe</span>
      </a>
    </li>
    <li
      class:is-active={active === 2}
      on:click={(_) => (klasse = ausleiher_vorjahr())}>
      <a>
        <span class="tag is-{zahlen_a.s < 1 ? 'primary' : 'danger'}">
          {zahlen_a.s || 0}
        </span>
        &nbsp;
        <span>Nutzer mit Ausleihe aus Vorjahren</span>
      </a>
    </li>
    <li
      class:is-active={active === 3}
      on:click={(_) => (klasse = nutzer_gesperrt())}>
      <a>
        <span class="tag is-{zahlen_a.g < 1 ? 'primary' : 'danger'}">
          {zahlen.g || 0}
        </span>
        &nbsp;
        <span>Gesperrte Nutzer</span>
      </a>
    </li>
    <li
      class:is-active={active === 4}
      on:click={(_) => (klasse = sonstige_nutzer())}>
      <a>
        <span class="tag is-primary">{zahlen.s || 0}</span>
        &nbsp;
        <span>Sonstige Nutzer</span>
      </a>
    </li>
  </ul>
</div>
{#if klasse}
  <div class="box">
    {#each Object.entries(klasse) as [k, schueler]}
      <h3 class="title is-5 mt-1 mb-1">
        {k && k != 'null' && k != 'undefined' ? k : 'Sonstige'}
      </h3>
      <div class="mb-2">
        {#each Object.entries(group_by(schueler, 'id')).sort(sort_by_name) as [id, s], i}
          <span
            class="pointer"
            on:click={(_) => {
              get_schueler({ id });
              modal = true
            }}>
            <b>{s[0].name}, {s[0].vorname} {s[0].memo ? s[0].memo : ''}</b>
          </span>
          {#if s[0].titel}
            <ul class="circle">
              {#each s as ss}
                <li>{ss.titel || ''}</li>
              {/each}
            </ul>
          {/if}
          <br>
        {/each}
      </div>
    {:else}– Keine Nutzer eingetragen bisher –{/each}
  </div>
{/if}
{#if modal}
  <div class="modal" class:is-active={modal}>
    <div class="modal-background" on:click={() => (modal = false)} />
    <button
      class="modal-close is-large"
      aria-label="close"
      on:click={() => (modal = false)}
    />
    <div class="modal-content">
      <div class="box">
        <Schueler />
      </div>
    </div>
  </div>
{/if}

<style>
  .circle { list-style: square; list-style-position: inside; }
</style>