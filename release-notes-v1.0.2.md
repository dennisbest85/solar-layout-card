# Solar Layout Card v1.0.2

Per-paneel Wp.

## Nieuw
- **Wp per paneel**: elk paneel heeft nu een eigen Wp-veld in de editor. Meng gerust 400 Wp- en 370 Wp-panelen; de kleurschaal (opbrengst in Watt gedeeld door Wp) klopt dan per paneel.

## Gewijzigd
- Het globale referentieveld heet nu "Standaard Wp voor nieuwe panelen" en wordt alleen gebruikt als startwaarde bij het toevoegen van een paneel.
- Panelen uit een oudere config zonder `wp` erven de globale referentiewaarde, dus na upgraden ziet alles er hetzelfde uit tot je individuele waarden aanpast.

## Config-voorbeeld
```yaml
type: custom:solar-layout-card
title: Zonnepanelen dak
reference: 400            # standaard-Wp voor nieuwe panelen
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
    orientation: portrait
    entity: sensor.paneel_2_vermogen   # Watt
    wp: 370
    label: "2"
```

## Upgraden
Redownload via HACS, herlaad de browser en verwijder zo nodig de `.gz`-cache in `www/community/`.
