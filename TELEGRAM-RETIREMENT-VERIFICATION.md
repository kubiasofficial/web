# Ověření zrušení telegramů — 13. 11. 2026

- `npm.cmd --prefix bot test`: **148 testů prošlo**. Pokrývají i dosavadní archiv, deníky, atlas, hudbu, obě hry, ekonomiku a bota.
- Nové a upravené testy: poštovní endpointy 410, ochrana session/CSRF, autorovo rozhodnutí bez přístupu ostatních, schválení/zamítnutí a důvod, zachovaná historie, upozornění na skutečné žádosti, zrušení poštovních DM, převod staré fronty, opakovatelnost migrace a vyčištění a provoz po fyzickém odstranění obou poštovních tabulek.
- `node --no-warnings bot/verify-requests.mjs`: skutečný Chrome → Worker → SQLite. Bez původních poštovních tabulek: menu bez schránky/počítadla, předvolby, návrh hráče, zamítnutí administrátorem, detail autora, ochrana před jiným účtem, escapování důvodu, historické odkazy, administrace bez poštovního oprávnění a mobil 390 × 844.
- `node --check bot/worker.js`, `node --check web/dist/app.js`, `git -C web diff --check`: prošlo.

Lokální doklady: `.qa/retire-telegrams-regression.txt`, `.qa/retire-telegrams-browser.txt`, `.qa/requests-decision-desktop.png`, `.qa/requests-decision-phone.png`. Testy nepoužívají živou D1 ani neodesílají produkční Discord zprávy.

Nasazení, aktuální záloha a závěrečné smazání staré korespondence jsou oddělené ruční kroky v `../bot/RETIRE-TELEGRAMS-SETUP.md`. Implementace zatím nebyla publikována ani spuštěna nad živou databází.
