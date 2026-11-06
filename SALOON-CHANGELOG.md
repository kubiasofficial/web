# Herní saloon — Noc v New Horizon

Připraveno 6. listopadu 2026. Nasazení a první společná produkční partie zbývají.

## Přidané funkce

- Nová samostatná hra v nabídce profilu, určená pro 4–10 přihlášených hráčů. Přihlášení přes Discord a blacklist jsou společné se zbytkem webu.
- Soukromé místnosti, pozvánka odkazem i kódem, připojení, návrat do stejné partie, připravenost, nastavení čekárny, odebrání hráče před začátkem a převzetí čekárny při odpojeném zakladateli.
- Automaticky rozdané tajné role, střídání noci, diskuse a hlasování, odpočty podle serveru, noční akce, vyřazení, vyhodnocení vítězství a odveta.
- Osm rolí: Obyvatel, Bandita, Šerif, Doktor, Telegrafista, Výpravčí, Majitel saloonu, Padělatel. Základní a rozšířená sestava podle počtu lidí.
- Veřejný denní chat, soukromý noční chat gangu, chat vyřazených a jednorázový anonymní herní telegram. Herní telegram nepřidává zprávu do běžné pošty archivu.
- Tlačítko **Jak na to?** s cílem hry, pravidly, všemi rolemi, tabulkou sestav, vysvětlením hlasování, odpojení a povinného ticha na Discordu v noci.

## Vizuál a přístupnost

- Deset nově vygenerovaných ilustrací: noční město, denní město a osm karet rolí.
- Zlaté rámy, tmavé dřevo a westernová typografie, animace příchodu a odhalení karty, jemné poletující částice, změna atmosféry mezi dnem a nocí, volitelný zvuk přechodu fáze. Zvuk je výchozím nastavením vypnutý.
- Na telefonu posuvná řada hráčů, dostatečně velké ovládání a čitelné formuláře. Ověřené šířky 320, 390, 768 a 1920 pixelů. Při omezení pohybu v zařízení se animace vypínají.
- Ilustrace se doručují v optimalizovaných WebP kopiích. Původní PNG zůstávají zachované pro další úpravy. Obrazová galerie rolí se načítá postupně.

## Soukromí a provázání

Server posílá vlastní roli pouze jejímu hráči. Gang vidí své členy, město tyto informace nedostává. Odhalování mrtvých lze nastavit v čekárně. Zakladatel nemá výjimku pro zobrazení cizích živých rolí. Po konci se role odhalí všem účastníkům.

Hra nikdy neupravuje lore, věk, vztahy, deník nebo skutečný život RP postav. Discord slouží ke společnému hovoru, web k pravidlům a akcím. Mikrofony se automaticky nevypínají.

## Ověření

Automatické testy pokrývají přihlášení, CSRF, blacklist, kapacitu, souběžné akce, tajnost rolí a chatů, schopnosti, výhry, obnovení partie a expiraci. Prohlížečové ověření používá lokální Worker + SQLite a sedm testovacích účtů. První společná partie po nasazení slouží k ověření skutečných připojení a herního vyvážení.
