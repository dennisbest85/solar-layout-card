# Changelog

Alle noemenswaardige wijzigingen aan deze card worden hier bijgehouden.
Formaat volgt [Keep a Changelog](https://keepachangelog.com/) en
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-07-10
### Toegevoegd
- De editor-grid groeit nu automatisch mee met grote legplannen. Panelen en omvormers die verder weg staan vallen niet meer buiten het raster; tijdens het slepen groeit het canvas live mee zodat er altijd ruimte is.
### Gewijzigd
- De Sunsynk-afbeelding (en de andere omvormers) zijn strakker bijgesneden en met minder marge geplaatst, zodat ze het vlak beter vullen.

## [1.0.8] - 2026-07-10
### Opgelost
- Na een eerste bewerking kon je niets meer aanpassen (omvormer toevoegen, verplaatsen, verbinden of merk wijzigen gaf "Cannot assign to read only property"). Oorzaak: de config die naar Home Assistant ging deelde objecten met de werkstatus van de editor, die Home Assistant vervolgens bevriest. De verstuurde config is nu een diepe kopie, zodat de editor bewerkbaar blijft.
- Na het tekenen van een verbinding bleef het tweede item geselecteerd; door bovenstaande fix wordt de selectie nu correct gewist zodat je door kunt tekenen.

## [1.0.7] - 2026-07-10
### Toegevoegd
- Sunsynk toegevoegd als omvormermerk (met afbeelding, ingebed in het JS-bestand).
### Gewijzigd
- Verbindingslijnen liggen nu achter de panelen/omvormers in plaats van eroverheen.
- De "Verbind"-knop is vervangen door een potlood-icoon met een ingekleurde (actieve) staat.
### Opgelost
- Typen in het Wp-veld van een paneel en in het omvormer-label werkte niet vloeiend (venster sprong / typen stopte bij elke letter). De editor herbouwt nu niet meer bij elke toetsaanslag.

## [1.0.6] - 2026-07-10
### Toegevoegd
- Omvormers tonen nu een echte afbeelding (GoodWe, SolarEdge, Growatt, Solis) met transparante achtergrond, uniform bijgesneden op gelijk formaat. Afbeeldingen zijn ingebed in het JS-bestand.
- Verbindingslijnen tussen panelen onderling en van paneel naar omvormer. Per verbinding te kiezen: rechte lijn of gebogen (boog). Tekenen via een verbind-knop.
- Zoom is nu per legplan instelbaar (elk tabblad onthoudt zijn eigen zoom).
- Instelling om voor alle omvormers de afbeelding, het label en/of de sensorwaarde te verbergen.
### Gewijzigd
- Layout-tabbladen kunnen hernoemd worden (dubbelklik), standaardnamen blijven Layout1, Layout2, ...
- Omvormerblok is iets rechthoekiger (portrait) voor een nettere uitstraling van de afbeeldingen.

## [1.0.5] - 2026-07-10
### Toegevoegd
- Meerdere legplannen via tabbladen (standaard Layout1, Layout2, ...). Bij een enkel legplan blijven de tabbladen verborgen en verandert er niets. Legplan toevoegen, hernoemen (dubbelklik op tab) en verwijderen in de editor.
- Omvormers plaatsbaar in het legplan met merkkeuze: GoodWe, SolarEdge, Growatt, Solis. Optioneel een sensor koppelen om het vermogen te tonen. (Eigen afbeeldingen kunnen later worden toegevoegd.)
- Rode waarschuwing op een paneel dat overdag 0 W meet (op basis van sun.sun). 's Nachts of zonder geldige meting verschijnt de waarschuwing niet.
### Opmerking
- Bestaande configuraties met een enkel legplan blijven ongewijzigd werken; de config wordt pas naar het layouts-formaat omgezet zodra je een tweede legplan toevoegt.

## [1.0.4] - 2026-07-08
### Toegevoegd
- Typed zoeken in de sensorkeuze: begin te typen om te filteren in plaats van te scrollen.
- Paneel dupliceren: kopieert sensor, Wp en staand/liggend naar het nieuwe paneel.
- Instelbare tekstgrootte (font_scale) in de editor, los van de zoom.
### Gewijzigd
- De Watt-tekst krimpt veel minder hard mee met de zoom, zodat de waarde ook bij 60% leesbaar blijft.

## [1.0.3] - 2026-07-08
### Toegevoegd
- Configureerbare kleurschaal (Enphase-stijl): een instelbare kleur voor "uit / geen zon" (standaard donkerblauw) en voor maximale opbrengst (standaard lichtblauw). De paneelkleur loopt vloeiend tussen beide op basis van opbrengst t.o.v. Wp.
- Tekstkleur in het paneel past zich automatisch aan (donker of licht) voor leesbaarheid.
- Zoomknop op de card: van 100% tot 40% om grote opstellingen compacter te maken. Standaard zoom is instelbaar in de editor.
### Gewijzigd
- Realistischer paneelraster: 6x10 celraster (10x6 in landscape) i.p.v. 8 vakken, zodat een paneel meer op een echt zonnepaneel lijkt.
### Opgelost
- README werd niet weergegeven in HACS door een ongeldige byte (kapot teken) in het bestand. README is nu opgeslagen als schone UTF-8/ASCII.

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
