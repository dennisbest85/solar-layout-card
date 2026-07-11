# solar-layout-card v1.1.4

## Toegevoegd
- **Meertalig.** De teksten in zowel de card als de editor volgen nu de taal van Home Assistant (`hass.language`). Ondersteund: **Nederlands, Duits en Engels**. Elke andere taal valt automatisch terug op Engels. De vertaling geldt overal, ook voor losse woorden en tooltips zoals "Slaapt" (Zzz) en "Overdag maar 0 W".

## Gewijzigd
- **"Bewegende bolletjes" beter vindbaar.** Deze checkbox stond in de smalle balk naast het canvas en werd makkelijk over het hoofd gezien. Hij staat nu bij de weergave-opties bovenaan de editor, naast "Afbeelding verbergen" / "Label verbergen" / "Sensor verbergen".

## Blijft werken
- Bestaande configuraties werken ongewijzigd: micro-omvormers standaard uit, verbindingskleur standaard amber, bewegende bolletjes standaard aan (alleen weggeschreven als je ze uitzet).

## Opmerking over de taal
De taal wordt bepaald door de instelling van je Home Assistant-gebruiker. Staat die op iets anders dan Nederlands of Duits, dan zie je de Engelse teksten.

## Bijwerken
1. Werk de card bij via HACS.
2. Doe daarna een harde browser-refresh, of leeg zo nodig het `.gz`-bestand in `www/community/solar-layout-card/`.
