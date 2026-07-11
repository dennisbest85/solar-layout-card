# Solar Layout Card

![hacs](https://img.shields.io/badge/HACS-Dashboard-41BDF5.svg)
![version](https://img.shields.io/badge/version-1.1.1-f4c40f.svg)

Een Home Assistant Lovelace-card die een legplan van je zonnepanelen toont, met de
live PV-opbrengst in elk paneel. Panelen zijn per stuk portrait of landscape
te plaatsen en de indeling maak je met een drag and drop editor.

![Voorbeeld van de Solar Layout Card](images/preview.png)

![Micro-omvormers](images/microinverters.png)

## Functies
- Legplan op een raster, zoals de panelen op je dak liggen.
- Per paneel een sensor koppelen; waarde en eenheid worden getoond.
- Panelen kleuren mee met de opbrengst ten opzichte van een Wp-referentie (per paneel instelbaar).
- Configureerbare kleuren: donker als het paneel uit is, oplopend naar lichtblauw bij veel zon (Enphase-stijl).
- Zoomknop om grote opstellingen compacter te maken (100% tot 40%).
- Typed zoeken bij de sensorkeuze en een knop om een paneel te dupliceren (neemt sensor, Wp en orientatie mee).
- Instelbare tekstgrootte, los van de zoom.
- Meerdere legplannen via tabbladen (standaard Layout1, Layout2, ...); bij een enkel plan blijven tabbladen verborgen.
- Omvormers plaatsbaar in het legplan (GoodWe, SolarEdge, Growatt, Solis, Sunsynk), met optionele sensor.
- Rode waarschuwing op een paneel dat overdag 0 W meet (via sun.sun).
- Omvormers met echte afbeelding (GoodWe, SolarEdge, Growatt, Solis, Sunsynk).
- Verbindingslijnen tussen panelen en naar de omvormer, recht of gebogen.
- Stromende bolletjes over de verbindingslijnen, die af en toe langs de lijn lopen.
- Kleur per verbindingslijn instelbaar (standaard amber).
- Micro-omvormers plaatsbaar naast de gewone omvormers (Enphase, APSystems, Growatt, Hoymiles), kleiner weergegeven dan de string-omvormers en met echte afbeelding.
- Zoom per legplan; verberg-opties voor omvormer-afbeelding/label/sensor.
- Portrait/landscape per paneel.
- Visuele editor met slepen en snap-to-grid.
- Klik op een paneel opent de more-info dialoog van de sensor.

## Installatie via HACS
1. HACS, drie puntjes, Custom repositories.
2. Voeg de repo-URL toe, categorie Dashboard.
3. Download en herlaad je browser.

De resource wordt geserveerd via `/hacsfiles/solar-layout-card/solar-layout-card.js`.

## Voorbeeldconfiguratie
```yaml
type: custom:solar-layout-card
title: Zonnepanelen dak
reference: 400        # standaard-Wp voor nieuwe panelen
color_off: "#0b1f3a"  # donker = uit / geen zon
color_max: "#6fc3ff"  # lichtblauw = maximale opbrengst
zoom: 100             # 40 t/m 100
font_scale: 100       # tekstgrootte in procent (50 t/m 200)
panels:
  - id: a1
    x: 0
    y: 0
    orientation: portrait
    entity: sensor.paneel_1_vermogen   # Watt
    wp: 400
    label: "1"
  - id: a2
    x: 4
    y: 0
    orientation: landscape
    entity: sensor.paneel_2_vermogen   # Watt
    wp: 370
    label: "2"
```

## Configuratie-opties
| Optie       | Type   | Standaard | Beschrijving |
|-------------|--------|-----------|--------------|
| `title`     | string | `""`      | Titel boven de card. |
| `reference` | number | `400`     | Standaard-Wp voor nieuw toegevoegde panelen. |
| `color_off` | string | `#0b1f3a` | Kleur bij uit / geen opbrengst. |
| `color_max` | string | `#6fc3ff` | Kleur bij maximale opbrengst (bij Wp). |
| `zoom`      | number | `100`     | Startzoom in procent (40 tot 100). |
| `font_scale`| number | `100`     | Tekstgrootte in procent (50 tot 200). |
| `panels`    | list   | `[]`      | Panelen (enkel legplan). |
| `inverters` | list   | `[]`      | Omvormers en micro-omvormers (enkel legplan). |
| `inv_hide_image` | bool | `false` | Verberg de omvormer-afbeelding (alle omvormers). |
| `inv_hide_label` | bool | `false` | Verberg het omvormer-label. |
| `inv_hide_sensor`| bool | `false` | Verberg de omvormer-sensorwaarde. |
| `connections` | list | `[]`     | Lijnen tussen items; elk met `from`, `to`, `curved` en `color`. |
| `layouts`   | list   | -         | Meerdere legplannen; elk met `name`, `panels`, `inverters`, `connections`, `zoom`. |

Per paneel: `id`, `x`, `y` (rastercoordinaten), `orientation` (`portrait`/`landscape`),
`entity` (Watt-sensor), `wp` (piekvermogen van dit paneel, voor de kleurschaal), `label`.

Per omvormer: `id`, `x`, `y`, `brand`, `entity` (optioneel), `label`. Zet `micro: true` voor
een micro-omvormer; het merk is dan een van `enphase`, `apsystems`, `growatt`, `hoymiles`.
Zonder `micro` is het een string-omvormer (`goodwe`, `solaredge`, `growatt`, `solis`, `sunsynk`).

Per verbinding: `from`, `to` (paneel- of omvormer-`id`), `curved` (recht of gebogen) en
`color` (lijnkleur, standaard `#ffd54a`).

## Ontwikkeling
Een los `dist/solar-layout-card.js`-bestand, geen build-stap nodig.

## Licentie
MIT, zie [LICENSE](LICENSE).
