# New Horizon RP — pět příběhů

Čisté HTML/CSS/JavaScript. Otevřete `dist/index.html` v prohlížeči bez instalace a serveru. Funguje i přes file://. Google Fonts mají systémové náhrady pro offline režim.

Dostupné jsou všechny postavy: Nathaniel James Raven, Scarlet Sky Raven, Daniel Thomas Raven, Katharine Jane Hunter a Sophie Cherry. Každá má samostatnou adresu pomocí #jméno, kapitoly, portrét a lore ke stažení. Na mobilu se portréty posouvají vodorovně. Escape vrací k výběru.

Zdrojové příběhy jsou v `dist/assets/*.md`. Po jejich úpravě spusťte `python build-lore.py`. Poznámky k přepisům a nesjednocené rodinné chronologii jsou v `content/`. Původní obrázky v `../obrazky` zůstávají beze změny. Prompty generovaných portrétů jsou v kořeni projektu.

Sophie: uživatel výslovně potvrdil Sophie Cherry, 28 let, 1869, Missouri. Přesný den narození není domýšlen.

## Vizuální čtení

Každý profil má tři vlastní ilustrace, které se vykreslují z řádků původního čtvercového souboru `assets/jmeno-scenes.png` pomocí CSS. Původní bitmapy se neupravují. Obrázky jsou označené jako ilustrace k příběhu. Jejich prompty jsou v `chapter-illustration-prompts.txt`.

Navigace obsahuje portrét, letopočty převzaté z nadpisů, aktivní kapitolu a průběh čtení. Na menších displejích lze obsah rozbalit. Čtenářská lišta umožňuje návrat k postavám i na začátek profilu. Úvodní přechod respektuje systémové omezení pohybu a běžné otevírání odkazů do nové karty.

Soubor `reader.js` doplňuje vizuální vrstvu a `visual.css` čtenářský vzhled. Texty lore zůstávají v původních Markdown souborech.
