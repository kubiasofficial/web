# Připravená aktualizace: Ústav rozdává

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
