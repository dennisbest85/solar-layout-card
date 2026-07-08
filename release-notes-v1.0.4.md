# Solar Layout Card v1.0.4

Editor-verbeteringen en betere leesbaarheid.

## Nieuw
- **Typed zoeken bij sensoren**: begin te typen om te filteren in plaats van door een lange lijst te scrollen.
- **Paneel dupliceren**: knop per paneel die sensor, Wp en staand/liggend meeneemt naar de kopie.
- **Instelbare tekstgrootte**: apart veld (50-200%) om de Watt-tekst groter of kleiner te maken, los van de zoom.

## Gewijzigd
- De Watt-tekst krimpt veel minder hard mee met de zoom, zodat de waarde ook bij 60% goed leesbaar blijft.

## Config-voorbeeld
```yaml
type: custom:solar-layout-card
title: Zonnepanelen dak
reference: 400
color_off: "#0b1f3a"
color_max: "#6fc3ff"
zoom: 100
font_scale: 100       # tekstgrootte in procent (50 t/m 200)
panels:
  - entity: sensor.paneel_1_vermogen
    wp: 400
    x: 0
    y: 0
    orientation: portrait
    label: "1"
```

## Upgraden
Redownload via HACS, herlaad de browser en verwijder zo nodig de .gz-cache in www/community/solar-layout-card/.
