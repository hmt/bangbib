<script>
  import Medien from "./Medien.svelte";
  import Scanner from "./Scanner.svelte";
  import * as notifier from './../notifier.js'
  import { view, schueler, db, medien, print } from './../stores.js';
  function update () {
    $medien = $db.prepare(`
      SELECT a.*, x.*, m.*, a.id AS ausleihe_id
      FROM ausleihe as a
      LEFT JOIN medienexemplar AS x ON (x.id = a.medienexemplar_id)
      LEFT JOIN medienbezeichnung AS m ON (m.id = x.medienbezeichnung_id)
      WHERE a.schueler_id = ?`
    ).all($schueler[0].id) || []
  }

  function rueckgabe (exemplar) {
    const res = $db.prepare(`
      DELETE FROM ausleihe WHERE id = ?
    `).run(exemplar.ausleihe_id)
    if (res) {
      notifier.rueckgabe(exemplar.name, exemplar.barcode)
      if (exemplar.schueler_id !== s.id) ausleihe(exemplar)
    }
    return res
  }

  function ausleihe (exemplar) {
    if (s.gesperrt) throw 'Nutzer gesperrt'
    const data = {
      jahr: s.jahr || new Date().getFullYear(),
      klasse: s.klasse,
      schueler_id: s.id,
      medienexemplar_id: exemplar.x_id,
      kurs: s.kurs
    }
    const res = $db.prepare(`
      INSERT INTO ausleihe
      (jahr, klasse, schueler_id, medienexemplar_id, kurs)
      VALUES (:jahr, :klasse, :schueler_id, :medienexemplar_id, :kurs)
    `).run(data)
    if (res) {
      notifier.ausleihe(exemplar.name, exemplar.barcode)
    }
  }
  function zuordnung () {
    throw 'Verwende Standardzuordnung'
  }
  const scaninterface = {update, rueckgabe, ausleihe, zuordnung}

  $: s = $schueler[0]
  $: s && update()
  let yes

  const remove_schueler = _ => {
    const res = $db.prepare(`
      DELETE FROM schueler WHERE id = ?
    `).run(s.id)
    if (res) { $view = Medien }
  }
  const suspend_schueler = _ => {
    const res = $db.prepare(`
      UPDATE schueler SET gesperrt=? WHERE id = ?
    `).run(s.gesperrt ? 0 : 1, s.id)
    if (res) s.gesperrt = s.gesperrt ? 0 : 1
  }
  const edit_memo = _ => {
    const res = $db.prepare(`
      UPDATE schueler SET memo=? WHERE id = ?
    `).run(s.memo, s.id)
  }
</script>

{#if !$print}
  <Scanner {scaninterface} />
{/if}
<h2 class="title">{s.name}, {s.vorname}</h2>
<h2 class="sub-title">{s.klasse || 'Sonstiger Nutzer'}</h2>
<div class="field">
  {#if yes}
    <button class="button is-danger" on:click={()=>remove_schueler()}>Nutzer aus Datenbank löschen</button>
  {:else}
    <label class="checkbox is-danger">
    <input type="checkbox" bind:checked={yes}> Löschen aktivieren. Der Nutzer und alle Leihgaben können aus der Datenbank gelöscht werden.</label>
  {/if}
</div>
<div class="field">
  <button class="button" class:is-warning={s.gesperrt} class:is-success={!s.gesperrt} on:click={()=>suspend_schueler()}>Nutzer {s.gesperrt ? 'ent':''}sperren</button>
</div>
<div class="field">
  <div class="control">
  <label class="label">
    Memo
      <input
      class="input"
      type="text"
      bind:value={s.memo}
      on:keydown={e => e.key === 'Enter' && edit_memo()} />
    </label>
  </div>
</div>

{#if $medien.length}
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Titel</th>
        <th>Barcode</th>
        <th>Jahr</th>
        <th>Rückgabe</th>
      </tr>
    </thead>
    <tbody>
      {#each $medien as m,i}
        <tr>
          <td>{i+1}</td>
          <td>{m.name}</td>
          <td>{m.barcode}</td>
          <td>{m.jahr}</td>
          <td align="center">
            <span class="icon has-text-info pointer">
              <i
                class="mdi"
                alt="Exemplar löschen"
                on:click={() => rueckgabe(m) && update()}>
                arrow_back
              </i>
            </span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else} – Keine Medien geliehen –
{/if}