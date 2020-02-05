import { writable } from 'svelte/store';
import configFile from './configstore';

export const configData = writable(configFile.store);
configData.subscribe(value => {
  configFile.set(value)
});

export const schueler = writable([]);
export const view = writable();
export const notification = writable()
export const db = writable()
export const medien = writable()
export const titel = writable()
export const print = writable(false)
export const scan_status = writable()
