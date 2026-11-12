# Ověření — Ústav ve stáji a dohrávání karetního pořadí

Lokální ověření 12. 11. 2026. Produkční nasazení provádí vlastník podle `../bot/STABLE_SETUP.md`.

- `bot/npm.cmd test`: **147 testů, 147 prošlo**. Obsahuje dosavadní funkce webu, souběžné API akce, CSRF, blacklist, testovací omezení, obchodování, dluhy, bankrot, časový konec, pořadí, odměny, idempotenci a simulace pro dva / šest hráčů. Karty ověřují účinky poslední karty, vynechávání hotových hráčů a zachování odměny po odchodu hráče s hotovým místem.
- `node --no-warnings bot/verify-stable.mjs`: skutečný Chrome → skutečný Worker → lokální SQLite. Založení přes formulář, připojení druhého účtu, připravenost, start, hod, nákup koně, odeslání nabídky, přijetí nabídky druhým účtem, reload, mobil 390 × 844, pravidla, první místo ve třech hráčích, divácký režim a konečné pořadí.
- `node --check bot/worker.js` a `node --check web/dist/app.js`: prošlo.
- `git -C web diff --check`: prošlo.
- Vizuálně zkontrolované snímky desky na počítači a telefonu. Deska na PC má limit podle výšky okna; telefon posouvá jen desku a ponechává akce mimo její posuvnou plochu.

Doklady jsou v projektové `.qa/`: `stable-final-tests.txt`, `stable-verified-browser.txt`, `stable-board-desktop.png`, `stable-board-phone.png`, `stable-landing-desktop.png`, `cards-live-places.png`. `.qa` se nezveřejňuje.

Discord přihlášení se v testu nahrazuje platnými lokálními testovacími sessions; živé Discord účty ani produkční D1 nebyly změněny. Reálné herní vyvážení se ještě ověří společným hraním vlastníka a pozvaných hráčů. Nové obrázky a zvuky jsou lokální součástí webu; jejich zdroje popisuje `stable-art-prompts.md`.

## Oprava ovládání majetku

Původní rozhraní nabízelo všechny tři akce i při neúplné skupině nebo nulové úrovni. Odmítnutí serveru se zobrazovalo jen nad deskou mimo aktuální výhled. Reprodukce potvrdila funkční zápis zástavy i vylepšení/prodeje při splněných podmínkách.

Oprava ve webu zobrazuje konkrétní důvody u nedostupných tlačítek: chybějící plemena, zástavy, nerovnoměrné úrovně, nedostatek hotovosti, nevyřešený nákup, dluh nebo cizí tah. Výsledek akce a chyby jsou také přímo u majetku a v dočasném oznámení ve výhledu. Serverová pravidla se nemění.

`node --no-warnings bot/verify-stable-properties.mjs` prošlo: chybějící skupina, nulová úroveň, zástava a vyplacení, vylepšení a prodej se skutečnými změnami hotovosti a majetku v SQLite, blokace zástavy při vylepšení, odmítnutí souběžné změny s viditelným vysvětlením, cizí tah a mobilní rozložení. Doklad `.qa/stable-property-fixed.txt`, snímky `.qa/stable-property-fixed-desktop.png` a `.qa/stable-property-fixed-phone.png`.

Nasazení této opravy: push složky **web**, potom po nasazení obnovit přes **Ctrl+Shift+R**. Worker ani databázové tabulky se kvůli této opravě nemění.
