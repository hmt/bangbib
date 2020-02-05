<script>
  import { view } from './../stores.js';
  import Navbar from "./Navbar.svelte";
  import Medien from "./Medien.svelte";
  import Messenger from "./Messenger.svelte";

  $view = $view || Medien
</script>

<div class="grid-container">
  <div class="main">
    <section class="section">
        <div class="columns">
          <div class="column is-three-quarters">
            <svelte:component this={$view}/>
          </div>
          <div class="column is-one-quarter" style="height:90vh; position: sticky; top: .2rem;">
            <Messenger/>
          </div>
        </div>
    </section>
  </div>
  <div class="header">
    <Navbar />
  </div>
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 3.25rem calc(100vh - 3.25rem);
    grid-template-areas: "header header" "main main";
  }
  .main {
    grid-area: main;
    overflow: auto;
  }
  .header {
    grid-area: header;
  }
  ::-webkit-scrollbar {
    display: none;
  }
</style>
