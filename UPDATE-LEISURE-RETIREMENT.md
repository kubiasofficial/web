# Úklid kroniky — 17. listopadu 2026

## Změny

- Kompletně odstraněny Ústav rozdává a Ústav ve stáji, včetně místností, chatu, reakcí, odměn, zvuků a výhradně herních obrázků.
- Odstraněn obchod s doplňky, inventář, XP, levely a Ústavní Coiny.
- Odstraněn adventní kalendář a jeho správcovské náhledy.
- Odebrána pokladna, historie měny a ceník z administrace.
- Vyčištěna nabídka účtu, odstraněno načítání ekonomiky při přihlášení a změně stránky.
- Jednoduchá vizitka hráče s jeho postavou, bez herních statistik a placených doplňků.
- Upraveny `/ja` a `/pomoc`; příkazy neodkazují na odstraněné funkce.
- Staré webové odkazy vysvětlují ukončení. Staré herní a ekonomické API po ověření účtu vrací stav 410 a nevytváří nové tabulky ani záznamy.
- Sestavování už nepřipojuje herní služby, katalog obchodu ani generování herních zvuků.
- Připraven transakční a opakovatelný SQL úklid herních a ekonomických tabulek. Na živé databázi se spouští až po exportu zálohy.

Archiv, lore, deníky, povolení, atlas, gramofon, playlisty, hodnocení hudby, osobní kurzory a sezónní atmosféra včetně vánoční výzdoby zůstávají. Měření času na RedM není součástí změny.

Starší poznámky k vydáním jsou historické záznamy, nikoli aktuální nabídka funkcí.

## Návrh oznámení

**Nadpis:** 🧹 Kronika po úklidu — víc prostoru pro naše příběhy

Z webu jsme odstranili **Ústav rozdává, Ústav ve stáji, obchod s předměty a adventní kalendář**. S nimi končí také herní levely, XP a Ústavní Coiny.

🤠 **Tvoje postava zůstává.** Lore, soukromý deník a udělené přístupy dál fungují. Vizitka má jednodušší podobu bez herních statistik.

🗺️ **Atlas i gramofon jedou dál.** Vlastní místa, trasy, písničky, playlisty, komentáře a hodnocení zůstávají dostupné.

🧭 **Přehlednější nabídka a UBD.** Zmizely nepotřebné položky z menu i administrace. `/ja` tě dál dovede k tvému archivu, deníku a žádostem; `/pomoc` odpovídá nové podobě webu.

🌅 **Naše postavy. Naše vzpomínky. Jeden horizont.**

Text je připravený pro zveřejnění po nasazení; automaticky nebyl nikam odeslán.
