# Úklid webu a UBD · 19. listopadu 2026

## Připravené změny

- Gramofon byl odstraněn z menu, webového přehrávače, sestavení a Workeru. Web už nenačítá seznam skladeb, audio ani hudební komentáře a playlisty.
- Patnáct publikovaných audio souborů (přibližně 93 MiB) a původní místní hudba jsou přesunuté do soukromé zálohy mimo web.
- Starý odkaz na gramofon zobrazí vysvětlení a nabídne návrat do archivu nebo ateliéru. Staré hudební API po přihlášení vrací 410.
- UBD má šest příkazů: `/ja`, `/postavy`, `/deník`, `/pomoc`, `/sprava`, `/oznameni`. Výběr postav zahrnuje hráče, takže samostatné `/postava` a `/hrac` nejsou potřeba. `/ping`, `/scena`, `/tip` a `/kostka` byly vyřazeny.
- Nápověda je rozdělená na Moje postava, Naše parta, Web a ateliér a oprávněnou Správu. Karty používají medailony, barvy postav a malé logo serveru. Obnova odstraní pouze jmenovitě vyřazené příkazy této aplikace.
- Vlastník má ve správě náhled widgetu New Horizon RP: logo, Vzhůru / Spí a celkový odehraný čas. Náhled jasně označuje ukázkové údaje. Živé měření čeká na propojení se serverem a běžným hráčům se zatím nezobrazuje.

## Nasazení

Podrobný místní postup je v `../bot/RETIRE-GRAMOPHONE-SETUP.md`: export databáze, aktuální Worker, push webu, obnova slash příkazů, potom SQL úklid hudebních tabulek. Změny nejsou zveřejněné pouhým lokálním sestavením.

## Návrh krátkého oznámení po zveřejnění

Lokální ověření: 89/89 automatických testů; skutečný Chrome s lokálním Workerem a SQLite ověřil administraci, omezení, schvalování, žádosti, atlas, sezóny a ateliér. Vyzkoušené šířky náhledu 1920, 768 a 390 px. Odstranění tabulek je testované dvakrát za sebou se zachováním archivu a fotografií. Discord API bylo simulované; žádná produkční zpráva nebyla odeslaná. Sestavení a kontrola syntaxe prošly.

**🧹 Méně tlačítek, přehlednější Ústav.**

Gramofon jsme uklidili a zjednodušili nabídku UBD. Pod **/postavy** teď najdete medailony i hráče, **/ja** vás nasměruje k vlastnímu archivu a deníku. Přehled všeho důležitého otevře **/pomoc**. Příkazy **/scena**, **/tip** a **/kostka** už nejsou dostupné.

📸 Ateliér, 📖 deníky, 🗺️ atlas i soukromé příběhy fungují dál.

🌅 Chystáme propojení s New Horizon RP: stav **Vzhůru / Spí** a celkový čas odehraný za postavu. Zatím je to připravovaná funkce, spuštění oznámíme zvlášť.
