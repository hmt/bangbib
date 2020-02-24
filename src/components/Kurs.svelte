<script>
  import Scanner from "./Scanner.svelte";
  import { schueler, view, db, medien, titel, print } from "./../stores.js";
  import * as notifier from "./../notifier.js";
  import { DontBubbleException } from "./../exceptions.js";

  function update() {
    cur_schueler = iterator.next();
    if (cur_schueler.done) {
      notifier.fertig("Kurs vollständig versorgt");
      $print = $view;
    } else if (cur_schueler.value.gesperrt) {
      console.log('Schüler gesperrt; nächster…')
      update()
    }
  }

  function zuordnung(barcode) {
    if (!id) throw "Noch kein Titel festgelegt";
    const res = $db
      .prepare(
        `
      INSERT INTO medienexemplar (barcode, medienbezeichnung_id) VALUES (?,?)
    `
      )
      .run(barcode, id);
    if (res) {
      notifier.zuordnung($titel, barcode);
      ausleihe({ x_id: res.lastInsertRowid, barcode, m_id: id });
    }
  }

  function rueckgabe(exemplar) {
    const check = Object.values($medien).find(b => b === exemplar.barcode);
    if (check) {
      notifier.fehler("Kursbuchlöschung");
      throw new DontBubbleException();
    }
    const res = $db
      .prepare(
        `
      DELETE FROM ausleihe WHERE id = ?
    `
      )
      .run(exemplar.ausleihe_id);
    if (res) {
      notifier.rueckgabe(exemplar.name, exemplar.barcode);
      ausleihe(exemplar);
    }
  }

  function ausleihe(exemplar) {
    if (!check_referenz(exemplar)) throw new DontBubbleException();
    const s = cur_schueler.value;
    const data = {
      jahr: s.jahr,
      klasse: s.klasse,
      schueler_id: s.id,
      medienexemplar_id: exemplar.x_id,
      kurs: s.kurs
    };
    const res = $db
      .prepare(
        `
      INSERT INTO ausleihe
      (jahr, klasse, schueler_id, medienexemplar_id, kurs)
      VALUES (:jahr, :klasse, :schueler_id, :medienexemplar_id, :kurs)
    `
      )
      .run(data);
    if (res) {
      $medien[s.id] = exemplar.barcode;
      notifier.ausleihe(exemplar.name, exemplar.barcode);
    }
  }

  let id,
    cur_schueler = {};
  let iterator = $schueler[Symbol.iterator]();
  const scaninterface = { update, rueckgabe, ausleihe, zuordnung };

  $: if ($schueler) {
    console.log("Neue Schülergruppe");
    $titel = null;
    $medien = {};
    iterator = $schueler[Symbol.iterator]();
    update();
  }

  function check_referenz(e) {
    if (!$titel) {
      $titel = e.name;
      id = e.m_id;
    } else if (id !== e.m_id) {
      notifier.fehler(`Falscher Titel: ${e.name}`, e.barcode);
      return false;
    }
    return true;
  }
</script>

{#if !$print}
  <Scanner {scaninterface} />
{/if}
<h2 class="subtitle">
  {$schueler[0].klasse} – {$schueler[0].kurs} - {$schueler[0].kurs_lehrer}
</h2>
<h2 class="subtitle">
  {$titel || 'Lege einen Titel fest durch Scannen des ersten Buches'}
</h2>
<table class="table">
  <thead>
    <tr>
      <th />
      <th>Name</th>
      <th>Vorame</th>
      <th>Barcode</th>
    </tr>
  </thead>
  <tbody>
    {#each $schueler as s, i}
      <tr>
        <td>{i + 1}</td>
        <td>{s.name}</td>
        <td>{s.vorname}</td>
        <td class:has-text-danger={s.gesperrt}>{s.gesperrt ? '– gesperrt –':''}{$medien[s.id] || ''}</td>
      </tr>
    {/each}
  </tbody>
</table>
