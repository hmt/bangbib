<script>
  import Autocomplete from "./Autocomplete.svelte";
  import Medien from "./Medien.svelte";
  import Nutzer from "./Nutzer.svelte"
  import Kurs from "./Kurs.svelte";
  import Schueler from "./Schueler.svelte";
  import Einstellungen from "./Einstellungen.svelte";
  import { view, print, scan_status, db } from "./../stores.js";

  import { get_kurs, get_schueler } from './../getter.js';
  import { sql } from "./../helpers.js";

  let result

  const print_allowed = [Medien, Schueler, Kurs];

  const search = term => {
    const schueler = $db
      .prepare(
        sql`SELECT *
        FROM schueler
        WHERE vorname || ' ' || name LIKE $term
        OR name || ', ' || vorname LIKE $term`
      )
      .all({term: "%"+ term + "%"});
    const kurse = $db
      .prepare(
        sql`SELECT DISTINCT k.kurs, s.klasse, s.jahr
        FROM kurszugehoerigkeit AS k
        JOIN schueler AS s ON (s.schild_id = k.schild_id)
        WHERE kurs LIKE $term OR klasse LIKE $term`
      )
      .all({term: term + "%"});
    const res_s = schueler.map(s => {
      return { id: s.id, info: `${s.name}, ${s.vorname}`, schueler: true };
    });
    const res_k = kurse.map(k => {
      return {
        id: k.kurs,
        info: `${k.kurs} – ${k.klasse}`,
        klasse: k.klasse,
        jahr: k.jahr
      };
    });
    return res_k.concat(res_s);
  }

  function show_selected(item) {
    // hole Schüler
    if (item.schueler) {
      get_schueler(item);
      $view = Schueler;
    }
    // hole Kurs
    else {
      get_kurs(item);
      $view = Kurs;
    }
  }

  $: if (result) show_selected(result)
</script>

<style>
  .brand {
    text-transform: uppercase;
    padding-right: 10px;
    cursor: pointer;
  }
  .button {
    margin-right: 0.4rem;
    margin-left: 0.4rem;
  }
</style>

<nav class="navbar is-link">
  <div class="navbar-item">
    <div
      class="has-text-white-ter brand is-size-7"
      on:click={() => ($view = Medien)}>
      <b>Bangbib</b>
    </div>
    <Autocomplete placeholder="Suche in Nutzer und Gruppen" bind:result={result} {search}/>
  </div>
  <div class="navbar-item">
    <button class="button is-link">
      <span class="icon">
        <i class="mdi" on:click={() => ($view = Medien)}>book</i>
      </span>
    </button>
  </div>
  <div class="navbar-item">
    <button class="button is-link">
      <span class="icon">
        <i class="mdi" on:click={() => ($view = Nutzer)}>people</i>
      </span>
    </button>
  </div>
  <div class="navbar-item">
    <button class="button is-link" disabled={!print_allowed.includes($view)}>
      <span class="icon">
        <i class="mdi" on:click={() => (print_allowed.includes($view) && ($print = $view))}>print</i>
      </span>
    </button>
  </div>
  <div class="navbar-end">
    <div class="navbar-item">
      <span class="icon is-medium" class:has-background-grey={!$scan_status.rueckgabe} class:has-background-info={$scan_status.rueckgabe}>
        <i class="mdi">arrow_back</i>
      </span>
      <span class="icon is-medium" class:has-background-grey={!$scan_status.ausleihe} class:has-background-warning={$scan_status.ausleihe}>
        <i class="mdi">arrow_forward</i>
      </span>
      <span class="icon is-medium" class:has-background-grey={!$scan_status.zuordnung} class:has-background-success={$scan_status.zuordnung}>
        <i class="mdi">plus_one</i>
      </span>
    </div>
    <div class="navbar-item">
      <button class="button is-link">
        <span class="icon">
          <i class="mdi" on:click={() => ($view = Einstellungen)}>settings</i>
        </span>
      </button>
    </div>
  </div>
</nav>
