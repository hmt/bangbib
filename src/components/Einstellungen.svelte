<script>
  import { parse } from "papaparse";
  import { configData, db } from "./../stores.js";
  import { sql } from "./../helpers.js";
  import * as notifier from "./../notifier.js";

  let datensatz_schueler = "",
    datensatz_medien = "",
    datensatz_sonstige = { nichtschueler: 1, memo: "" },
    datensatz_block_sonstige = "",
    warten,
    show_restart;

  const update_sonstige = () => {
    try {
      console.log(
        $db
          .prepare(
            sql`
      INSERT INTO schueler (name, vorname, nichtschueler, memo) VALUES(:name, :vorname, :nichtschueler, :memo)
    `
          )
          .run(datensatz_sonstige)
      );
      datensatz_sonstige = { nichtschueler: 1, memo: "" };
      notifier.fertig("Nutzer hinzugefügt");
    } catch (e) {
      console.log(e);
      notifier.fehler(`Fehler beim Hinzufügen des Nutzers: ${e.message}`);
    }
  };
  const block_update_sonstige = async () => {
    warten = true;
    const { data } = await parse(datensatz_block_sonstige, {
      comments: "#",
      header: true,
    });
    try {
      $db
        .prepare(
          sql`DELETE FROM schueler WHERE nichtschueler=1 AND NOT EXISTS (SELECT * FROM ausleihe WHERE ausleihe.schueler_id = schueler.id)`
        )
        .run();
      const insert = $db.prepare(
        sql`INSERT INTO schueler (schild_id, name, vorname, jahr, nichtschueler) VALUES(:id, :name, :vorname, :jahr, 1)
        ON CONFLICT (schild_id) DO UPDATE SET jahr = :jahr`
      );
      const insertMany = $db.transaction((entries) => {
        for (const e of entries) insert.run(e);
      });
      insertMany(data);
      // id|name|vorname|jahr
      notifier.fertig(`${data.length || 0} Datensätze verarbeitet.`);
    } catch (e) {
      notifier.fehler(`Fehler beim Lehrerimport: ${e.message}`);
      console.log(e);
    }
    warten = false;
  };
  const update_schueler = async () => {
    warten = true;
    const res = await parse(datensatz_schueler, {
      comments: "#",
      header: true,
    });
    // id|name|vorname|jahr|klasse|kurs|kurs_lehrer
    const values = res.data;
    let schueler = {};
    values.forEach((v) => {
      schueler[v.id] = [v.id, v.jahr, v.klasse, v.name, v.vorname];
    });
    const jahr = values[0].jahr;
    const schueler_values = Object.values(schueler)
      .map((a) => `(${a[0]}, ${a[1]}, '${a[2]}', '${a[3]}', '${a[4]}')`)
      .join(",");
    const kurszugehoerigkeit_values = values
      .map((v) => `(${v.id}, '${v.kurs_lehrer || ""}', '${v.kurs || ""}')`)
      .join(",");
    const query = [
      sql`DELETE FROM schueler WHERE nichtschueler IS NULL AND NOT EXISTS ( SELECT * FROM ausleihe WHERE ausleihe.schueler_id = schueler.id)`,
      sql`INSERT INTO schueler (schild_id, jahr, klasse, name, vorname) VALUES ${schueler_values}
        ON CONFLICT (schild_id) DO UPDATE SET jahr = excluded.jahr, klasse = excluded.klasse`,
      sql`DELETE FROM kurszugehoerigkeit`,
      sql`INSERT INTO kurszugehoerigkeit (schild_id, kurs_lehrer, kurs) VALUES ${kurszugehoerigkeit_values}`,
    ];
    try {
      query.forEach((q) => $db.prepare(q).run());
      datensatz_schueler = "";
      const res = $db.prepare(`SELECT COUNT(*) as anzahl FROM schueler`).get();
      notifier.fertig(
        `${schueler_values.length || 0} Datensätze verarbeitet; ${
          res.anzahl
        } Nutzer in der Datenbank.`
      );
    } catch (e) {
      notifier.fehler(`Fehler beim Schülerimport: ${e.message}`);
      console.log(e);
    }
    warten = false;
  };
  const update_medien = async () => {
    const medien = datensatz_medien.split("\n").filter((a) => a);
    const insert = $db.prepare(
      sql`INSERT INTO medienbezeichnung (name) VALUES (?)`
    );
    const insertMany = $db.transaction((medien) => {
      for (const medium of medien) insert.run(medium.trim());
    });
    try {
      insertMany(medien);
      datensatz_medien = "";
      notifier.fertig("Medientitel importiert");
    } catch (e) {
      const msg =
        e.code === "SQLITE_CONSTRAINT_UNIQUE"
          ? "Mindestens ein Titel ist bereits vorhanden"
          : e.message;
      notifier.fehler(`Fehler beim Medienimport: ${msg}`);
      console.log(e);
    }
  };
</script>

<div class="box">
  <h3 class="title">Scan-Prefix</h3>
  <div class="field">
    <div class="control">
      <label class="label">
        Scan-Prefix muss im Scanner einprogrammiert werden
        <input class="input" type="text" bind:value={$configData.scan_prefix} />
      </label>
    </div>
  </div>
</div>
<div class="box">
  <h3 class="title">Schüler, Kurse und Zugehörigkeiten importieren</h3>
  <div class="field">
    <div class="control">
      <label class="label">
        Achtung, die Nutzerdatenbank wird komplett geleert und mit den neuen
        Daten ersetzt. Ausgenommen sind säumige Nutzer und sonstige Nutzer.
        <textarea
          class="textarea"
          bind:value={datensatz_schueler}
          placeholder="Füge Daten mit Kopfzeile ein:
      id|name|vorname|jahr|klasse|kurs|kurs_lehrer"
          rows="10"
          cols="20"
        />
      </label>
    </div>
  </div>
  <div class="field is-grouped">
    <div class="control">
      <button
        class="button is-{warten ? 'warning' : 'link'}"
        class:is-loading={warten}
        disabled={warten}
        on:click={() => update_schueler()}
      >
        Aktualisieren
      </button>
    </div>
  </div>
</div>
<div class="box">
  <h3 class="title">Lehrer importieren</h3>
  <div class="field">
    <div class="control">
      <label class="label">
        Achtung, alle sonstigen Nutzer (Lehrer etc.) werden entfernt und mit den
        neuen Daten ersetzt. Ausgenommen sind Nutzer mit bestehenden Ausleihen.
        <textarea
          class="textarea"
          bind:value={datensatz_block_sonstige}
          placeholder="Füge Daten mit Kopfzeile ein:
      id|name|vorname|jahr"
          rows="10"
          cols="20"
        />
      </label>
    </div>
  </div>
  <div class="field is-grouped">
    <div class="control">
      <button
        class="button is-{warten ? 'warning' : 'link'}"
        class:is-loading={warten}
        disabled={warten}
        on:click={() => block_update_sonstige()}
      >
        Aktualisieren
      </button>
    </div>
  </div>
</div>
<div class="box">
  <h3 class="title">Sonstige Personen aufnehmen</h3>
  <div class="field is-grouped">
    <div class="control">
      <input
        class="input"
        type="text"
        placeholder="Name"
        bind:value={datensatz_sonstige.name}
      />
    </div>
    <div class="control">
      <input
        class="input"
        type="text"
        placeholder="Vorname"
        bind:value={datensatz_sonstige.vorname}
      />
    </div>
    <div class="control">
      <input
        class="input"
        type="text"
        placeholder="Bemerkungen"
        bind:value={datensatz_sonstige.memo}
      />
    </div>
    <div class="control">
      <button
        class="button is-{warten ? 'warning' : 'link'}"
        class:is-loading={warten}
        disabled={warten}
        on:click={() => update_sonstige()}
      >
        Aktualisieren
      </button>
    </div>
  </div>
</div>
<div class="box">
  <h3 class="title">Medien importieren</h3>
  <div class="field">
    <div class="control">
      <label class="label">
        Medientitel importieren
        <textarea
          class="textarea"
          bind:value={datensatz_medien}
          placeholder="Je ein Titel pro Zeile"
          rows="10"
          cols="20"
        />
      </label>
    </div>
  </div>
  <div class="field is-grouped">
    <div class="control">
      <button class="button is-link" on:click={() => update_medien()}>
        Aktualisieren
      </button>
    </div>
  </div>
</div>

<div class="box">
  <h3 class="title">Druckeinstellungen</h3>
  <p class="mb-4">
    Ein Drucker muss als Standarddrucker eingestellt sein, damit der Druck aus
    Bangbib heraus funktioniert.
    <br />Darüber hinaus lässt sich festlegen, wie nach einer Gruppenausleihe
    verfahren wird.
  </p>
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$configData.gruppe_print_dialog} />
      Druckdialog sofort zeigen
    </label>
  </div>
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$configData.gruppe_auto_pdf} />
      Automatisch als PDF ablegen
    </label>
    <p class="help">
      Diese Einstellung erstellt ein PDF in der Form
      <code>Jahrgang_Kurs_Datum_Zeit.pdf</code>
      im PDF-Verzeichnis
    </p>
  </div>
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$configData.kontoauszug_beleg} />
      Nutzerkontoauszüge als Beleg mit Unterschriftenfeld erzeugen
    </label>
    <p class="help">
      Kann z.B. genutzt werden, um technische Geräte auszuleihen.
    </p>
  </div>
  {#if $configData.kontoauszug_beleg}
    <div class="field">
      <label class="checkbox">
        <input
          type="checkbox"
          bind:checked={$configData.kontoauszug_beleg_filter}
        />
        Belege nur für ausgewählte Medien verwenden
      </label>
      <p class="help">
        So kann festgelegt werden, dass nur bestimmte Medien auf dem Beleg
        auftauchen. Kann über die Medienanzeige ausgewählt werden.
      </p>
    </div>
  {/if}
  <div class="field">
    <p class="control">
      <label class="label"
        >PDF-Verzeichnis
        <input
          class="input"
          type="text"
          bind:value={$configData.pdf_verzeichnis}
        />
      </label>
    </p>
  </div>
</div>
<div class="box">
  <h3 class="title">Sonstige Einstellungen</h3>
    <div class="field">
      <p class="control">
        <label class="label"
          >Datenbank-Verzeichnis
          <input
            class="input"
            type="text"
            bind:value={$configData.db_verzeichnis}
            on:blur={_=>show_restart = true}
          />
        </label>
      </p>
    </div>
    {#if show_restart}
      Bangbib bitte neu starten, um die neue Datenbank einzulesen.
    {/if}
  </div>
