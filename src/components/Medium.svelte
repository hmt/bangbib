<script>
  import { db, view } from "./../stores.js";
  import Schueler from "./Schueler.svelte";
  import { sql } from "./../helpers.js";
  import { get_schueler } from "./../getter.js";
  export let medium = [];
  export let modal;
  export let update;
  let suche = "";
  let yes;
  $: medien_filter = medium.filter(
    (m) => m.barcode && m.barcode.toLowerCase().includes(suche.toLowerCase())
  );
  const edit = (_) => {
    const m = medium[0];
    const res = $db
      .prepare(
        sql`
      UPDATE medienbezeichnung SET name=? WHERE id = ?
    `
      )
      .run(m.medien_name, m.medien_id);
    if (res) update();
    else console.log("Es gab einen Fehler beim Ändern der Medienbezeichnung");
  };
  const remove_medium = (_) => {
    const res = $db
      .prepare(
        sql`
      DELETE FROM medienbezeichnung WHERE id = ?
    `
      )
      .run(medium[0].medien_id);
    if (res) {
      update();
      modal = false;
    } else console.log("Es gab einen Fehler beim Löschen des Mediums");
  };
  const remove_exemplar = (e) => {
    const res = $db
      .prepare(
        sql`
      DELETE FROM medienexemplar WHERE id = ?
    `
      )
      .run(e.exemplar_id);
    if (res) update();
    else console.log("Es gab einen Fehler beim Löschen des Exemplars");
  };
  const schueler_action = (s) => {
    if (s.verliehen) {
      get_schueler({ id: s.schueler_id });
      $view = Schueler;
    }
  };
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (modal = false)} />
<div class="modal" class:is-active={modal}>
  <div class="modal-background" on:click={() => (modal = false)} />
  <button
    class="modal-close is-large"
    aria-label="close"
    on:click={() => (modal = false)} />
  <div class="modal-content">
    <div class="box">
      <label class="label" for="titel_aendern">Titel bearbeiten</label>
      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            id="titel_aendern"
            class="input"
            type="text"
            bind:value={medium[0].medien_name}
            on:keydown={(e) => e.key === 'Enter' && edit()} />
        </div>
        <div class="control">
          <button class="button is-primary" on:click={() => edit()}>
            Speichern
          </button>
        </div>
      </div>
      {#if yes}
        <button
          class="button is-small is-fullwidth is-danger"
          on:click={() => remove_medium()}>
          Medium löschen
        </button>
      {:else}
        <div class="field">
          <label class="checkbox is-danger">
            <input type="checkbox" bind:checked={yes} />
            Entfernen aktivieren. Alle Exemplare und Leihgaben dieses Mediums
            werden gelöscht.
          </label>
        </div>
      {/if}
      <hr />
      Füge neue Exemplare durch einscannen neuer Barcodes diesem Titel hinzu.
      Bereits vergebene Barcodes müssen erst gelöscht werden.
      <div class="field">
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder="Filter"
            bind:value={suche} />
        </div>
      </div>
      <table class="table is-striped is-hoverable" width="100%">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Schüler</th>
            <th align="center">Klasse</th>
            <th align="center">Jahr</th>
            <th align="center">Löschen</th>
          </tr>
        </thead>
        <tbody>
          {#each medien_filter.sort((a, b) => a.barcode - b.barcode) as e}
            <tr>
              <td>{e.barcode}</td>
              {#if e.verliehen}
                <td style="cursor:pointer" on:click={() => schueler_action(e)}>
                  {e.name}, {e.vorname}
                </td>
                  {#if e.klasse}
                    <td align="center">{e.klasse}</td>
                  {:else}
                    <td align="center"><span class="icon">
                      <i
                      class="mdi"
                      alt="Sonstiger Nutzer">
                      face
                      </i>
                    </span></td>
                  {/if}
                  {#if e.jahr}
                    <td align="center">{e.jahr}</td>
                  {:else}
                    <td align="center"><span>{e.ausleih_jahr}</span></td>
                  {/if}
              {:else}
                <td colspan="3" />
              {/if}
              <td align="center">
                <span class="icon has-text-danger pointer">
                  <i
                    class="mdi"
                    alt="Exemplar löschen"
                    on:click={() => remove_exemplar(e)}>
                    delete_forever
                  </i>
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
