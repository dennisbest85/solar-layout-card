# Solar Layout Card v1.1.1

Deze release voegt drie zichtbare features toe en houdt bestaande configuraties volledig werkend.

## Nieuw
- **Micro-omvormers** — plaatsbaar naast de gewone omvormers via de knop "+ Micro-omvormer".
  Merken: Enphase, APSystems, Growatt en Hoymiles, elk met een echte, ingebedde afbeelding.
  Ze worden kleiner weergegeven dan de string-omvormers zodat het duidelijk een ander type is.
- **Stromende bolletjes** — er loopt af en toe een klein bolletje langs elke verbindingslijn
  en rust daarna even, zodat het rustig oogt in plaats van een doorlopende stroom.
- **Kleur per verbindingslijn** — elke verbinding in de lijst heeft een kleurkiezer; de kleur
  wordt gebruikt in de editor-preview en de card en opgeslagen in de config (`color`, standaard `#ffd54a`).

## Gewijzigd
- Verbindingslijnen worden nu altijd als pad getekend, zodat de bolletjes de lijn kunnen volgen.
- README uitgebreid met een voorbeeldafbeelding en een overzicht van de micro-omvormers.

## Compatibiliteit
- Bestaande configuraties blijven werken zonder wijzigingen.
- Omvormers zonder `micro` blijven string-omvormers.
- Verbindingen zonder `color` krijgen automatisch de standaardkleur.

## Installatie / update
1. Werk de card bij via HACS.
2. Doe daarna een harde browser-refresh (of leeg de `.gz`-cache in
   `www/community/solar-layout-card/`) zodat de nieuwe versie geladen wordt.

Maak in GitHub een release aan met de tag `v1.1.1` (schone semver, geen pre-release,
"latest" aan). Een zip-asset is niet nodig; HACS haalt `dist/solar-layout-card.js` uit de tag.
