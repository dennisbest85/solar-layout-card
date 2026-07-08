# Solar Layout Card v1.0.3

Nieuwe weergave-opties en een documentatie-fix.

## Nieuw
- **Configureerbare kleuren (Enphase-stijl)**: stel zelf de kleur in voor een paneel dat uit is / geen zon vangt (standaard donkerblauw) en voor maximale opbrengst (standaard lichtblauw). De kleur loopt vloeiend tussen deze twee op basis van de opbrengst t.o.v. de Wp van dat paneel. De tekstkleur in het paneel past zich automatisch aan voor leesbaarheid.
- **Zoomknop**: verklein de hele opstelling van 100% tot 40% zodat een groot dak (bijv. 20 panelen) compact in de card past. De Watt-tekst schaalt mee. De standaard-zoom stel je in de editor in.

## Gewijzigd
- **Realistischer paneelraster**: elk paneel toont nu een 6x10 celraster (10x6 in landscape) in plaats van 8 grove vakken, zodat het meer op een echt zonnepaneel lijkt.

## Opgelost
- De README verscheen niet in HACS door een ongeldige byte in het bestand. README is opnieuw opgeslagen als schone UTF-8.

## Config-voorbeeld
```yaml
type: custom:solar-layout-card
title: Zonnepanelen dak
reference: 400
color_off: "#0b1f3a"   # donker = uit / geen zon
color_max: "#6fc3ff"   # lichtblauw = maximale opbrengst
zoom: 100              # 40 t/m 100
panels:
  - entity: sensor.paneel_1_vermogen   # Watt
    wp: 400
    x: 0
    y: 0
    orientation: portrait
    label: "1"
```
