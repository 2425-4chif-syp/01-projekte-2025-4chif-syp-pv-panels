# 01-projekte-2025-4chif-syp-pv-panels

## Team
**Team**
| Name |
|------|
| Sebastian Radic |
| Tobias Kletsch |
| Denis Bjelak |
| Danis Mezildzic |
| Luis Schörgendorfer |

## Ausgangssituation
Auf einer VM (leoenergy genannt) werden von einem schuleigenen Server in einem 5-Minuten- Intervall per SFTP Datendateien im JSON-Format heruntergeladen.

shell
Code kopieren

## Anforderungen
Die Quarkus App liest diese JSON-Dateien ein und schreibt diese in eine InfluxDB. Dabei ist auf korrektes Tagging zu achten. Es werden laufend neue JSON-Dateitypen hinzugefügt.

Code kopieren
Am Dashboard soll angezeigt werden:

Welche Dateien (Struktur des Namens) derzeit importiert werden.
Wieviele verschiedene Dateiarten es im Verzeichnis gibt.
Wieviele verschiedene Dateiarten derzeit importiert werden.
markdown
Code kopieren

## Diagrams

**Class Diagram**  
![Class Diagram](https://www.plantuml.com/plantuml/png/ZP2xgiCm38PtFONmU233MJs5agLpIdTZgwx0TeAjP2bvzoPk0irMJ-P3_qLgYvWiKmmGw24e0sRsJq77cQpma01iCALWHpDRUW6kZvt62_jh4lAKAqecaiPUCYSFoo7gAPKXtqsOVbHkmDKalITMD6yELTcHvMZ2FbXivd5hUJAO4ii924TQzuoZnjln1Lm0FX6e_bNJg3_rtHTQIcwzoni0)

**Usecase Diagram**  
![Usecase Diagram](https://www.plantuml.com/plantuml/png/ROyn3i8m34NtdCBgtZjKGcniY0EOvBUDI1raEqW8SNTeMHYwFlizouCvgxUbX8BHoIjfdcQdb1NHSvN0qQjITp5eHsmKKrX7B5C1dL0XqEb9hq3K394Dr1rNbl60NfLRd0bP33DaA_oCGnLhotsxiQlUk8rxuXcbX7U8YVf-f_NFjzK1ahuFVW000)

## Sprint-Backlog
[Sprint Backlog](https://vm81.htl-leonding.ac.at/agiles/99-387/current)

