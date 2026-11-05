# Atlas – přehledné sdílení celé mapy a upravené kategorie

## Změny

- Kategorie při vytváření, úpravě a filtrování: **Domov, Ranč, Camp, Vzpomínka, Nebezpečí, Jiné**.
- Původní kategorie **Obchod** se převede do **Jiné**. Místa, trasy, poznámky, ikony, fotografie, oblíbené i jejich oprávnění zůstanou zachované. Ikona obchodu zůstává v knihovně ikon.
- Nad mapou je viditelné tlačítko **Sdílení mého atlasu**, fungující i před vytvořením prvního místa.
- Nové okno ukazuje seznam lidí s přístupem k celému vlastnímu atlasu, umožňuje přidat Discord ID a odebrat vybraného příjemce s potvrzením.
- Sdílení celého atlasu dává **pouze čtení všech současných i budoucích vlastních míst, tras a jejich připojených fotografií**.
- Sdílený čtenář nemůže obsah upravovat, mazat ani sdílet dál. Sdílením svého atlasu neposkytne přístup k cizím záznamům, které sám obdržel od jiného hráče.
- Lore a deník mají nadále samostatná oprávnění.
- Původní tlačítko v detailu je nyní **Sdílet tento záznam**. Jednotlivá povolení a povolení celého atlasu se vzájemně doplňují: při odebrání celé mapy mohou zůstat dostupné samostatně sdílené záznamy. Dialog to výslovně vysvětluje.
- API a fotografie ověřují aktuální přístup při každém požadavku; otevřený atlas odstraní odebraný obsah při pravidelné kontrole nejpozději přibližně za 15 sekund, pokud nemá uživatel jiné samostatné povolení.
- Okno sdílení je uzpůsobené telefonu a ovládání klávesnicí. Při opuštění stránky nebo ukončení relace se odstraní.

## Nasazení

1. V existující D1 databázi **ubd-archive → Console** spusť obsah `bot/atlas-sharing-migration.sql`.
2. Aktualizuj Worker `ubd-bot` celým aktuálním `bot/worker.js` a Deploy; proměnné a binding ARCHIVE_DB zachovej.
3. Pushni složku `web` a vyčkej na Vercel. Obnov Atlas.

Migrace je opakovatelná. Převod bývalé kategorie Obchod zvýší revizi dotčených záznamů, aby starší rozepsaná úprava nepřepsala převod bez upozornění.

## Ověření

Prošlo 90 automatických testů. Pokrývají nové i budoucí záznamy, fotografie, nemožnost úprav a dalšího sdílení, izolaci správy vlastních grantů, odebrání přístupu se zachováním jednotlivých povolení, CSRF a opakovatelnost převodu kategorií.

Prohlížečový test ověřil přesné názvy kategorií ve filtru i editoru, přidání a odebrání povolení z dialogu, automatické zpřístupnění nově vytvořeného místa, čtenáře bez možnosti editace, odstranění právě otevřeného obsahu po odebrání přístupu a dialog při šířce telefonu 320 px. Používá lokální Worker a SQLite s testovacími účty, bez změn produkčních dat a bez odesílání Discord zpráv.
