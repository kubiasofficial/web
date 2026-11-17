# Ověření úklidu — 17. listopadu 2026

Ověřený průchod: přihlášení → nabídka účtu / starý odkaz → nové nebo ukončené rozhraní → Worker → SQLite bez herních a ekonomických tabulek → odpověď a vykreslení.

## Automatické kontroly

`npm.cmd --prefix bot test`: **105 testů prošlo, 0 chyb**. Testy odstraněných her a ekonomiky byly vyřazeny společně s jejich implementací; přibyly kontroly bezpečného ukončení služeb a jednoduchých vizitek.

- SQL úklid lze spustit opakovaně, odstraní všech devět vyřazených tabulek i pouze ekonomické události historie.
- Zachovává přístupová práva a historii rozhodování o postavách.
- Staré služby nepřijímají nové hry, nákupy ani odměny: po ověření účtu vracejí 410. Nepřihlášený požadavek stále vyžaduje přihlášení.
- Přihlášení, administrace, deník, lore a vizitka fungují bez odstraněných tabulek.
- Vizitka vrací pouze jméno, avatar, identifikátor účtu a veřejnou identitu jeho postavy. Nevrací lore, inventář, měnu ani herní statistiky.
- Dosavadní kontroly archivu, deníků, schvalování, blacklistu, oznámení, notifikací, atlasu a hudebních funkcí zůstávají úspěšné.

## Skutečný prohlížeč

`node --no-warnings bot/verify-requests.mjs`: **prošlo**. Chrome používá skutečný sestavený web, skutečný Worker a místní SQLite. Pouze Discord API je nahrazené testovacími odpověďmi. Vyřazené databázové tabulky po celou dobu neexistují.

- Odeslání návrhu postavy, jeho zamítnutí správcem, soukromý výsledek hráče a bezpečné vykreslení textu.
- Správcovské přehledy a oprávnění, hledání účtů, blacklist a obnovení přístupu, porovnání návrhů a filtry doručování.
- Mobilní administrace a vizitka, vyčištěná nabídka bez her, obchodu a kalendáře.
- Vysvětlení ukončení pro staré adresy her, obchodu, kalendáře a pokladny.
- Všech 15 místních skladeb v knihovně; skutečné přehrání skladby a pokračování stejného přehrávače při přechodu na vizitku.
- Načtení atlasu s Leaflet mapou, nastavení sezón a vánoční výzdoba bez odkazu na kalendář.
- Žádný požadavek současného rozhraní na vyřazené herní a ekonomické API; žádné běhové chyby.

`node --no-warnings bot/verify-personal-pointers.mjs`: **prošlo**. Šest účtů, vlastní kurzory a stopy, ukládání nastavení, skutečné psaní do editoru, přetahování, omezení množství stop, omezený pohyb, dotykové ovládání, blacklist a odhlášení. Ovládání odstraněné hry už součástí kontroly není.

## Objem a soubory

- Hlavní nekomprimovaný frontendový JavaScript: **298 572 → 208 499 bajtů**, přibližně **o 30 % méně**.
- Sestavený Worker: **309 108 → 249 323 bajtů**.
- Odstraněno přibližně **8,9 MiB** nepotřebných médií a souvisejících souborů; další herní zdroje a samostatné styly byly odstraněny také.
- Ověřena existence všech **69** zbývajících optimalizovaných variant obrázků v manifestu.
- Syntaktická kontrola výsledného JavaScriptu úspěšná.

Místní logy a náhledy jsou v neveřejné složce `.qa/`. Původní soubory jsou v `.private-backups/before-leisure-retirement-2026-11-17`.

## Omezení ověření

Živá databáze, Cloudflare Worker ani Vercel nebyly během úprav změněny. Skutečné Discord zprávy se během testů neodesílaly. Export živé databáze, ruční nasazení a následný SQL úklid zbývají podle místního `bot/RETIRE-GAMES-SHOP-SETUP.md`.
