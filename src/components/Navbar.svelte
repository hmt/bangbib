<script>
  import Autocomplete from "./Autocomplete.svelte";
  import Medien from "./Medien.svelte";
  import Nutzer from "./Nutzer.svelte"
  import Kurs from "./Kurs.svelte";
  import Schueler from "./Schueler.svelte";
  import Einstellungen from "./Einstellungen.svelte";
  import { view, print, scan_status } from "./../stores.js";

  const print_allowed = [Medien, Schueler, Kurs];
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
    <Autocomplete />
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
        <i class="mdi" on:click={() => ($print = $view)}>print</i>
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
