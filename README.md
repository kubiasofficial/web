# New Horizon RP — šest příběhů

Čisté HTML/CSS/JavaScript. Otevřete `dist/index.html` v prohlížeči bez instalace a serveru. Funguje i přes file://. Google Fonts mají systémové náhrady pro offline režim.

Dostupné jsou všechny postavy: Nathaniel James Raven, Scarlett Sky Raven, Daniel Thomas Raven, Katharine Jane Hunter a Sophie Cherry. Každá má samostatnou adresu pomocí #jméno, kapitoly, portrét a lore ke stažení. Na mobilu se portréty posouvají vodorovně. Escape vrací k výběru.

Zdrojové příběhy jsou v `dist/assets/*.md`. Po jejich úpravě spusťte `python build-lore.py`. Poznámky k přepisům a nesjednocené rodinné chronologii jsou v `content/`. Původní obrázky v `../obrazky` zůstávají beze změny. Prompty generovaných portrétů jsou v kořeni projektu.

Sophie: uživatel výslovně potvrdil Sophie Cherry, 28 let, 1869, Missouri. Přesný den narození není domýšlen.

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
