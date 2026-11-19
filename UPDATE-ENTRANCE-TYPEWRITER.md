# Nový vstup do kroniky · 19. 11. 2026

## Změny

- Nové souvislé pozadí nádraží za soumraku: lokomotiva, lucerny, hory a koleje. Bez postav, jejich jmen a medailonů před přihlášením.
- Pozadí přes celou šířku okna, bez bočních pruhů a rámování. Mobilní výřez zachovává čitelnost loga, věty a přihlášení.
- Pět střídajících se vět psaných po písmenech. Napsání, 4,2 sekundy na přečtení, krátké rozplynutí a další věta. Pevný prostor pro nadpis drží přihlášení na místě. Bez zvuků.
- Logo s jemnou zlatou aurou, slabý pohyb páry a světla. Před přihlášením neběží sezónní ani vánoční překryvy; nastavení hráče se nemaže a po přihlášení funguje dál.
- Zachované původní zlaté tlačítko uprostřed. Duplicitní přihlášení v hlavičce se nevytváří.
- Jediný časovač psaní se ruší po skrytí stránky nebo přihlášení. Při omezených animacích se celá věta ukáže rovnou, kurzor i atmosférické animace se vypnou. Čtečkám se nabízí stabilní nadpis, nikoli každé nově napsané písmeno.

## Texty

1. Jak začneš dnešní příběh ty?
2. Některé cesty začínají jediným rozhodnutím.
3. Komu dnes svěříš své tajemství?
4. Minulost už nezměníš. Další kapitolu ano.
5. Za obzorem čeká příběh, který ještě nikdo nenapsal.

Texty se upravují v `entrance-runtime.js`. Rozložení je v `entrance.html` a `dist/entrance.css`.

## Obrázek

Vygenerováno vestavěným nástrojem imagegen. Původní PNG je uložený mimo veřejný web v `../obrazky/entrance-station-dusk-v1.png`. Web dostává WebP 800 px (54 kB), 1600 px (173 kB) a 1672 px (187 kB). Zadání je v [ENTRANCE-STATION-PROMPT.json](ENTRANCE-STATION-PROMPT.json). `bot/optimize-images.py` umí tento místní zdroj zahrnout při opětovné optimalizaci.

## Ověření a zveřejnění

Sestavení `node bot/prepare-web.mjs` a kontrola syntaxe prošly. Skutečný Chrome ověřil 1920×1080, 1440×900, 1024×768, 768×1024, 390×844 a 360×740. Kontroly: plná šířka, bez vodorovného přetékání, dostupné přihlášení, odstraněné postavy i přihlášení v hlavičce, dvě po sobě napsané věty, stabilní tlačítko, zastavení při skrytí, omezené animace, soukromý archiv, přístup k lore a odhlášení. Bez chyb JavaScriptu. Test běží na lokálním Workeru a SQLite; produkční Discord se nepoužívá.

Pro zveřejnění stačí commit a push změn složky `web`, dokončení nasazení Vercelu a obnovení stránky. Změna nevyžaduje migraci D1 ani nové nasazení Workeru.

## Krátké oznámení po zveřejnění

**🌅 Nový začátek příběhu**

Vstup do kroniky dostal nové nádraží za soumraku, jemnou záři loga a věty psané jako na psacím stroji. Pozadí nově vyplňuje celou šířku stránky a přihlášení najdete přehledně uprostřed. Vzhled jsme doladili i pro telefony a tablety.

**Jak začneš dnešní příběh ty?**
