# Solar Layout Card

[![hacs](https://img.shields.io/badge/HACS-Dashboard-41BDF5.svg)](https://hacs.xyz)
![version](https://img.shields.io/badge/version-1.0.2-f4c40f.svg)

Een Home Assistant Lovelace-card die een **legplan van je zonnepanelen** toont, met de
**live PV-opbrengst** in elk paneel. Panelen zijn per stuk **portrait** of **landscape**
te plaatsen en de indeling maak je met een **drag & drop editor**.

## Functies
- Legplan op een raster, zoals de panelen op je dak liggen.
- Per paneel een sensor koppelen; waarde + eenheid worden getoond.
- Panelen kleuren mee met de opbrengst t.o.v. een referentiewaarde (Wp/W).
- Portrait/landscape per paneel.
- Visuele editor met slepen en snap-to-grid.
- Klik op een paneel opent de more-info dialoog van de sensor.

## Installatie via HACS
1. HACS → drie puntjes → **Custom repositories**.
2. Voeg de repo-URL toe, categorie **Dashboard**.
3. Download en herlaad je browser.

De resource wordt geserveerd via `/hacsfiles/solar-layout-card/solar-layout-card.js`.

## Voorbeeldconfiguratie
```yaml
type: custom:solar-layout-card
title: Zonnepanelen dak
reference: 400        # standaard-Wp voor nieuwe panelen
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
| `panels`    | list   | `[]`      | Lijst met panelen. |

**Per paneel:** `id`, `x`, `y` (rastercoördinaten), `orientation` (`portrait`/`landscape`),
`entity` (Watt-sensor), `wp` (piekvermogen van dit paneel, voor de kleurschaal), `label`.

## Ontwikkeling
E�n los `dist/solar-layout-card.js`-bestand, geen build-stap nodig.

## Licentie
MIT — zie [LICENSE](LICENSE).
