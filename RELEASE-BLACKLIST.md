# Blacklist webových funkcí · 4. listopadu 2026

Stav: připraveno lokálně k ručnímu nasazení. První požadovaný účet je součástí migrace, nikoli tvrzením o již provedené změně na produkci.

- Nová sekce **Správa webu → Blacklist**: Discord ID, interní poznámka, seznam omezených účtů a obnovení přístupu. Potvrzení obou akcí a audit.
- Samostatné delegovatelné oprávnění ke správě blacklistu. Ochrana hlavního vlastníka a vlastního účtu správce.
- Přihlášení omezeného hráče zobrazí samostatnou animovanou kartu s oznámením a kontaktem na vedení Ústavu. Respektuje mobil a omezení pohybu.
- Serverová blokace soukromých webových funkcí a přímých odkazů; vyčištění dříve zobrazených dat. Po obnovení se zachovávají původní přístupy i obsah.
- První účet: **642857462982115357**. Migrační vložení proběhne jen jednou, aby pozdější obnovení nezrušilo opakování instalačního SQL.
- U omezených účtů se potlačí čekající webová Discord upozornění.

## Nasazení

Ověření: všech **74 automatických testů** prošlo. Prohlížeč ověřil také správu blacklistu, omezené přihlášení, aktivní blokaci otevřeného příběhu, přímé odkazy, obnovení přístupu, odhlášení a mobilní rozložení. Náhledy používají výhradně lokální testovací účty; skutečné účty nebyly během testů blokovány.

- [ ] `bot/blacklist-migration.sql` v existující databázi ubd-archive.
- [ ] Aktuální `bot/worker.js` do ubd-bot.
- [ ] Push webu a nasazení Vercel.
- [ ] Ověření prvního záznamu v administraci.

Postup: `../bot/BLACKLIST_SETUP.md`.
