<script>
  import { schueler, print, configData } from "./../stores.js";
  import { ipcRenderer } from 'electron'
  import PrintKurs from './Print/Kurs.svelte'
  import PrintSchueler from './Print/Schueler.svelte'
  import PrintMedien from './Print/Medien.svelte'
  import * as notifier from './../notifier.js'

  let c
  ipcRenderer.on('pdf-reply', (event, arg) => {
    console.log('PDF: ', arg)
    notifier.fertig('PDF erfolgreich gespeichert')
  })
  ipcRenderer.on('print-reply', (event, arg) => {
    console.log('Print: ', arg)
  })
  const d = new Date().getTime();
  const pdf_name = `${$schueler[0].name}_${$schueler[0].vorname}_${$schueler[0].jahr}_${d}.pdf`;

  function handle_keydown(event) {
    if (event.key === "Escape") $print = false;
    if (event.key === 'p') ipcRenderer.send('print')
    if (event.key === 's') ipcRenderer.send('pdf', pdf_name)
  }

  $: if ($print.name === 'Schueler') c = PrintSchueler
     else if ($print.name === 'Kurs') c = PrintKurs;
     else if ($print.name === 'Medien') c = PrintMedien;
</script>

<svelte:window on:keydown={handle_keydown} />

{#if c}
  <article class="message is-default no-print" style="position: absolute; top: 2rem; left: 65rem">
    <div class="message-header">
      <span class="icon">
        <i class="mdi">info</i>
      </span>
      &nbsp;Tastaturbefehle
    </div>
    <div class="message-body">
      Drucken: <b>p</b>
      <br>
      PDF: <b>s</b>
      <br>
      Abbrechen: <b>ESC</b>
    </div>
  </article>
  <svelte:component this={c}/>
{/if}