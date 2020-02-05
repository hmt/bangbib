<script>
  import { notification } from "./../stores.js";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  export let timeout = 20000;
  let count = 0;
  let toasts = [];
  let unsubscribe;

  function createToast(icon, msg, theme, to, barcode) {
    const background = theme || "";
    toasts = [
      {
        id: count,
        msg,
        icon,
        barcode,
        background,
        timeout: to || timeout,
        width: "100%"
      },
      ...toasts
    ];
    count = count + 1;
  }
  function removeToast(id) {
    setTimeout(_ => (toasts = toasts.filter(t => t.id != id)), 10000);
  }

  unsubscribe = notification.subscribe(value => {
    if (!value) {
      return;
    }
    createToast(
      value.icon,
      value.message,
      value.type,
      value.timeout,
      value.barcode
    );
    notification.set();
  });
  onDestroy(unsubscribe);
</script>

{#each toasts as toast (toast.id)}
  <article
    class="message is-{toast.background}"
    use={removeToast(toast.id)}
    out:fade>
    <div class="message-header">
      <span class="icon">
        <i class="mdi">{toast.icon}</i>
      </span>
      {toast.barcode || ''}
    </div>
    <div class="message-body">{toast.msg}</div>
  </article>
{/each}
