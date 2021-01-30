<script>
  import { configData, db, scan_status, view } from "./../stores.js";
  import { DontBubbleException } from './../exceptions.js'
  import { onDestroy } from 'svelte';
  import { focus, sort_by_name, sql } from './../helpers.js';
  import { get_schueler_by_schild_id } from "./../getter.js";
  import Schueler from "./Schueler.svelte";
	onDestroy(() => $scan_status = {})

  export let scaninterface
  const { update, ausleihe, rueckgabe, zuordnung } = scaninterface
  $scan_status = { ausleihe, rueckgabe, zuordnung }

  const prefix_length = $configData.scan_prefix.length;
  let buffer = [],
    barcode,
    barcode_manuell,
    registrieren,
    fehlermeldung,
    lastKeyTime = Date.now(),
    medium,
    neuer_titel = "",
    medium_selected;

  function handle_keydown(event) {
    if (registrieren) {
      (event.key === 'Escape') && (registrieren = false)
      return
    }
    if (event.key === 'Escape') {
      barcode = ''
      barcode_manuell = !barcode_manuell
    }
    if (barcode_manuell) return
    const currentTime = Date.now();
    if (currentTime - lastKeyTime > 1000) buffer = [];
    if (event.key === 'Enter' && !buffer.length) return
    if (
      event.key === "Enter" &&
      buffer.slice(0, prefix_length).join("") === $configData.scan_prefix
    ) {
      barcode = buffer.slice(prefix_length).join("");
      buffer = [];
      scan();
    } else {
      const charList = "abcdefghijklmnopqrstuvwxyz0123456789";
      const key = event.key.toLowerCase();
      if (charList.indexOf(key) === -1) return;
      buffer.push(event.key);
      lastKeyTime = currentTime;
    }
  }

  function scan() {
    if (barcode.startsWith('schild')) {
      const id = barcode.substring('schild'.length)
      console.log('öffne Nutzer: ', id)
      try {
        get_schueler_by_schild_id({ id });
      } catch (e) {
        console.log(`Nutzer mit ID ${id} nicht gefunden`)
      }
      $view = Schueler;
      return
    }
    const res = $db
      .prepare(
        sql`
      SELECT x.barcode, x.id AS x_id, m.name, m.id AS m_id, x.medienbezeichnung_id, a.*, a.id AS ausleihe_id
      FROM medienexemplar x
      LEFT JOIN medienbezeichnung AS m ON (x.medienbezeichnung_id = m.id)
      LEFT JOIN ausleihe AS a ON (a.medienexemplar_id = x.id)
      WHERE barcode = ?
    `
      )
      .get(barcode);
    console.log('Ergebnis Barcodesuche: ', res || '– nichts gefunden –');
    if (!res) {
      try {
        zuordnung(barcode);
      } catch (e) {
        medium = $db.prepare(sql`SELECT * FROM medienbezeichnung`).all();
        registrieren = true
        console.log(e, "Barcode unbekannt; Medium registrieren");
        return
      }
    } else if (res.ausleihe_id) {
      try {
        rueckgabe(res);
      } catch (e) {
        if (e instanceof DontBubbleException) return
      }
    } else {
      try {
        ausleihe(res);
      } catch (e) {
        if (e instanceof DontBubbleException) return
      }
    }
    try {
      update();
    } catch (e) {
      console.log("Ausgeliehene Medien konnten nicht aktualisiert werden");
    }
  }

  function neu_anlegen() {
    if (!neuer_titel.length) return
    try {
    const res = $db
      .prepare(
        sql`
      INSERT INTO medienbezeichnung (name) VALUES (?)
    `
      )
      .run(neuer_titel.trim());
      neuer_titel = ''
      fehlermeldung = null
      zuordnen(res.lastInsertRowid)
    } catch (e) {
      console.log("Fehler beim Anlegen eines neuen Titels: ", e)
      if (e.code = "SQLITE_CONSTRAINT_UNIQUE") {
        fehlermeldung = "Dieser Titel existiert bereits"
      } else fehlermeldung = "Es ist ein Fehler aufgetreten"
    }
  }

  function zuordnen(medien_id) {
    if (!medien_id) return
    const res = $db
      .prepare(
        sql`
      INSERT INTO medienexemplar (barcode, medienbezeichnung_id) VALUES (?,?)
    `
      )
      .run(barcode, medien_id);
    registrieren = false;
    scan()
  }
</script>

<svelte:window on:keydown={handle_keydown} />
{#if barcode_manuell}
  <div class="modal is-active">
    <div class="modal-background" on:click={()=>barcode_manuell=false}/>
    <button class="modal-close is-large" aria-label="close" on:click={()=>barcode_manuell=false}></button>
    <div class="modal-content">
      <div class="box">
        <div class="field">
          <div class="control">
          <label class="label">
            Barcode eingeben
            <input
            class="input"
            type="text"
            bind:value={barcode}
            use:focus
            on:keydown={e => {if (e.key === 'Enter') { barcode_manuell=false; scan()}}} />
          </label>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
{#if registrieren}
  <div class="modal is-active">
    <div class="modal-background" on:click={()=>registrieren=false}/>
    <button class="modal-close is-large" aria-label="close" on:click={()=>registrieren=false}></button>
    <div class="modal-content">
      <div class="box">
        Was machen wir mit dem Barcode?
        <pre>{barcode}</pre>
        <hr />
        {#if medium.length}
          <label class="label" for="auswahl">Das gehört zu</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select bind:value={medium_selected} id="auswahl">
                  <option>– nichts ausgewählt –</option>
                  {#each medium.sort(sort_by_name) as m}
                    <option value={m.id}>{m.name}</option>
                  {/each}
                </select>
              </div>
            </div>
            <div class="control">
              <button
                class="button is-primary"
                on:click={() => zuordnen(medium_selected)}>
                Titel verwenden
              </button>
            </div>
          </div>
        {/if}
        <label class="label" for="neuwahl">Neu anlegen unter</label>
        <div class="field has-addons">
          <div class="control is-expanded">
            <input
              id="neuwahl"
              class="input is-fullwidth" class:is-danger={fehlermeldung}
              type="text"
              bind:value={neuer_titel}
              on:keydown={e => e.key === 'Enter' && neu_anlegen()} />
          </div>
          <div class="control">
            <button
              class="button is-primary"
              on:click={() => neu_anlegen()}>
              Titel anlegen
            </button>
          </div>
        </div>
        {#if fehlermeldung}
          <div class="notification is-danger">
            {fehlermeldung}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}