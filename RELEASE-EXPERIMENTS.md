# Roční období a gramofon · soukromý náhled

Historický záznam. Aktuální rozšíření pro všechny hráče, hudba ze složky a přehrávání na pozadí: [RELEASE-SHARED-GRAMOPHONE.md](RELEASE-SHARED-GRAMOPHONE.md).

4. listopadu 2026. Připraveno lokálně k ručnímu nasazení; zatím pouze pro hlavního vlastníka, bez zapnutí pro hráče.

- Sezónní laboratoř v administraci: jaro, léto, padající podzimní listí a interaktivní zimní sklo s rozmrzáním pod myší/dotykem. Síla efektu, automatická sezóna, obnovení a vypnutí.
- Gramofon vedle Telegramů: nová průhledná ilustrace, výběr z police desek, animované položení a uklizení, skutečné přehrávání s pauzou, přetáčením a hlasitostí.
- Vlastník spravuje názvy, autory, pořadí a zvukové soubory ve webovém formuláři. První deska **Slečna Hunter** připravená; její skutečný zvukový export ještě musí přiložit.
- Suno odkazy slouží k načtení metadat. Pro vlastní přehrávač je potřeba vlastní MP3/WAV; přímý zvuk z uvedeného Suno odkazu Chrome odmítl.
- Mobilní rozložení, ovládání klávesnicí a omezený pohyb. Animace se zastaví mimo náhled, na skryté záložce či při odchodu; žádný zvuk při otevření stránky.
- Serverová ochrana náhledů pouze pro Discord účet **417061947759001600**, kontrola relace a CSRF; blacklist platí i pro nové cesty. Soubory nejsou veřejnou součástí webu.

Ověření: **82 automatických testů**, prohlížečový průchod novinek a kontrola mobilu. Návod, limity, původ ilustrace a postup nasazení: `../bot/EXPERIMENTS_SETUP.md`.

## Checklist nasazení

- [ ] `bot/gramophone-migration.sql` do existující D1 ubd-archive.
- [ ] Aktuální `bot/worker.js` do ubd-bot.
- [ ] Push webu / Vercel.
- [ ] Přiložit vlastní MP3 první skladby a vyzkoušet oba náhledy jako vlastník.
- [ ] Teprve po vyhodnocení náhledů rozhodnout o zpřístupnění hráčům.
