# Další patch: profilová nabídka, rodná kronika a upozornění

Stav: dokončeno a ověřeno lokálně, čeká na ruční nasazení. Do produkčního Discordu nebyla odeslána žádná zpráva.

- Horní lišta zobrazuje profilovku a nick. Kliknutí otočí pečeť a vysune sjednocená navigační tlačítka; na mobilu se otevře přehledná nabídka. Zavření kliknutím, mimo nabídku nebo Escape. Ovládání klávesnicí a respektování omezených animací.
- Počet nepřečtených telegramů a červený počet návrhů zůstávají dostupné u zavřené nabídky. Viditelné položky se dál řídí oprávněními.
- Dort vedle deníku otevírá soukromý list rodné kroniky: medailon, jméno, schválené datum, známé místo narození a motto v barvě postavy. Žádné vymyšlené datum ani odpočet podle skutečného kalendáře.
- UBD upozorní Discord DM na nový telegram, rozhodnutí a novou žádost příslušným posuzovatelům. Pouze oznámení s odkazem, bez soukromého obsahu.
- V nabídce Upozornění má každý vlastní přepínače. Upozornění se ukládají do D1, kontrolují aktuální oprávnění, stav přečtení a preference; řeší chyby Discordu a opakované pokusy.
- Původní archiv, samostatná práva k deníkům, editor, schvalování i telegramy zachovány.

## Ověřeno

- 64 automatických testů prošlo, včetně osmi nových testů upozornění a narozenin.
- Prohlížeč: desktop a mobil, nabídka, narozeniny, nastavení, sdílení a odvolání přístupu, všech sedm profilů, deník, editor, schválení, delegace a telegramy. Bez výjimek prohlížeče/backendu.
- Snímky v `.qa/profile-menu-desktop.png`, `.qa/profile-menu-mobile.png` a `.qa/birthday-desktop.png`.

## Zbývá v produkci

- [ ] D1 `bot/notifications-migration.sql`.
- [ ] Nasadit aktuální `bot/worker.js`.
- [ ] Push webu a nasazení Vercel.
- [ ] Cron Workeru `*/5 * * * *` pro doručování odložených zpráv bez návštěvnosti.
- [ ] Ověřit skutečné Discord DM a produkční rozložení.
- [ ] Po ověření publikovat připravené oznámení `bot/update-profile-notifications.txt`.

Návod: `../bot/NOTIFICATIONS_SETUP.md`.

## Hotfix: klikání v rozbalené nabídce

- Nahlášeno po nasazení: viditelná tlačítka nereagovala na běžné kliknutí.
- Příčina: obsluha focusout zavírala nabídku v krátkém okamžiku, kdy prohlížeč přesouval fokus z profilovky na tlačítko. Tlačítko se stalo inertním ještě před dokončením kliknutí.
- Oprava: kontrola cílového prvku přes relatedTarget; při neznámém cíli odložená kontrola po dokončení přesunu fokusu. Přechod uvnitř nabídky ji nezavírá.
- Regresní ověření používá skutečné vstupní události myši a Tab, nikoli pouze programové element.click(). Ověřeny vstupy do telegramů, editoru, správy, archivu, galerie a nastavení upozornění.
- Nasazení hotfixu: pouze push webu na Vercel a Ctrl+F5. Worker ani D1 se kvůli této opravě nemění.
