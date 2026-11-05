# Atlas – místa, cesty a vlastní symboly

## Co je nové

- **Atlas v nabídce profilu** pro přihlášené uživatele. Původní odkaz z administrace zůstává funkční.
- **Knihovna 48 vektorových ikon** s hledáním bez diakritiky, tematickými skupinami a okamžitým náhledem ve značce. Domovy, ranče, koně, podkovy, železnice, tábory, zvířata, příroda, osobní vzpomínky i zákon.
- **Přesouvání značek:** přetažením při úpravě nebo výběrem nové polohy klepnutím do mapy.
- **Vlastní fotografie:** JPG, PNG a WebP z telefonu nebo počítače. Prohlížeč je převede na JPEG, zmenší na nejvýše 1200 px a 256 kB. Fotografie se ukládají do existující D1 databáze a jsou přístupné jen přes ověřený endpoint.
- **Oblíbené:** vlastní hvězdičky a filtr oblíbených míst i tras. Výběrem záznamu se mapa přesune k cíli.
- **Sdílení:** vlastník povolí čtení konkrétnímu Discord účtu ze serveru; čtenář nemůže obsah měnit ani dál sdílet. Přístup je nezávislý na lore i deníku. Odebrání okamžitě zablokuje nové API požadavky včetně fotografie; otevřený atlas kontroluje změny každých 15 sekund a odebraný obsah odstraní z obrazovky i DOM.
- **Kreslení tras:** 2–100 bodů, název, poznámka, barva, ikona a volitelná fotografie. Jednotlivé body lze přetahovat, přidávat další a vracet poslední bod. Trasy mají stejná pravidla vlastnictví a sdílení jako místa. Jde o ručně kreslené cesty, nikoliv automatickou navigaci po silnicích.
- **Denní a noční mapa:** noční režim upravuje barvy původního podkladu; nejde o další licencovaný zdroj dlaždic. Volba se pamatuje v prohlížeči.
- **Jemné animace:** vysunutí detailu, zvýraznění vybrané značky a krátký příchod uložené značky. Systémové omezení pohybu je respektováno.
- **Telefon a tablet:** velká tlačítka, panel detailu odspodu, místní ikony a optimalizované fotografie. Rozepsaný formulář se při přepnutí záložky uchovává jen v paměti aktuální relace.

## Soukromí a limity

Všechny záznamy jsou nejprve soukromé. Nebyly přidány veřejné značky, živá poloha hráčů ani automatické sdílení všech dat. Omezené účty na blacklistu nemají přístup k Atlasu ani jeho fotografiím. Správce nemá automatický přístup k cizím soukromým místům.

Na účet: nejvýše 250 míst, 100 tras a 100 fotografií. Nepoužité fotografie z opuštěného formuláře se po dni uklízejí při dalším uploadu. Nahrazení fotografie a smazání jejího posledního záznamu uvolní starou fotografii hned.

Mapový podklad zůstává externí ze zdroje Rockstar Games s viditelným kreditem; jeho dostupnost a podmínky nejsou zárukou této aplikace. Původní poznámky ke zdroji jsou v RELEASE-ATLAS-PREVIEW.md. Soukromé značky se poskytovateli dlaždic neposílají, jednotlivé požadavky na dlaždice odpovídají zobrazené oblasti.

## Nasazení

1. V existující D1 databázi `ubd-archive` spusť celý obsah `bot/atlas-upgrade.sql`. Migrace pouze přidává tabulky a indexy, je opakovatelná a zachovává uložená místa.
2. V Cloudflare Workeru `ubd-bot` nahraď kód celým aktuálním `bot/worker.js` a dej Deploy. Zachovej stávající proměnné i binding ARCHIVE_DB.
3. Pushni složku `web`, počkej na Vercel a obnov web. Atlas najdeš v nabídce profilu.

Žádné nové placené úložiště ani externí účty nejsou potřeba. Pro fotografie platí běžné limity existujícího Cloudflare účtu.

## Kontroly

Prošlo 88 automatických testů. Kontrolují izolaci účtů, blacklist, CSRF, souřadnice, ikony, revize, trasy, oblíbené, sdílení a jeho odvolání, ochranu fotografií, limity uploadu a opakovatelnost migrace.

Prohlížečové ověření používá skutečný Chrome, Worker a SQLite s testovacími Discord účty. Ověřeno vytvoření i úprava místa, skutečné přetažení značky a bodu trasy, upload obrázku, hledání ikon, oblíbené, sdílení, čtenář bez možnosti editace, odebrání otevřeného obsahu, ochrana rozepsaných změn a obnovení konceptu. Rozložení kontrolováno při šířkách 320, 390, 768 px i na desktopu. Původní kompletní prohlížečová kontrola webu také prošla. Testy neposílají zprávy hráčům ani nemění produkční databázi.
