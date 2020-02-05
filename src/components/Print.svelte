<script>
  import { schueler, medien, titel, print } from "./../stores.js";
  import { ipcRenderer } from 'electron'
  import PrintKurs from './Print/Kurs.svelte'
  import PrintSchueler from './Print/Schueler.svelte'
  import PrintMedien from './Print/Medien.svelte'

  let c

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log('Print: ', arg)
  })

  function handle_keydown(event) {
    if (event.key === "Escape") $print = false;
    if (event.key === 'p') ipcRenderer.send('print', 'print')
  }

  $: if ($print.name === 'Schueler') c = PrintSchueler
     else if ($print.name === 'Kurs') c = PrintKurs;
     else if ($print.name === 'Medien') c = PrintMedien;
</script>

<svelte:window on:keydown={handle_keydown} />

{#if c}
  <svelte:component this={c} />
{/if}