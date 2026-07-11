# Solar Layout Card v1.1.3

Kleine bugfix-release.

## Opgelost
- **Legplan hernoemen werkte niet betrouwbaar.** Het hernoemen gebruikte een browser-pop-up
  (`prompt`), die binnen de Home Assistant-editor vaak geblokkeerd of genegeerd wordt. Daardoor
  gebeurde er bij dubbelklikken op een tabblad soms niets.

## Gewijzigd
- Naast het actieve tabblad staat nu een klein **potlood-icoon**. Klik erop om de naam direct
  in het tabblad te wijzigen: Enter of klik-weg om op te slaan, Escape om te annuleren.
  Dubbelklikken op een tabblad start het hernoemen nog steeds ook.

## Compatibiliteit
- Geen wijzigingen aan de config of het opslagformaat; bestaande dashboards blijven werken.

## Installatie / update
1. Werk de card bij via HACS.
2. Doe daarna een harde browser-refresh (of leeg de `.gz`-cache in
   `www/community/solar-layout-card/`) zodat de nieuwe versie geladen wordt.

Maak in GitHub een release aan met de tag `v1.1.3` (schone semver, geen pre-release,
"latest" aan). Een zip-asset is niet nodig; HACS haalt `dist/solar-layout-card.js` uit de tag.
