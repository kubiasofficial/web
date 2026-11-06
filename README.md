# New Horizon RP — sedm příběhů

Herní saloon: [Noc v New Horizon](SALOON-CHANGELOG.md), hra pro 4–10 lidí s osmi ilustrovanými rolemi. Nasazení vyžaduje `../bot/saloon-migration.sql` a nový Worker podle `../bot/SALOON_SETUP.md`. Zadání a soubory obrázků: [SALOON-ARTWORK.md](SALOON-ARTWORK.md).

Mobilní rozložení: [RELEASE-MOBILE-2.md](RELEASE-MOBILE-2.md). Samostatné portréty, čitelná galerie a mřížka postav, větší ovládání a upravené formuláře. Poslední responzivní vrstva je `dist/mobile.css`.

Aktuální gramofon a sezóny: [RELEASE-SHARED-GRAMOPHONE.md](RELEASE-SHARED-GRAMOPHONE.md). Hudba z místní složky `../pisnicky-gramofon` se připraví přes `node tools/sync-music.mjs` a zveřejní pushem webu. Gramofon je pro všechny přihlášené hráče a hraje na pozadí; sezónní atmosféra je na celém webu. Tato aktualizace nevyžaduje nové SQL ani změnu Workeru.

Osobní deníky: vstup přes ikonu koženého zápisníku, vlastní stránka pro každý deník, editor a samostatné sdílení přístupu. Klientské zdroje jsou `journal-runtime.js` a `polish-runtime.js`, styl `dist/journal.css`. Sestavení: `node ../bot/prepare-web.mjs`. Nasazení vyžaduje databázové doplnění a nový Worker podle `../bot/JOURNAL_SETUP.md`. Texty o aktualizaci jsou v `../bot/UPDATE-JOURNAL.md`.

HTML/CSS/JavaScript s přihlášením přes Discord a serverovým ověřováním přístupů. Veřejný výběr ukazuje pouze medailony a základní představení. Po přihlášení se otevře osobní prostor; celé lore dostane jen vlastník nebo jím povolený čtenář. Kódy byly odstraněné. Nasazení vyžaduje Cloudflare Worker, D1 a OAuth2; přes samotné `file://` soukromé archivy nefungují. Kompletní nastavení je v `../bot/AUTH_SETUP.md`.

Dostupných je všech sedm postav: Nathaniel, Scarlett, Daniel, Katharine, Sophia, Vincent a Elijah. Veřejně není publikovaný Markdown, texty kapitol ani soukromé údaje. Přímé odkazy a stažení lore procházejí stejnou serverovou kontrolou. Sdílení spravuje pouze vlastník přes „Komu důvěřuji“; správce nezískává automatický přístup.

Zdrojové příběhy jsou v `../bot/private/lore/*.md`, data v `../bot/private/profiles.json`. Po úpravě Markdownu spusťte z kořene `python web/build-lore.py`, potom `node bot/build-worker.mjs`. Klientský zdroj je `portal-runtime.js`; sestaví se přes `node ../bot/prepare-web.mjs`. Aktuální testy: `node --test ../bot/worker.test.js ../bot/archive.test.js` a `node ../bot/verify-portal.mjs` ze složky web. Staré kontroly kódových zámků se na novou verzi nevztahují.

Sophia: věk a datum podle výslovně schválených údajů zůstávají zachované. Sebastian je dlouholetý přítel bez příbuzenské vazby; s Danielem se neznají. Sophia a Daniel jsou pouze kamarádi. Aktuální příběh je v `../bot/private/lore/sophie-cherry.md`, předchozí verze zůstává v `content/sophie-original.txt`.

Níže je historie dřívějšího vizuálního vývoje. Pokyny o veřejných lore souborech a kódových zámcích v historických poznámkách již neplatí; rozhodující je nový postup v `../bot/AUTH_SETUP.md`.

## Vizuální čtení

Každý profil má tři vlastní ilustrace, které se vykreslují z řádků původního čtvercového souboru `assets/jmeno-scenes.png` pomocí CSS. Původní bitmapy se neupravují. Obrázky jsou označené jako ilustrace k příběhu. Jejich prompty jsou v `chapter-illustration-prompts.txt`.

Navigace obsahuje portrét, letopočty převzaté z nadpisů, aktivní kapitolu a průběh čtení. Na menších displejích lze obsah rozbalit. Čtenářská lišta umožňuje návrat k postavám i na začátek profilu. Úvodní přechod respektuje systémové omezení pohybu a běžné otevírání odkazů do nové karty.

Soubor `reader.js` doplňuje vizuální vrstvu a `visual.css` čtenářský vzhled. Texty lore zůstávají v původních Markdown souborech.

## Nový společný úvod

Úvodní `assets/arrival.png` je nová společná scéna pěti postav na nádraží. Na počítači jsou jména v jednoduché navigaci pod obrazem. Klikat lze také přímo na postavy. Na mobilu zůstávají velké posuvné výřezy s nenápadnými jmenovkami. Původní `postavy.png` je zachován pro atmosférické pozadí profilů a jako zdrojová předloha. Nový prompt je v `arrival-image-prompt.txt`.

## Medallion opening

The opening uses the five supplied character icons in `dist/assets/icon-*.png`, a typographic New Horizon logo, CSS atmosphere and hover/focus auras. All character hash routes and lore remain available. Mobile uses a two-column layout with Nathaniel first. Reduced-motion preferences disable atmospheric animation.

Run `node verify-medallions.mjs` for browser verification of the new opening, all five lore routes, chapter navigation, focus restoration and responsive layouts. Screenshots are saved in `../.qa/medallions-*.png`.

## Filmové kroniky postav

Všech pět profilů používá společný vzhled v `dist/chronicle.css`. Prostředí úvodu se vykresluje z příslušného souboru `assets/jmeno-scenes.png`: Nathaniel má noční železnici, Daniel stáje, Katharine ranč, Scarlett hostinec a Sophie lesní tábořiště. Barvy navazují na medailony na hlavní stránce. `reader.js` doplňuje medailony, vztahy, atmosféru a jemné nástupy kapitol; respektuje omezení pohybu. Příběhy zůstávají beze změny.

Kontrola `node verify-chronicle.mjs` ověřuje všech pět profilů na čtyřech šířkách, zachování textů, kapitoly, přímé odkazy, medailony vztahů a návrat na hlavní stránku. Náhledy ukládá do `../.qa/chronicle-*.png`.

## Vincent Elias Mercer

Šestá postava má adresu `#vincent`, osobní spis 006, oranžový medailon, vlastní portrét a tři ilustrace v `dist/assets/vincent-scenes.png`. Originál dodaného textu je v `content/vincent-original.txt`; Markdown pro sestavení v `dist/assets/vincent-elias-mercer.md`. Všech osm kapitol, charakteristika i pokyny pro RP jsou zachované. Prompty obrázků vytvořených vestavěným image_gen jsou v `vincent-image-prompts.json`.

Aktuální kontroly: `node verify-vincent.mjs` pro šest medailonů a Vincentův profil na pěti šířkách; `node verify-all-locks.mjs` pro všechny archivní zámky. Starší skripty zachycují předchozí verze webu. Zámky jsou klientské, nikoli serverová ochrana obsahu.

## Animace

`dist/motion.css` a `dist/motion.js` přidávají postupný nástup úvodu, jemné naklánění medailonů, částice a pohyb pozadí pro myš. Profily mají páru, prach, mlhu, světelné částice, listí nebo modrý kouř podle postavy. Odemykání archivu doplňuje záře pečeti a přechod do profilu; chybný kód krátce zavrtí formulářem. Zavření nebo změna adresy probíhající přechod zruší. Na dotykových zařízeních jsou efekty omezené a systémové omezení pohybu vypíná pohyb i čekání na odemčení. Závěry příběhů zůstávají bez nových animací.

`node verify-motion.mjs` ověřuje reakci na myš, všechny efekty profilů, odemčení, přerušení přechodu a omezení pohybu.

## Elijah Cole Walker a sedm medailonů

Elijah (`#elijah`, spis 007) má oranžový medailon s malým znakem německého ovčáka, portrét bez šerifské hvězdy a archivní zámek. Text zachovává osm kapitol, charakteristiku, pět zásad a možnosti RP. Do Dakoty přichází samostatně a službu zákonu si teprve chce zasloužit. Originál je v `content/elijah-original.txt`; publikovaný Markdown v `dist/assets/elijah-cole-walker.md`. Závěrečný redakční komentář zůstává jen v originálu. Obrázky jsou v `dist/assets/icon-elijah.png`, `elijah.png` a `elijah-scenes.png`; prompty vestavěného image_gen v `elijah-image-prompts.json`.

Aktuální náhled úvodu má všech sedm stejně velkých medailonů v jedné řadě. Od šířky 1280 px se vejdou současně, na menších obrazovkách se galerie posouvá dotykem nebo šipkami. Ovládání šipkami respektuje omezení pohybu; pořadí pro klávesnici odpovídá vizuálnímu pořadí. `node verify-elijah.mjs` ověřuje rozložení na šesti šířkách, posouvání, kód, text příběhu, kapitoly, obnovu stránky a návrat. `node verify-all-locks.mjs` ověřuje všech sedm archivů.
