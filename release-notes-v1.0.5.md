# Solar Layout Card v1.0.5

Meerdere legplannen, omvormers en een 0W-waarschuwing.

## Nieuw
- **Tabbladen voor meerdere legplannen**: maak aparte plannen voor bijvoorbeeld je huis, schuur of tuin. Heb je maar een legplan, dan blijft alles zoals het was (geen tabbladen). In de editor voeg je een legplan toe met "+", hernoem je het via dubbelklik op de tab, en verwijder je het huidige plan.
- **Omvormers in het legplan**: plaats een omvormer en kies het merk (GoodWe, SolarEdge, Growatt, Solis). Je kunt optioneel een sensor koppelen zodat het vermogen in het blok verschijnt. Eigen afbeeldingen per merk kunnen later worden toegevoegd.
- **0W-waarschuwing overdag**: als de zon boven de horizon staat (sun.sun) en een paneel meet 0 W, verschijnt een rood uitroepteken op dat paneel. 's Nachts of zonder geldige meting blijft het weg.

## Compatibiliteit
Bestaande configuraties met een enkel legplan blijven werken zonder wijziging. De config schakelt pas over op het layouts-formaat zodra je een tweede legplan toevoegt.

## Config-voorbeeld (meerdere legplannen)
Standaard heten de tabbladen Layout1, Layout2, enzovoort. Je kunt ze hernoemen (dubbelklik op de tab); hieronder een voorbeeld met eigen namen.
```yaml
type: custom:solar-layout-card
title: Zonnepanelen
reference: 400
color_off: "#0b1f3a"
color_max: "#6fc3ff"
zoom: 100
font_scale: 100
layouts:
  - name: Huis
    panels:
      - entity: sensor.paneel_1_vermogen
        wp: 400
        x: 0
        y: 0
        orientation: portrait
        label: "1"
    inverters:
      - brand: goodwe
        entity: sensor.omvormer_vermogen
        x: 0
        y: 6
        label: garage
  - name: Schuur
    panels:
      - entity: sensor.schuur_1
        wp: 370
        x: 0
        y: 0
        orientation: portrait
        label: A
```

## Upgraden
Redownload via HACS, herlaad de browser en verwijder zo nodig de .gz-cache in www/community/solar-layout-card/.
