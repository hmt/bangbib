# Bangbib
Bangbib ist eine einfach App zur Verwaltung einer Lehrmittelbibliothek an
Schulen oder sonstigen Einrichtungen.

## Eigenschaften
Bangbib bietet folgende Eigenschaften zur Verwaltung:

* Scannerunterstützung zum Einlesen von Barcodes
* Buchtitel können als Block importiert werden
* Nutzer können als Liste ebenfalls im Block importiert werden
* Nutzer können Angaben zu Lerngruppen und Klassen mitbringen
* Medien können an einzelne Nutzer verliehen werden
* Gruppenauseihe, wenn gleiche Medien an mehrere Nutzer im Block verliehen werden
* Druckansichten für Gruppenausleihe, Einzelnutzer und säumige Nutzer

### Hinweis zur Nutzung
Es gibt momentan einen Installer für Windows, Mac und Linux.

Bangbib erstellt eine einfache SQLite-Datenbank im Einstellungsverzeichnis,
die auch mit anderen Programmen gelesen werden kann. Diese Datenbank kann man
selbstverständlich auch sichern.

Nutzer, müssen immer vollständig importiert werden. Alle Nutzer in der
Datenbank, die keine Medien geliehen haben, werden sonst gelöscht. Dies zum
Datenschutz der Nutzer, die in der Regel nicht für immer in der Datenbank
verbleiben sollten.

Nutzer, die Medien geliehen haben, werden nicht gelöscht.

Gesperrte Nutzer können in der Gruppenleihe keine Bücher leihen.

#### Scanner
Der Scannerstatus wird oben im Menü angezeigt.

* <- ist die Rückgabe. Ist das Feld blau, nimmt bangbib Bücher entgegen.
Gescannte Medien werden zurückgebucht.
* -> ist die Ausleihe. Ist das Feld gelb, kann in der aktuellen Ansicht ein
Titel verliehen werden.
* +1 bedeutet, dass Medientitel, die nicht in der Datenbank sind, hinzugefügt
werden können.

Bangbib ist sehr pragmatisch im Umgang mit neuen Titeln. Kommt ein
unbekannter Barcode vor, fragt Bangbib, was mit dem Barcode passieren soll.
Entweder man ordnet den Barcode einem bekannten Titel zu oder erstellt einen
neuen Titel. In der Gruppenausleihe fragt Bangbib nur beim ersten Titel nach
und geht dann im weiteren Verlauf davon aus, dass alle nachkommenden Titel
bis zum Gruppenende den gleichen Titel haben, wenn der Barcode unbekannt ist. Wird ein Titel mit bekanntem Barcode hinzugefügt, der aber nicht dem Titel entspricht, wird ein Fehler gemeldet.

Eine Nutzung ohne Scanner ist möglich, aber unhandlich, da die Barcodeingabe mit Escape gestartet und dann der Barcode von Hand angegeben werden muss. Ein Scanner-Prefix kann
in den Einstellungen festgelegt werden.

#### Drucken
Nach Beendigung der Gruppenausleihe wird automatisch in die Druckansicht gewechselt.
Mit Drücken der Taste `p` wird gedruckt. Die Einstellungen bieten aber auch eine Autodruck-Funktion und die Möglichkeit die Druckausgabe nur digital als PDF in einem Ordner abzulegen.

In der Nutzerübersicht kann man oben im Menü auf den Drucken-Knopf drücken und die
Druckansicht wird gezeigt.

### Einrichtung der Bibliothek
Nutzer werden am besten aus einer Datenbank generiert. Mit Schild geht z.B. dieser Befehl:
```
SELECT s.ID, s.Name, s.Vorname, a.Jahr, s.Klasse, ff.FachKrz, f.FachLehrer
  FROM schueler AS s
  LEFT JOIN schuelerlernabschnittsdaten AS a ON (a.Schueler_ID = s.ID AND a.Jahr = s.AktSchuljahr)
  LEFT JOIN schuelerleistungsdaten AS f ON (f.Abschnitt_ID = a.ID)
  LEFT JOIN eigeneschule_faecher AS ff ON (ff.ID = f.Fach_ID)
  WHERE Status = 2 AND Geloescht = "-" AND Gesperrt = "-"
  ORDER BY Klasse, Name ASC
```
Anschließend noch die Kopfzeile hinzufügen.

Ansonsten bieten die meisten Schulverwaltungsprogramme eine Möglichkeit, CSV-Dateien zu erzeugen. Es ist kein Problem, wenn Schüler mehrfache Einträge haben, da sonst die Kurszugehörigkeit nicht abgebildet werden kann. Wichtig ist dabei eine identische ID in der ersten Spalte.

Eine mögliche CSV-Datei sieht so aus:

```
id|name|vorname|jahr|klasse|kurs|kurs_lehrer
3475|Meier|Steffi|2020|A19A2|DIFF SPI|DRA
3475|Meier|Steffi|2020|A19A2|MA|HEM
3475|Meier|Steffi|2020|A19A2|AOR|MIF
3475|Meier|Steffi|2020|A19A2|GFP|REE
3475|Meier|Steffi|2020|A19A2|HUS|DUW
3475|Meier|Steffi|2020|A19A2|SPGF|REU
3475|Meier|Steffi|2020|A19A2|RE|STI
3475|Meier|Steffi|2020|A19A2|DEKO|SWJ
3475|Meier|Steffi|2020|A19A2|EN|BOK
```

Nach dem Import kann anschließend in bangbib nach dem Namen der Schülerin, der Klasse oder dem Kurs gesucht werden, um entweder eine Einzel- oder Gruppenausleihe zu initiieren. Oder auch um einfach die Daten der Schülerin und ihren Leihverlauf zu sehen.

Lehrer können ebenfalls in bangbib importiert werden. Es gibt keinen besonderen Grund, aber es erschien mir praktisch, die Gruppe von Nutzern etwas anders zu behandeln, deswegen läuft der Import zusätzlich und kann aus Schild mit diesem Befehl gelesen werden:

```
SELECT ID, Nachname, Vorname, (SELECT Schuljahr FROM eigeneschule) AS jahr FROM k_lehrer WHERE Sichtbar="+";
```

Medientitel können massenhaft importiert werden. Dazu jeden Titel auf seine eigene Zeile setzen.

Neue Barcodes müssen nicht vor der Ausleihe dem System bekannt gemacht werden. Es reicht, wenn man dies bei der Erstausleihe erledigt.

Es gibt leider noch keine Funktion, wenn man trotzdem eine Serie von Barcodes mit dem gleichen Titel in Bangbib eingeben möchte, um z.B. in der Einzelausleihe auf das Nennen des Titels zu verzichten. Man kann sich hierbei aber helfen, wenn man mutig ist und einen SQL Befehl ausführen möchte. Dazu die datenbank.sqlite öffnen und folgenden Befehl anpassen und ausführen:

```
WITH RECURSIVE n(value) AS (
  SELECT 101
  UNION ALL
  SELECT value+1 FROM n
   WHERE value+1<=110
)
insert into medienexemplar (barcode, medienbezeichnung_id) select 'B'||printf('%03d',n.value),8 from n;
```

In diesem Fall würde das Barcodes von B101 bis B110 für den Medientitel mit der ID 8 erzeugen. Wichtig ist selbstverständlich, dass noch keine Barcodes aus dieser Serie existieren und eine Medienid 8 eingetragen ist.

### Lizenz
Bangbib wird unter der MIT-Lizenz veröffentlich.