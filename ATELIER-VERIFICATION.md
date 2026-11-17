# Ověření fotografického ateliéru

Lokálně ověřeno 17. listopadu 2026. Provozní nasazení se při vývoji neměnilo.

## Výsledek

- **112 / 112 automatických testů prošlo.** Šest nových testovacích scénářů ateliéru pokrývá autentizaci, CSRF, osobní vlastnictví, odmítnutí nesprávných obrazových dat, limit pěti kopií, opakované uložení, opakovatelnou migraci, výběr kanálů a přepočítávání Discord oprávnění.
- Odeslání přílohy bylo ověřeno vůči simulovanému Discord API, včetně skutečných JPEG bajtů, vypnutých zmínek, opakovaného kliknutí, nejistého výsledku a omezení požadavků.
- Prohlížečová zkouška prošla přes skutečný lokální Worker, SQLite a Chrome. Vybrala místní soubor přes ovládací prvek, vykreslila pět různých podob, všechny tři ořezy, posunutí přetažením a průhledné potrhané okraje.
- Prošel i pixelový náhradní renderer při vypnuté nativní podpoře canvas filtrů.
- PNG se skutečně stáhl; byl ověřen podpis výsledného souboru. Vyvolání ukládalo zmenšené JPEG kopie. Po šestém snímku databáze i šňůra obsahovaly přesně posledních pět.
- Galerie přežila obnovení stránky. Jiný přihlášený účet viděl pouze vlastní výstavku. Odstranění snímku vyžadovalo potvrzení a nezasahovalo do Discord zprávy.
- Výběr kanálu sám nic neodeslal. Teprve potvrzení provedlo multipart požadavek a zobrazilo odkaz na zprávu.
- Zkontrolováno rozložení 1920 px, tablet 768 px a telefon 390 px bez vodorovného přetékání stránky. Mobilní výstavka má vlastní vodorovné posouvání.

## Zbývá po zveřejnění

Spustit migraci, nasadit Worker a web a ručně vyzkoušet jednu fotografii ve vhodném živém Discord kanálu. Žádná fotografie se během místních testů na skutečný Discord neodesílala.

Skripty: `bot/atelier.test.js`, `bot/verify-atelier.mjs`. Postup zveřejnění: `bot/ATELIER-SETUP.md`. Oznámení pro hráče: `web/UPDATE-ATELIER.md`.
