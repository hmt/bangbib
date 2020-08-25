import { writable } from 'svelte/store';
import { ipcRenderer } from 'electron';

export const configData = writable();
ipcRenderer.invoke("get_store").then((res) => {
  configData.set(res);
  configData.subscribe((value) => {
    ipcRenderer.invoke("set_store", value);
  });
});

export const schueler = writable([]);
export const view = writable();
export const notification = writable()
export const db = writable()
export const medien = writable()
export const titel = writable()
export const print = writable(false)
export const scan_status = writable()
