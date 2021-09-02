<script>
  import Autocomplete from "./Autocomplete.svelte";
  import Medien from "./Medien.svelte";
  import Scanner from "./Scanner.svelte";
  import * as notifier from "./../notifier.js";
  import { sql } from "./../helpers.js";
  import { view, schueler, db, medien, print, configData } from "./../stores.js";

  function update() {
    $medien =
      $db
        .prepare(
          sql`
      SELECT a.*, x.*, m.*, a.id AS ausleihe_id
      FROM ausleihe as a
      LEFT JOIN medienexemplar AS x ON (x.id = a.medienexemplar_id)
      LEFT JOIN medienbezeichnung AS m ON (m.id = x.medienbezeichnung_id)
      WHERE a.schueler_id = ?`
        )
        .all($schueler[0].id) || [];
  }

  function rueckgabe(exemplar) {
    const res = $db
      .prepare(
        sql`
      DELETE FROM ausleihe WHERE id = ?
    `
      )
      .run(exemplar.ausleihe_id);
    if (res) {
      notifier.rueckgabe(exemplar.name, exemplar.barcode);
      if (exemplar.schueler_id !== s.id) ausleihe(exemplar);
    }
    return res;
  }

  function ausleihe(exemplar) {
    if (s.gesperrt) throw "Nutzer gesperrt";
    const data = {
      jahr: s.jahr || new Date().getFullYear(),
      klasse: s.klasse,
      schueler_id: s.id,
      medienexemplar_id: exemplar.x_id,
      kurs: s.kurs,
    };
    const res = $db
      .prepare(
        sql`
      INSERT INTO ausleihe
      (jahr, klasse, schueler_id, medienexemplar_id, kurs)
      VALUES (:jahr, :klasse, :schueler_id, :medienexemplar_id, :kurs)
    `
      )
      .run(data);
    if (res) {
      notifier.ausleihe(exemplar.name, exemplar.barcode);
    }
  }
  function zuordnung() {
    throw "Verwende Standardzuordnung";
  }
  const scaninterface = { update, rueckgabe, ausleihe, zuordnung };

  $: s = $schueler[0];
  $: s && update();
  let remove;
  let memo;
  let migrate;
  let result;

  const search = term => $db
    .prepare(
      sql`SELECT *
      FROM schueler
      WHERE vorname || ' ' || name LIKE $term
      OR name || ', ' || vorname LIKE $term`
    )
    .all({term: "%"+ term + "%"})
    .map(s => ({ id: s.id, info: `${s.name}, ${s.vorname}`, schueler: true }))

  const remove_schueler = (_) => {
    const res = $db
      .prepare(
        sql`
      DELETE FROM schueler WHERE id = ?
    `
      )
      .run(s.id);
    if (res) {
      $view = Medien;
    }
  };
  const suspend_schueler = (_) => {
    const res = $db
      .prepare(
        sql`
      UPDATE schueler SET gesperrt=? WHERE id = ?
    `
      )
      .run(s.gesperrt ? 0 : 1, s.id);
    if (res) s.gesperrt = s.gesperrt ? false : true;
  };
  const edit_memo = (_) => {
    const res = $db
      .prepare(
        sql`
      UPDATE schueler SET memo=? WHERE id = ?
    `
      )
      .run(s.memo, s.id);
  };
  const edit_exemplar = (e) => {
    const res = $db
      .prepare(
        sql`
      UPDATE medienexemplar SET memo=? WHERE id = ?
    `
      )
      .run(e.memo, e.medienexemplar_id);
    if (res) update();
    else console.log("Es gab einen Fehler beim Eintragen der Memo");
    memo = undefined;
  };
  const migrate_schueler = _ => {
    const res = $db
      .prepare(
        sql`
      UPDATE ausleihe SET schueler_id=? WHERE schueler_id = ?
    `
      )
      .run(result.id, s.id);
    notifier.fertig(`${s.name}, ${s.vorname} wurde erfolgreich migriert.`)
    result = undefined
    migrate = false
    remove_schueler()
  }
</script>

{#if !$print}
  <Scanner {scaninterface} />
{/if}
<h2 class="title">{s.name}, {s.vorname}</h2>
<h2 class="sub-title">{s.klasse || "Sonstiger Nutzer"}, ID: {s.schild_id}</h2>
<div class="field">
    <button class="button is-danger" on:click={_=>remove=true}
      >Nutzer löschen …</button
    >
  <button
    class="button"
    class:is-warning={s.gesperrt}
    class:is-success={!s.gesperrt}
    on:click={() => suspend_schueler()}
    >Nutzer {s.gesperrt ? "ent" : ""}sperren</button
  >
  <button
    class="button is-success"
    on:click={() => migrate = true}
    >Nutzer migrieren …</button
  >
</div>
<div class="field">
  <div class="control">
    <label class="label">
      Memo
      <input
        class="input"
        type="text"
        bind:value={s.memo}
        on:keydown={(e) => e.key === "Enter" && edit_memo()}
      />
    </label>
  </div>
</div>

{#if $medien.length}
  <table class="table">
    <thead>
      <tr>
        <th />
        <th>Titel</th>
        <th>Barcode</th>
        <th>Jahr</th>
        <th>Rückgabe</th>
        <th>Memo</th>
      </tr>
    </thead>
    <tbody>
      {#each $medien as m, i}
        <tr>
          <td>{i + 1}</td>
          <td>{#if $configData.kontoauszug_beleg && $configData.kontoauszug_beleg_filter && m.beleg_filter}<span class="has-text-success">✔︎</span>{/if} {m.name}</td>
          <td>{m.barcode}</td>
          <td>{m.jahr}</td>
          <td align="center">
            <span class="icon has-text-info pointer">
              <i
                class="mdi"
                alt="Exemplar löschen"
                on:click={() => rueckgabe(m) && update()}
              >
                arrow_back
              </i>
            </span>
          </td>
          <td>
            {#if memo === i}
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  bind:value={m.memo}
                  on:keydown={(event) =>
                    event.key === "Enter" && edit_exemplar(m)}
                />
              </div>
              <div class="control">
                <button
                  class="button is-primary"
                  on:click={(_) => edit_exemplar(m)}
                >
                  Speichern
                </button>
              </div>
            </div>
            {:else}
            <span style="cursor:pointer" on:click={_=>memo = i}>✎ {m.memo || ''}</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  – Keine Medien geliehen –
{/if}
{#if migrate}
<div class="modal" class:is-active={migrate}>
  <div class="modal-background" on:click={() => (migrate = false)} ></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Nutzerkonto migrieren</p>
      <button class="delete" aria-label="close" on:click={() => (migrate = false)}></button>
    </header>
    <section class="modal-card-body" style="padding-bottom: 12rem">
      <div class="field">
        Wähle einen Nutzer aus, zu dem alle Ausleihen migriert werden.
        <Autocomplete {search} bind:result={result} placeholder="Nutzer suchen"></Autocomplete>
      </div>
      {#if result}
      <div class=block>
        <b>{result.info}</b> für die Migration ausgewählt.
        <br>Achtung, bei erfolgreicher Migration wird der alte Nutzer gelöscht.
      </div>
      {/if}
    </section>
    <footer class="modal-card-foot">
      <button class="button is-success" on:click={migrate_schueler}>Migrieren</button>
      <button class="button" on:click={_=>migrate=false}>Abbrechen</button>
    </footer>
  </div>
</div>
{/if}
{#if remove}
<div class="modal" class:is-active={remove}>
  <div class="modal-background" on:click={() => (remove = false)} ></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Nutzerkonto löschen</p>
      <button class="delete" aria-label="close" on:click={() => (remove = false)}></button>
    </header>
    <section class="modal-card-body">
      <div class="field">
        Achtung, alle mit diesem Nutzer verbundenen Daten werden gelöscht, ausgeliehene Medien werden automatisch zurückgegeben.
      </div>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-danger" on:click={remove_schueler}>Löschen</button>
      <button class="button" on:click={_=>remove=false}>Abbrechen</button>
    </footer>
  </div>
</div>
{/if}