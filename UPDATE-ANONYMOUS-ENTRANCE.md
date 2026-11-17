# Anonymní vstup do kroniky — 17. listopadu 2026

## Co se změnilo

- Veřejná úvodní stránka používá dvě nové ilustrace anonymních westernových postav s průhledným pozadím. Nezobrazují členy party.
- Medailony, jména postav, přezdívky a hráčské vizitky se na vstupu nezobrazují. Uprostřed zůstává logo, motto a přihlášení přes Discord.
- Na telefonu je samostatná kompozice s jednou ilustrací pod textem. Na počítači jsou ilustrace po obou stranách.
- Jemný nástup, lehký pohyb pozadí podle kurzoru a mlžný opar. Omezení pohybu v systému se respektuje; na dotykových zařízeních se parallax nepoužívá.
- Prezentační seznam šesti postav přichází až v ověřené relaci. Starý veřejný soubor `public-people.js` a obsluha veřejných hráčských vizitek byly z distribuce odstraněny.
- Po odhlášení se seznam postav vyprázdní. Přístupy k lore a deníkům se dál kontrolují samostatně na serveru.

## Zveřejnění

1. Nahraj aktuální `bot/worker.js` do stávajícího Cloudflare Workeru a dej **Deploy**. Tento krok musí předcházet webu: nová stránka očekává kompletní seznam postav v přihlášené relaci.
2. Pushni změny složky `web` a vyčkej na dokončení Vercel buildu.
3. Obnov stránku přes **Ctrl+Shift+R**. Zkontroluj nový vstup odhlášený, potom přihlášení, vlastní archiv a odhlášení.

Pro tuto úpravu se v D1 nic nespouští. Dřívější vyčištění zrušených her a obchodu je samostatný krok podle svého návodu.

## Ověření

- 106 automatických testů: všechny prošly, včetně anonymního přístupu, sanitizovaného seznamu postav, oprávnění a schválených změn jmen.
- Prohlížeč: šířky 1920, 1440, 1024, 768, 390 a 360 px; načtené ilustrace, viditelné přihlášení a žádné vodorovné přetékání.
- Ověřen přímý anonymní odkaz na postavu, přihlášený archiv s pěti ostatními postavami, skrytí vstupu po přihlášení a vyprázdnění seznamu po odhlášení.
- Prošla regresní kontrola administrace, editoru, schvalování, soukromých rozhodnutí, gramofonu s reálným přehráváním, atlasu a sezónních nastavení.

Testy běžely lokálně s aktuálním Workerem, SQLite a skutečným prohlížečem. Discord API je v těchto kontrolách simulované; živé nasazení se neprovádělo.

## Obrázky

Vygenerováno vestavěným generátorem obrázků. Originály jsou ve složce `obrazky` jako `frontier-visitors-left-v1.png` a `frontier-visitors-right-v1.png`; web dodává průhledné WebP varianty 360, 720 a 1086 px. Přesná zadání jsou v `ENTRANCE-ART-PROMPTS.json`. Mobilní varianta ilustrace má přibližně 50 kB, desktopová 720px přibližně 189 kB.
