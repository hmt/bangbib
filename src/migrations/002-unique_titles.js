exports.up = (DB) => {
  DB.prepare(
    `CREATE UNIQUE INDEX idx_medienbezeichnung_name ON medienbezeichnung (name);`
  ).run();
};
exports.down = (DB) => {
  DB.prepare(`DROP INDEX IF EXISTS idx_medienbezeichnung_name;`).run();
};
