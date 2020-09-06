exports.up = (DB) => {
  DB.prepare(`
  WITH m AS (
    SELECT ROW_NUMBER () OVER (PARTITION BY name ORDER BY id) AS RowNum, id
    FROM medienbezeichnung
  )
  UPDATE medienbezeichnung
  SET name = name || ' (Exemplar ' || (SELECT m.RowNum FROM m WHERE m.id = medienbezeichnung.id) || ')'
  WHERE (SELECT m.RowNum FROM m WHERE m.id = medienbezeichnung.id) > 1;
  `).run()
  DB.prepare(
    `CREATE UNIQUE INDEX idx_medienbezeichnung_name ON medienbezeichnung (name);`
  ).run();
};
exports.down = (DB) => {
  DB.prepare(`DROP INDEX IF EXISTS idx_medienbezeichnung_name;`).run();
};
