<script>
  import { print, configData } from "./../stores.js";
  import { db_check } from "./../database.js";
  import Main from "./Main.svelte";
  import Print from "./Print.svelte";
</script>

<style>
  @import "../node_modules/bulma/css/bulma.css";
</style>

{#if $configData}
  {#await db_check()} Öffne Datenbank …
  {:then}
    {#if $print}
      <Print />
    {:else}
      <Main />
    {/if}
  {:catch e}
    <br />
    bangbib konnte nicht gestartet werden. Nicht gut. Datenbank ok?
    <br>Diese Fehlermeldung gab es:
    <pre>{e}</pre>
  {/await}
{/if}