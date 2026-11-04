# Gramofon pro všechny a sezónní vzhled · 4. listopadu 2026

Připraveno lokálně k nasazení. Tato aktualizace nahrazuje předchozí soukromý náhled; popis v `RELEASE-EXPERIMENTS.md` zachycuje původní verzi.

- **Hudba na pozadí:** přehrávač už není součástí rušeného obsahu stránky. Pokračuje při pohybu mezi archivem, příběhy, deníkem, telegramy a dalšími stránkami i po přepnutí záložky. Po návratu se zachová skladba, pozice a hlasitost. Malý přehrávač mimo gramofon umožní pauzu, pokračování, vypnutí a návrat do místnosti.
- **Bez Suno odkazů:** společná sbírka vzniká ze skutečných zvukových souborů ve složce `../pisnicky-gramofon`. Připravené tři skladby: **Když havran zakráká**, **KRÁLOVNA MASEK**, **Slečna Hunter**. Přehrává se skutečné MP3, nikoli iframe nebo vzdálený chráněný stream.
- **Pro všechny hráče:** Gramofon a Roční období jsou v nabídce všech přihlášených účtů. Role správce se nevyžaduje. Odhlášení, změna účtu, ztráta ověření relace a blacklist přehrávač vyčistí. Soukromá data se při skrytí záložky nadále odstraňují; hudba na nich nezávisí.
- **Sezóny na celém webu:** automaticky dle měsíců v Praze i pro návštěvníky. Jaro a léto mají jemné světlo a částice, podzim občasné listí, zima námrazu rozmrzající pod myší a dotykem. Přihlášení hráči mají vlastní volbu sezóny, intenzity nebo vypnutí pro daný prohlížeč.
- **Výkon:** žádné načítání zvuku před otevřením gramofonu a volbou skladby, jeden audio element, zastavení animací skryté záložky, omezený počet částic a vykreslování kolem 24 snímků/s. Respektování omezeného pohybu a průchozí vrstva bez blokování tlačítek. MP3 mají obsahové hashe a dlouhou CDN cache; manifest sbírky se znovu ověřuje.

## Nasazení

Tentokrát stačí **push webu do Vercelu**, včetně všech souborů `dist/music`, `dist/music-library.json`, runtime souborů, nástroje `tools/sync-music.mjs`, verzovaných JS/CSS a `vercel.json`. Nové SQL ani změna Workeru nejsou pro tento přehrávač potřeba. Staré soukromé uploady v D1 se automaticky nemažou a nový přehrávač je nepoužívá.

Hudební soubory jsou veřejnou součástí nasazení webu. Složka na PC není živě připojená ke vzdálenému Vercelu. Po každé změně spusť z kořene projektu `node web/tools/sync-music.mjs` (nebo **Aktualizovat-pisnicky.cmd**) a pushni web. Volitelný `--watch` sleduje místní složku a připravuje změny pro push. Vercel checkout bez původní místní složky zachová již připravenou sbírku.

Omezení: zavření či úplné obnovení stránky přehrávání ukončí. Na mobilu může běh na pozadí pozastavit operační systém; web sám při přepnutí záložky hudbu nevypíná. Přehrávání začíná výhradně po kliknutí.

## Ověření

- **83 automatických testů**: původní backend a nový test synchronizace, změn obsahu, názvů s diakritikou, odebrání skladeb a bezpečného zachování připravené sbírky.
- Skutečný Chrome + lokální Worker a SQLite: běžný hráč, všechny tři reálné MP3, pauza, přetáčení, hlasitost, hudba při čtení vlastního lore a skryté záložce, opětovné otevření bez resetu, mini přehrávač, mobil, odhlášení. Sezóny globálně, rozmrazování, průchozí tlačítka, perzistence vypnutí po obnovení a automatický podzim.
- Regresní kontrola archivu, práv, deníku, editoru, správy, telegramů a blacklistu.
- Produkční účty, databáze ani oznámení se při ověřování nemění.
