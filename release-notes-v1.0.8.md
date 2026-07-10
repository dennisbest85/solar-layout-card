# Solar Layout Card v1.0.8

Bugfix voor de editor na v1.0.7.

## Opgelost
- Na een eerste bewerking kon je niets meer aanpassen: omvormer toevoegen, een element verplaatsen, verbinden of het merk wijzigen faalde met "Cannot assign to read only property". Oorzaak was dat de config die naar Home Assistant werd gestuurd dezelfde objecten deelde met de werkstatus van de editor; Home Assistant bevriest die config, waardoor de editor daarna niets meer kon wijzigen. De verstuurde config is nu een diepe kopie, dus de editor blijft volledig bewerkbaar.
- Na het tekenen van een verbinding bleef het tweede paneel geselecteerd zodat je niet verder kon tekenen. Dit was een gevolg van dezelfde fout en is nu opgelost: de selectie wordt na elke verbinding gewist.

## Opmerking
Er zijn geen functionele wijzigingen aan de card zelf ten opzichte van v1.0.7; dit is puur een editor-fix.

## Upgraden
Redownload via HACS, herlaad de browser en verwijder zo nodig de .gz-cache in www/community/solar-layout-card/.
