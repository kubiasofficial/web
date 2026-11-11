# Nástupiště New Horizon a osobní hudební sbírka

Připraveno 11. 11. 2026. Záznam změn pro následné oznámení; nezveřejňovat před nasazením.

- Nová veřejná vstupní stránka: originální noční nádražní ilustrace se šesti postavami, logo, výrazný vstup přes Discord, čitelné medailony a hráči. Lehká pohyblivá pára, barevné aury a samostatné rozložení pro telefon a tablet. Omezení pohybu podle nastavení systému.
- Aktualizovaná sestava webu i Discord bota. Odebrané obrázky, medailon, profil, soukromé lore a původní společné fotografie byly staženy z aktuálního publikovaného balíčku. Počty a nabídky odpovídají šesti postavám. Zbývajícím příběhům se nevymýšlí nové události.
- Ústav rozdává: šest zbývajících portrétů, původních 108 karet a pravidla. Převod starých partií zachová ostatní ruce a při odchodu předá tah i zakladatelství.
- Opakování: vypnuto, jedna skladba nebo celý playlist. Navazující přehrávání funguje i mimo stránku gramofonu, dokud web zůstává otevřený.
- Vlastní playlisty uložené k Discord účtu: založení, pojmenování, přidávání ze sbírky, změna pořadí, odebírání skladeb, přejmenování a smazání. Žádné sdílení osobních playlistů mezi účty.
- Zachované hodnocení, komentáře, hlasitost, přetáčení a přehrávač na pozadí.
- Nejde o novou placenou službu. Playlisty používají existující Worker a D1; přehrávání využívá dosavadní místní hudební soubory.

Nasazovací postup a interní vyčištění účtu: `../bot/UPGRADE-SIX-SETUP.md`.

Ověření: 120 serverových testů, integrační průchod UI → Worker → SQLite, skutečné MP3 přehrávání včetně opakování a navázání na jiných stránkách, soukromí playlistů mezi účty a rozložení v šířkách 1920, 768, 390 a 320 px. Herní průchod zahrnuje sedm míst, ruce, tahy, poslední kartu, chat, reakce, výsledky a odvetu. Vyčištění SQL bylo ověřeno samostatně na místní databázi se zachováním karet a platným tahem v obou směrech hry.
