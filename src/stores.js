import { writable } from 'svelte/store';
import { ipcRenderer } from 'electron';

export const configData = writable(undefined);
ipcRenderer.invoke("get_store").then((res) => {
  configData.set(res);
  configData.subscribe((value) => {
    ipcRenderer.invoke("set_store", value);
  });
});

export const schueler = writable([]);
export const view = writable(undefined);
export const notification = writable(undefined)
export const db = writable(undefined)
export const medien = writable(undefined)
export const titel = writable(undefined)
export const print = writable(false)
export const scan_status = writable(undefined)
