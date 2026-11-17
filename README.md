# New Horizon RP — šest příběhů

Soukromá kronika na https://web-mocha-seven-71.vercel.app/ s přihlášením přes Discord.

## Aktuální funkce

- Vlastní archiv postavy, lore a samostatně sdílené deníky.
- Návrhy úprav postav se schvalováním a historií rozhodnutí.
- Atlas s místy, trasami, ikonami a řízeným sdílením.
- Gramofon: místní hudba, přehrávání na pozadí, playlisty, opakování, hodnocení a komentáře.
- Vizitka hráče, osobní kurzory, efekty kliknutí a sezónní atmosféra.
- Administrace, správa oprávnění a blacklist; Discord upozornění od UBD.

Hry, obchod, inventář, herní měna, levely a adventní kalendář byly odstraněny 17. listopadu 2026. Vánoční výzdoba je samostatnou součástí sezón a zůstává dostupná. Měření času na RedM není implementované.

## Sestavení a nasazení

Frontend je v této složce, backend a sestavovací nástroje v sousední místní složce ../bot. Z kořene projektu se sestavuje příkazy:

```powershell
node bot/build-worker.mjs
node bot/prepare-web.mjs
```

Sestavený bot/worker.js se nahrává do Cloudflare Workeru. Push tohoto repozitáře zveřejní frontend na Vercelu. Soukromé lore zůstává na serveru; veřejné soubory jej neobsahují.

Hudbu z ../pisnicky-gramofon připraví node tools/sync-music.mjs spuštěný z této složky. Změny hudebních souborů a knihovny se zveřejní pushem webu.

## Poslední úklid

[Změny a návrh oznámení](UPDATE-LEISURE-RETIREMENT.md). Přesný postup zálohy, nasazení a odstranění starých tabulek je v místním ../bot/RETIRE-GAMES-SHOP-SETUP.md. SQL úklid se spouští až po exportu živé databáze a nasazení nového Workeru i webu.

[Ověření odstranění funkcí](LEISURE-RETIREMENT-VERIFICATION.md).

Starší RELEASE a UPDATE dokumenty zachycují historii projektu; jejich seznamy funkcí nemusí odpovídat současnému stavu.

Nový anonymní vstup: [změny, kontrola a pořadí zveřejnění](UPDATE-ANONYMOUS-ENTRANCE.md). Prezentační seznam postav se nově načítá až po přihlášení; před webem je potřeba nasadit aktuální Worker.
