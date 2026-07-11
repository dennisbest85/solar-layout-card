# Solar Layout Card v1.1.2

Kleine vervolgrelease op 1.1.1 met drie aanpassingen uit de feedback.

## Nieuw
- **Bolletjes aan/uit** — de bewegende bolletjes over de verbindingslijnen zijn nu te
  configureren met de optie `flow_dots` (standaard aan). In de editor zit er een checkbox
  "Bewegende bolletjes" bij de verbindingsopties.
- **Slaap-icoon (Zzz)** — als de zon onder is en een omvormer heeft een sensor die 0 meet,
  verschijnt er een klein slaap-icoon op die omvormer. Dit geldt voor zowel string-omvormers
  als micro-omvormers en is het spiegelbeeld van de rode 0 W-waarschuwing op panelen overdag.

## Gewijzigd
- **Micro-omvormer kleiner** — nu 3 cellen breed en 2 hoog (was 4x3). Het vak volgt daardoor
  de verhouding van de afbeelding en oogt compacter.

## Compatibiliteit
- Bestaande configuraties blijven werken zonder wijzigingen.
- `flow_dots` staat standaard aan en wordt alleen in de config weggeschreven als je het uitzet.
- Het slaap-icoon verschijnt alleen als er echt een sensor is die 0 meet bij zon-onder; zonder
  sensor verandert er niets.

## Let op: dit bestand haalt de repo ook bij
De v1.1.1 JavaScript is destijds niet naar de repo gecommit (alleen de docs stonden op 1.1.1).
Deze v1.1.2-build bevat alle v1.1.1-functies plus het bovenstaande, dus door dit ene
`dist/solar-layout-card.js` te committen loopt de repo weer volledig gelijk.

## Installatie / update
1. Werk de card bij via HACS.
2. Doe daarna een harde browser-refresh (of leeg de `.gz`-cache in
   `www/community/solar-layout-card/`) zodat de nieuwe versie geladen wordt.

Maak in GitHub een release aan met de tag `v1.1.2` (schone semver, geen pre-release,
"latest" aan). Een zip-asset is niet nodig; HACS haalt `dist/solar-layout-card.js` uit de tag.
