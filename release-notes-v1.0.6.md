# Solar Layout Card v1.0.6

Omvormer-afbeeldingen, verbindingslijnen, zoom per legplan en verberg-opties.

## Nieuw
- **Omvormer-afbeeldingen**: GoodWe, SolarEdge, Growatt en Solis worden nu getoond als echte afbeelding met transparante achtergrond. Ze zijn bijgesneden en op een gelijk, iets rechthoekig formaat gezet voor een nette uitstraling.
- **Verbindingslijnen**: trek lijnen tussen panelen onderling en van het laatste paneel naar de omvormer. Zet in de editor "Verbind" aan en klik twee items om ze te koppelen. Per verbinding kies je een rechte of een gebogen lijn (knop recht/gebogen in de lijst, of vink "Gebogen lijn" aan voordat je verbindt).
- **Zoom per legplan**: elk tabblad onthoudt nu zijn eigen zoomniveau.
- **Verberg-opties voor omvormers**: verberg (voor alle omvormers tegelijk) de afbeelding, het label en/of de sensorwaarde.

## Afbeeldingen
De omvormer-afbeeldingen zijn in het JS-bestand ingebed (base64), zodat ze in een gewone HACS-installatie meteen werken zonder losse bestanden of paden. De bronafbeeldingen staan ter referentie in assets/inverter-sources/.

## Config-voorbeeld
```yaml
type: custom:solar-layout-card
title: Zonnepanelen
reference: 400
inv_hide_label: false
inv_hide_sensor: false
inv_hide_image: false
panels:
  - id: a
    entity: sensor.paneel_1
    wp: 400
    x: 0
    y: 0
    orientation: portrait
    label: "1"
  - id: b
    entity: sensor.paneel_2
    wp: 400
    x: 4
    y: 0
    orientation: portrait
    label: "2"
inverters:
  - id: inv
    brand: growatt
    entity: sensor.omvormer
    x: 4
    y: 6
    label: garage
connections:
  - from: a
    to: b
    curved: false
  - from: b
    to: inv
    curved: true
zoom: 100
```

## Upgraden
Redownload via HACS, herlaad de browser en verwijder zo nodig de .gz-cache in www/community/solar-layout-card/.
