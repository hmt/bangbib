# Bangbib
Bangbib ist eine einfach App zur Verwaltung einer Lehrmittelbibliothek an
Schulen oder sonstingen Einrichtungen.

## Eigenschaften
Bangbib bietet folgende Eigenschaften zur Verwaltung:
* Scannerunterstützung zum Einlesen von Barcodes Buchtitel können en masse
* importiert werden Nutzer können als Liste ebenfalls im Block importiert
* werden Nutzer können Angaben zu Lerngruppen und Klassen mitbringen Medien
* können an einzelne Nutzer verliehen werden Gruppenauseihe, wenn gleiche
* Medien an mehrere Nutzer im Block verliehen werden Druckansichten für
* Gruppenausleihe, Einzelnutzer und säumige Nutzer

### Hinweis zur Nutzung
Es gibt momentan einen Installer für Windows, Mac und Linux auf Anfrage.

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
* Gescannte Medien werden zurückgebucht. -> ist die Ausleihe. Ist das Feld
* gelb, kann in der aktuellen Ansicht ein Titel verliehen werden. +1 bedeutet,
* dass Medientitel, die nicht in der Datenbank sind, hinzugefügt werden können.
Bangbib ist sehr pragmatisch im Umgang mit neuen Titeln. Kommt ein
unbekannter Barcode vor, fragt Bangbib, was mit dem Barcode passieren soll.
Entweder man ordnet den Barcode einem bekannten Titel zu oder erstellt einen
neuen Titel. In der Gruppenausleihe fragt Bangbib nur beim ersten Titel nach
und geht dann im weiteren Verlauf davon aus, dass alle nachkommenden Titel
bis zum Gruppenende den gleichen Titel haben.

Eine Nutzung ohne Scanner ist momentan nicht möglich. Ein Scanner-Prefix kann
in den Einstellungen festgelegt werden.

### Lizenz
Bangbib wird unter der MIT-Lizenz veröffentlich.