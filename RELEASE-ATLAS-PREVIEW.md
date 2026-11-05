# Atlas pohraničí – soukromý náhled

Nová stránka **Pro správu webu → Atlas · náhled**. Přístup má pouze hlavní vlastník s Discord ID `417061947759001600`, ověřovaný na serveru. Delegované administrátorské role přístup nezískávají.

## Funkce připravené k vyzkoušení

- Skutečný mapový podklad RDR2, posouvání, zoom a dotykové ovládání.
- Přidání bodu tlačítkem a klepnutím do mapy.
- Název, poznámka, druh místa, barva a volitelný HTTPS odkaz na fotografii.
- Kategorie: domov, ranč, obchod, tábor, vzpomínka, nebezpečí, jiné.
- Hledání v názvech i poznámkách, filtr kategorií, návrat na přehled mapy.
- Trvalé uložení do D1, úpravy, mazání s potvrzením. Kontrola revize chrání před přepsáním novější úpravy.
- Na telefonu mapa nad seznamem a detail vysunutý odspodu. Ovládání klávesnicí a omezení animací podle systémové preference.
- Atlas ani jeho mapový prohlížeč se nenačítají na úvodní stránce. Při opuštění stránky se mapové posluchače a instance odstraní.
- Ochrana rozepsaného místa při změně stránky.

V této fázi jsou všechna místa soukromá. Sdílení, veřejná místa a schvalování veřejných bodů nejsou zapnuté. Fotografie se zadává odkazem, přímé nahrávání souborů není součástí náhledu. Živá poloha hráčů není připojena.

## Nasazení

1. V D1 `ubd-archive` spusť obsah `bot/atlas-migration.sql` (začíná CREATE TABLE; bez komentářového řádku).
2. Nahraď kód Workeru `ubd-bot` celým aktuálním `bot/worker.js` a dej Deploy. Stávající proměnné a binding ARCHIVE_DB zachovej.
3. Pushni změny repozitáře `web`. Vercel zveřejní připravený frontend.
4. Přihlas se jako vlastník, otevři Pro správu webu → Atlas · náhled. Přidej místo, obnov stránku, uprav ho a vyzkoušej smazání.

## Mapový podklad a knihovna

- Pro náhled se načítají pouze zobrazené dlaždice přímo z `https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg`. Na mapě zůstává kredit Rockstar Games. Herní obrázky nekopírujeme do repozitáře.
- Zdroj adresy a souřadnicového rozsahu: https://github.com/jeanropke/RDR2CollectorsMap/blob/master/assets/js/map.js . Používáme vlastní UI a vlastní značky, nepřebíráme cizí seznamy lokací.
- Dostupnost veřejného zdroje není zárukou služby ani udělením licence k herním obrázkům. Před rozšířením hráčům je potřeba dořešit podmínky mapového podkladu; preview je závislé na externím zdroji. Při výpadku se zobrazí upozornění, uložená místa zůstanou v D1.
- Leaflet 1.9.4 je lokálně v `dist/vendor/leaflet/`, včetně licence BSD-2-Clause. Jeho JS a CSS se načítají až po otevření Atlasu. https://leafletjs.com/reference-1.9.4.html

## Ověření

- 85 automatických testů backendu včetně nové kontroly přístupu, CSRF, validace souřadnic a fotek, ukládání, revizí a mazání.
- Skutečný Chrome + Worker + SQLite: vlastník otevře atlas, uloží a upraví místo, vyhledá ho, smaže a opustí mapu; jinému účtu je vstup zamítnut.
- Kontrola přetečení při šířkách 320, 390 a 768 px a zobrazení na desktopu.
- Lokální testování používá testovací Discord relace. Žádné zprávy hráčům ani změny produkční databáze se při testech neposílají.
