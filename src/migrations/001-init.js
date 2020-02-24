exports.up = DB => {
  DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS schueler (
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
  ).run();
  DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS kurszugehoerigkeit (
      id           INTEGER PRIMARY KEY,
      kurs_lehrer  TEXT,
      kurs         TEXT,
      schild_id    INTEGER,
      CONSTRAINT fk_schueler
        FOREIGN KEY (schild_id)
        REFERENCES schueler(schild_id)
        ON DELETE CASCADE)
    `
  ).run();
  DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS medienbezeichnung (
      id   INTEGER PRIMARY KEY,
      name TEXT)
  `
  ).run();
  DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS medienexemplar (
      id                    INTEGER PRIMARY KEY,
      barcode               TEXT UNIQUE,
      medienbezeichnung_id  INTEGER,
      CONSTRAINT fk_medienbezeichnung
        FOREIGN KEY (medienbezeichnung_id)
        REFERENCES medienbezeichnung(id)
        ON DELETE CASCADE)
  `
  ).run();
  DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS ausleihe (
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
  ).run();
}
exports.down = DB => {
  DB.prepare(`DROP TABLE IF EXISTS schueler;`).run();
  DB.prepare(`DROP TABLE IF EXISTS kurszugehoerigkeit;`).run();
  DB.prepare(`DROP TABLE IF EXISTS medienbezeichnung;`).run();
  DB.prepare(`DROP TABLE IF EXISTS medienexemplar;`).run();
  DB.prepare(`DROP TABLE IF EXISTS ausleihe;`).run();
}