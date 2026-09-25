# Carmovia Customer Intelligence

Monatliches Kundendashboard fuer Auftragsanzahl, Umsatz, Marge in Euro und
prozentuale Marge. Ohne einen explizit bereitgestellten Carmovia-Export zeigt
die Anwendung einen leeren Datenzustand und keine fiktiven Kennzahlen.

## Entwicklung

```bash
npm ci
npm run dev
```

## Geschuetzter VPS-Betrieb

Echte Kundennamen und Finanzdaten werden nicht ueber GitHub Pages veroeffentlicht.
Der private Container liest `customer-monthly.json` aus einem nur auf dem VPS
vorhandenen Volume und verlangt zusaetzlich einen Dashboard-Benutzer samt Passwort.
Der eingecheckte Export enthaelt deshalb keine Datensaetze.
