# Changelog

Alle noemenswaardige wijzigingen aan deze card worden hier bijgehouden.
Formaat volgt [Keep a Changelog](https://keepachangelog.com/) en
[Semantic Versioning](https://semver.org/).

## [1.0.2] - 2026-07-08
### Toegevoegd
- Wp is nu per paneel instelbaar. Zo kun je bijv. 400 Wp- en 370 Wp-panelen in één legplan mengen; elk paneel wordt op zijn eigen piekvermogen geschaald.
### Gewijzigd
- Het globale `reference`-veld is nu de standaard-Wp voor nieuwe panelen (kleurschaal gebeurt per paneel).
- Bestaande configuraties zonder per-paneel `wp` vallen automatisch terug op `reference`, dus upgraden verandert niets aan de weergave.

## [1.0.1] - 2026-07-08
### Opgelost
- Drag & drop werkt nu betrouwbaar: paneel liet direct los of schoot door. De editor bouwt het canvas niet langer opnieuw op tijdens het slepen, waardoor pointer-capture behouden blijft.
- Sensor-dropdown was niet aanklikbaar / sloot direct: de lijst wordt niet meer bij elke wijziging opnieuw opgebouwd.
- Portrait/landscape-toggle reageerde soms pas na meerdere klikken; werkt nu met één klik en past het paneel direct aan.

## [1.0.0] - 2026-07-08
### Toegevoegd
- Eerste release.
- Legplan van zonnepanelen op een raster.
- Live PV-opbrengst per paneel via gekoppelde sensor.
- Kleurschaal per paneel op basis van opbrengst t.o.v. referentiewaarde.
- Portrait/landscape per paneel instelbaar.
- Visuele editor met drag & drop, snap-to-grid.
- Klik op paneel opent more-info dialoog.
