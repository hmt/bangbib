<script>
  import { print } from "./../stores.js";
  import { db_check } from "./../database.js";
  import Main from "./Main.svelte";
  import Print from "./Print.svelte";

  const connected = db_check();
</script>

<style>
  @import "../node_modules/bulma/css/bulma.css";
</style>

{#if connected}
  {#if $print}
    <Print />
  {:else}
    <Main />
  {/if}
{:else}
  <br />
  bangbib konnte nicht gestartet werden. Nicht gut. Datenbank ok?
{/if}
