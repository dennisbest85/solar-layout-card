# solar-layout-card v1.1.6

## Tijdbalk met historie (nieuw)

Een klok-icoontje naast de zoomknoppen opent een tijdbalk op de card. Daarmee kun je
tot **12 uur terug** in de tijd, in **stappen van 15 minuten**. De panelen en omvormers
tonen dan de opbrengst van dat moment, met de bijbehorende kleuren.

- Klik op het klok-icoontje om de schuif te tonen of te verbergen.
- Sleep de schuif naar links om terug te gaan in de tijd; rechts is "nu (live)".
- Na **30 seconden** zonder interactie keert de weergave automatisch terug naar live.
- De schuif is **alleen voor de weergave** en verandert je configuratie niet.

De historische data komt uit de recorder van Home Assistant en wordt in een keer
opgehaald zodra je de schuif opent. Het slepen leest daarna uit die lokale cache, zodat
het ook bij grote opstellingen soepel blijft. Sensoren waarvoor geen historie beschikbaar
is (bijvoorbeeld als de recorder ze uitsluit) tonen "geen historie".

De tijdbalk-teksten volgen net als de rest van de card de taal van Home Assistant
(Nederlands, Duits, Engels; anders Engels).

## Bijwerken

Werk bij via HACS en doe daarna een harde browser-refresh (of leeg de `.gz` in
`www/community/solar-layout-card/`) als je de wijziging niet direct ziet.
