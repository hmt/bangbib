import { get } from "svelte/store";
import { db } from "./stores.js";
const Database = require("better-sqlite3");

const DB_VERSION = 1; // sollte mit jeder Änderung um 1 erhöht werden

export function db_check() {
  let version;
  try {
    db.set(new Database("datenbank.sqlite", { fileMustExist: true }));
    const app = get(db)
      .prepare(
        `
      SELECT version FROM app
    `
      )
      .get();
    version = app.version;
  } catch (e) {
    console.log("Datenbank existiert nicht, wird angelegt…");
    try {
      db.set(new Database("datenbank.sqlite"));
    } catch (e) {
      console.log(e);
      throw "Datenbank konnte nicht erstellt werden";
    }
  }
  try {
    // wenn version gefunden, dann Migration bei version +1 beginnen
    if (version < DB_VERSION) db_migrate(version + 1);
    else if (!version) db_migrate(0);
    return true;
  } catch (e) {
    console.log("Es gab einen Fehler bei der DB-Migration:", e);
    throw "Fehler DB-Migration";
  }
}
function db_migrate(version) {
  console.log(
    `DB-Migration erforderlich von Version ${version || "neu"} => ${DB_VERSION}`
  );
  const run_these = migration.sort().splice(version);
  run_these.forEach((m, i) => console.log(`Migration ${i}: ${m()}`));
}

const migration = [
  function migration_0() {
    get(db)
      .prepare(
        `
    CREATE TABLE schueler (
      id              INTEGER PRIMARY KEY,
      schild_id       INTEGER UNIQUE,
      jahr            INTEGER,
      klasse          TEXT,
      vorname         TEXT,
      name            TEXT,
      gesperrt        INTEGER,
      nichtschueler   INTEGER,
      memo            TEXT)
  `
      )
      .run();
    get(db)
      .prepare(
        `
    CREATE TABLE kurszugehoerigkeit (
      id           INTEGER PRIMARY KEY,
      kurs_lehrer  TEXT,
      kurs         TEXT,
      schild_id    INTEGER,
      CONSTRAINT fk_schueler
        FOREIGN KEY (schild_id)
        REFERENCES schueler(schild_id)
        ON DELETE CASCADE)
    `
      )
      .run();
    get(db)
      .prepare(
        `
    CREATE TABLE medienbezeichnung (
      id   INTEGER PRIMARY KEY,
      name TEXT)
  `
      )
      .run();
    get(db)
      .prepare(
        `
    CREATE TABLE medienexemplar (
      id                    INTEGER PRIMARY KEY,
      barcode               TEXT UNIQUE,
      medienbezeichnung_id  INTEGER,
      CONSTRAINT fk_medienbezeichnung
        FOREIGN KEY (medienbezeichnung_id)
        REFERENCES medienbezeichnung(id)
        ON DELETE CASCADE)
  `
      )
      .run();
    get(db)
      .prepare(
        `
    CREATE TABLE ausleihe (
      id                 INTEGER PRIMARY KEY,
      jahr               INTEGER,
      klasse             TEXT,
      kurs               TEXT,
      kurs_lehrer        TEXT,
      schueler_id        INTEGER,
      medienexemplar_id  INTEGER,
      CONSTRAINT fk_schueler
        FOREIGN KEY (schueler_id)
        REFERENCES schueler(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_medienexemplar
        FOREIGN KEY (medienexemplar_id)
        REFERENCES medienexemplar(id)
        ON DELETE CASCADE)
  `
      )
      .run();
    get(db)
      .prepare(
        `
    CREATE TABLE app (
      id      INTEGER PRIMARY KEY,
      version INTEGER)
  `
      )
      .run();
    get(db)
      .prepare(
        `
    INSERT INTO app (version) VALUES(?)
  `
      )
      .run(DB_VERSION);
    return "Tabellen erstellen";
  },
  function migration_1() {
    get(db)
      .prepare(
        `
    UPDATE app SET version=?
  `
      )
      .run(DB_VERSION);
    return "Version update";
  }
];
