import { get } from 'svelte/store';
import { schueler, db } from "./stores.js";
  export function get_schueler (item) {
    const res = get(db)
      .prepare(
        `
      SELECT s.*
      FROM schueler AS s
      WHERE s.id = ?
    `
      )
      .all(item.id);
    schueler.set(res)
  };
  export function get_kurs (item) {
    const res = get(db)
      .prepare(
        `
      SELECT s.*, k.kurs, k.kurs_lehrer
      FROM kurszugehoerigkeit AS k
      LEFT JOIN schueler AS s ON (k.schild_id = s.schild_id)
      WHERE k.kurs = ? AND s.klasse = ? AND s.jahr = ?
    `
      )
      .all(item.id, item.klasse, item.jahr);
    schueler.set(res)
  };
