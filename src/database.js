import { ipcRenderer } from "electron";
import { db, configData } from "./stores.js";
import { join } from "path";
import { get } from "svelte/store";
import ley from 'ley'

const Database = require("better-sqlite3");

function isDev() {
  return process.env.ELECTRON_DEV === '1';
}

export async function db_check() {
  const db_file = join(get(configData).user_data, "datenbank.sqlite");
  const cwd = isDev() ? join(__dirname, '..', 'src') : process.resourcesPath
  const ley_opts = { config: { database: db_file }, cwd, dir: "migrations" };
  try {
    db.set(new Database(db_file, { fileMustExist: true }));
  } catch (e) {
    console.log("Datenbank existiert nicht, wird angelegt…");
    try {
      db.set(new Database(db_file));
    } catch (e) {
      console.log(e);
      throw "Datenbank konnte nicht erstellt werden";
    }
  }
  try {
    const successes = await ley.up(ley_opts);
    if (successes.length) console.log("Erfolgreich migriert: ", successes);
  } catch (e) {
    await ley.down(ley_opts);
    console.log("Es gab einen Fehler bei der Migration: ", e);
    throw e;
  }
  ipcRenderer.on("close_db", (event, message) => {
    try {
      get(db).close();
      console.log("schließe Datenbank…");
    } catch (e) { console.log('Datenbank konnte nicht geschlossen werden: ',e)}
  });
}
