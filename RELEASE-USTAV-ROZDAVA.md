# Připravená aktualizace: Ústav rozdává

## Řeči u stolu — chat, reakce a odveta

- Soukromý chat pro přisednuté hráče, Discord profilky a jména, čas zpráv a počet nepřečtených. Posledních 100 zpráv zůstává při obnovení stránky i odvetě. Rozepsaný text se při soupeřově tahu nemaže.
- Pět emoji a tři ústavní hlášky v bublinách u hráčů. Krátká životnost, omezení spamování a možnost reakce skrýt.
- Přehled přítomnosti otevřené herní stránky a obnovení spojení. Nejde o Discord online stav.
- Zvětšené vlastní karty včetně vysvětlení účinku a procházení ruky; tlačítko, pravý klik nebo podržení prstu.
- Výsledky partie se skutečnými počty zahraných/dobraných/trestných karet a nachytání, délkou partie a dvěma přezdívkami podle výsledků.
- Odveta až po souhlasu všech zbývajících hráčů; zakladatel následně připraví stůl a rozdá.
- Mobilní chat jako samostatné okno, na počítači vedle stolu. Chat má vlastní revizi a neovlivňuje herní tahy. Historie se nepřenáší znovu při každé nezměněné kontrole.
- Ověřeno 116 serverovými testy a skutečným prohlížečem přes Worker a SQLite: sedm hráčů, posílání zpráv, bezpečné vykreslení textu, reakce, přítomnost, náhled, výsledky, hlasování, historie a telefon.
- Nasazení této aktualizace: `bot/cards-social-migration.sql` do existující D1, sestavený `bot/worker.js` → Deploy a push složky web. Žádné nové proměnné ani binding.

Stav: sestaveno lokálně pro zkušební provoz. Produkční nasazení vyžaduje databázovou migraci, aktualizaci Workeru a publikaci webu podle `../bot/CARDS_SETUP.md`.

## Změny pro hráče

- Nová sekce **Hry** v nabídce účtu.
- **Ústav rozdává**, soukromá karetní hra pro 2–7 hráčů s portréty našich sedmi postav.
- Vytvoření stolu (zatím vlastník webu), pozvánky odkazem/kódem, připravenost a odveta.
- Westernový stůl, karty s čísly, čtyřmi barvami a odlišnými symboly, animace zahrání/dobírání.
- Viditelný aktuální tah, směr hry, barva a serverový časový limit.
- Poslední karta, nachytání zapomenutého hlášení, speciální karty a názorná pravidla.
- 14 krátkých zvukových efektů s nastavitelnou hlasitostí.
- Responzivní ovládání ruky, potvrzení vybrané karty, omezené animace na přání systému.
- Návrat do rozehrané partie po obnovení stránky. Herní data nezpřístupňují soukromé lore ani cizí ruce.

## Co neslibovat v oznámení

Nejde o plné 3D, obsah neobsahuje namluvené postavy. Synchronizace je periodická (ve hře přibližně 1,8 s plus síť), ne okamžitá. Nejsou turnaje, žebříčky, sázky, samostatní počítačoví soupeři ani chat. Komunikace zůstává na Discordu. Existují bezplatné kvóty současného hostingu.

## Návrh oznámení až po nasazení a ověření

**Nadpis:** 🏥 Ústav rozdává — léčba dobráním začíná!

🃏 **Sedm postav. Jeden stůl. A někdo zase bere čtyři.**

Na web přichází nová sekce **Hry** a v ní naše vlastní karetní hra **Ústav rozdává**. Poznáte své postavy na kartách, uslyšíte šustění balíčku a nejspíš zjistíte, komu už nikdy nechcete sedět po levici.

🤠 **Jak přisednout?** Přihlaste se přes Discord, otevřete nabídku účtu → **Hry** a vložte kód nebo otevřete pozvánku. V čekárně potvrďte připravenost. Hrají **2–7 hráčů**, domluva probíhá přes Discord. Zkušební stoly zatím zakládá kubiasofficial.

🔄 Obraty, vynechání, změny barvy, +2 a +4. Pravidla najdete pod **Jak hrát**. Nezapomeňte před předposlední kartou zahlásit **Poslední, pacienti!** Jinak vás může někdo napráskat.

🔊 Hlasitost herních zvuků si nastavíte podle sebe. Na telefonu vyberete kartu a její zahrání potvrdíte. Obnovení stránky vás vrátí ke stolu.

**Ústav rozdává. Následky si vyřešte mezi sebou.** 😂

https://web-mocha-seven-71.vercel.app/#games

## Oprava přehlednosti tahu

- Výrazný panel s profilkou aktivního hráče, jménem, velkým odpočtem a ubývajícím pruhem.
- Aktivní soupeř má štítek NA TAHU a silnější rámeček.
- Vlastní tah má zelený panel, označení TVŮJ TAH a zvýraznění vlastní ruky.
- Jméno právě hrajícího soupeře zůstává také přímo nad vlastními kartami.
- Odpočet při posledních pěti sekundách změní zvýraznění; omezení pohybu zůstává respektované.
- Ověřeno v prohlížeči při partii sedmi účtů a šířkách 320, 390, 768 a 1920 px. Změna je pouze ve webu.

## Oprava tlačítka Poslední, pacienti!

- Původní checkbox šel použít pouze před zahráním předposlední karty. Nahradilo ho skutečné tlačítko.
- Při dvou kartách na vlastním tahu připraví hlášení, které se odešle se zahranou kartou.
- Po odhození předposlední karty lze hlášení doplnit i mimo vlastní tah, dokud je otevřená možnost nachytání.
- Jakmile někdo hráče nachytá nebo naváže dalším tahem, opožděné hlášení server odmítne.
- Obnovení stejného tahu nesmaže připravené hlášení ani vybranou kartu.
- Ověřeno skutečným klikáním v prohlížeči pro hlášení před zahráním i po zahrání a automatickými testy pravidel.
- Nasazení vyžaduje aktualizovaný `bot/worker.js` a push složky web. Nové SQL není potřeba.

## Odstranění hudebního podkresu

- Na základě zpětné vazby byl odstraněn syntetický opakující se podkres včetně přepínače, samostatného posuvníku a automatického spouštění při interakci.
- Dříve uložená preference ud-music se již nečte a podkres se nespustí ani hráčům, kteří ho měli zapnutý.
- Zůstává 14 krátkých herních zvuků s vlastním posuvníkem hlasitosti. Gramofon funguje samostatně jako dosud.
- Stačí publikovat web, změna Workeru ani SQL není potřeba.

## Druhá vizuální podoba balíčku a stolu

- Pět nových samostatných ilustrací: Elijah zastavuje tah, Vincent obrací hru, Daniel podává dvě karty, Annie mění barvu a Nathaniel doručuje čtyři obálky.
- Ilustrace vznikly vestavěným nástrojem image_gen s předlohami současných postav. Promptová sada je v `cards-art-prompts.json`; mapování optimalizovaných souborů v `cards-art.json`.
- Hotové ilustrace jsou v `dist/assets/cards/`, pět WebP souborů o celkové velikosti přibližně 463 KiB. Texty a symboly jsou nadále vykreslené kódem, nikoli součástí obrázků.
- Karty v desktopové ruce mají 150 × 224 px místo 112 × 165 px, detailnější výřezy portrétů, rámy, názvy a výrazné symboly speciálních účinků.
- Ruka je na počítači rozložená do mírného vějíře; na telefonu zůstává rovná a posouvatelná. Vybraná karta vystoupí dopředu. U početné ruky se překryv upraví.
- Stůl má kratší záhlaví, soupeře v oblouku a panel tahu vedle balíčků. Mobil zachovává přehled tahu nad balíčky.
- Výběr a přejetí karty zobrazí její účinek nad rukou. Zahrání se nadále potvrzuje samostatným tlačítkem.
- Speciální tahy krátce zobrazí příslušný účinek: +4 „NÁKLAD DORUČEN“, +2 „ZÁSILKA NAVÍC“, obrat, zastavení a nová barva. Dobrané karty letí k příjemci; obrat otočí šipku směru.
- Efekty neblokují ovládání a respektují nastavení omezeného pohybu. Hudební podkres se nevrací.
- Ověřeno přes skutečný prohlížeč → Worker → SQLite: sedm hráčů, vlastní ruce, výběr barvy, efekt +4, obnova stránky, poslední karta před/po zahrání, mobil/tablet a reduced motion.
- Jde o změnu webu. Pro nasazení stačí push složky web, bez nové databázové migrace či změny Workeru.

## Otevření zakládání stolů všem hráčům

- Každý přihlášený a neblokovaný hráč může založit vlastní stůl. Oprávnění se kontroluje na serveru.
- Odstraněny texty zkušebního režimu; čekárna, pozvánky a oprávnění zakladatele zůstávají soukromé pro daný stůl.
- Každý hráč může založit nový stůl až po opuštění svého aktuálního. Limit současných stolů již nezapočítává opuštěné zavřené stoly.
- Aktualizované testy ověřují zakládání běžnými účty, izolaci stolů, přihlášení, CSRF a blacklist.
- Nasazení: nový `bot/worker.js` → Deploy a push složky web. Databázové schéma se nemění.
- Připravený text Discord oznámení je v `ANNOUNCEMENT-USTAV-ROZDAVA.md`; zveřejnit až po nasazení.
