# Rychlejší kronika a uklizená schránka

Stav: připraveno lokálně k nasazení. Předchozí patch profilové nabídky je již podle uživatele nasazen; oprava klikání byla při auditu potvrzena i na produkčním app.js.

## Pro hráče

- Výrazně menší obrázky, rozměrové varianty pro mobil, postupné načítání a zachovaný původní výtvarný styl.
- Méně mobilních dekorativních animací; efekty mimo obrazovku a skrytou záložku se pozastavují.
- Sjednocené doručování CSS, verzované soubory s cache, písma deníku až při otevření a ikona záložky.
- Stabilnější prostor pro hlavičku a popisky při načítání.
- Opravená ztráta rozepsaného telegramu při přepnutí do jiné záložky. Ochrana při opuštění formuláře a odhlášení.
- Jednotlivé i hromadné mazání příchozích telegramů s potvrzením. Odesílatelova kopie zůstává; smazané zprávy nepřidávají nepřečtené počty ani čekající Discord upozornění.

## Ověření a nasazení

- 67 backendových testů, včetně izolace schránek, oprávnění, CSRF, opakovaného mazání a zastavení upozornění.
- Prohlížeč: veřejný web, skutečné klikání, sedm profilů, deníky, oprávnění, editor, schválení, mobil, koncept a úklid schránky.
- Obrazové varianty úvodu: 20,18 → 1,13 MiB. Původní PNG zachovány.
- [ ] Spustit `bot/telegram-cleanup-migration.sql`.
- [ ] Nasadit aktuální Worker.
- [ ] Pushnout web a ověřit Vercel nasazení.
- [ ] Ověřit mazání a zrychlení v produkci.
- [ ] Teprve po ověření zveřejnit oznámení.

Podrobný postup a limity měření: `../bot/PERFORMANCE_CLEANUP_SETUP.md`.
