import { get } from "svelte/store";
import { schueler, db } from "./stores.js";
import { sql } from "./helpers.js";
export function get_schueler(item) {
  const res = get(db)
    .prepare(
      sql`
      SELECT s.*
      FROM schueler AS s
      WHERE s.id = ?
    `
    )
    .all(item.id);
  schueler.set(res);
}
export function get_schueler_by_schild_id(item) {
  const res = get(db)
    .prepare(
      sql`
      SELECT s.*
      FROM schueler AS s
      WHERE s.schild_id = ?
    `
    )
    .all(item.id);
  if (!res.length) throw "Kein Schüler mit dieser ID gefunden";
  schueler.set(res);
}
export function get_kurs(item) {
  const res = get(db)
    .prepare(
      sql`
      SELECT DISTINCT s.*, k.kurs, k.kurs_lehrer
      FROM kurszugehoerigkeit AS k
      LEFT JOIN schueler AS s ON (k.schild_id = s.schild_id)
      WHERE k.kurs = ? AND s.klasse = ? AND s.jahr = ?
    `
    )
    .all(item.id, item.klasse, item.jahr);
  schueler.set(res);
}
