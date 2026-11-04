# Mobilní úpravy kroniky 2.0

4. listopadu 2026. Připraveno lokálně k nasazení pushem webu. Desktop nad 900 px zachovává původní rozložení.

- Osobní archiv má na telefonu samostatný velký portrét a pod ním čitelnou identitu a akce. Žádné jméno ani text přes tvář postavy. Deník, narozeniny a příběh mají větší dotykové plochy.
- Stejné uspořádání pro úvod všech lore: portrét, identita, motto a čtení. Na stránkách lore a deníku se neskládá navíc opakované uvítání. Přehled kapitol začíná na mobilu zavřený a jde rozbalit.
- Veřejný výběr postav je svislá mřížka dvou sloupců. Sedmá postava je vycentrovaná. Odpadá povinné horizontální posouvání a jsou upravené rozměry loga i rozestupy. Hráčův nick je pod medailonem vidět i bez najetí myší.
- Přihlášená galerie postav má na telefonu čitelné karty: medailon vedle jména a hráče, samostatné akce pro příběh, deník a narozeniny. Funguje v galerii i ve výběrovém okně.
- Nabídka pod profilkou má větší tlačítka a vejde se do výšky obrazovky včetně telefonu naležato. Při nedostatku místa se posouvá pouze nabídka.
- Opravené rozložení editoru, přehledu správy, schvalovacích rozdílů, telegramů, deníku a gramofonu. Formulářové prvky mají velikost písma alespoň 16 px a místo pro dotyk. Větší ovládání přehrávače na pozadí.
- Méně rušivých dekorativních efektů na mobilu, jemnější sezónní vrstva a zachované nastavení omezeného pohybu.

Nová poslední vrstva stylů je `dist/mobile.css`, zapojená do verzovaného CSS balíčku přes `../bot/build-delivery.mjs`. Mobilní sbalení obsahu je v `polish-runtime.js`. Sestavení: `node ../bot/prepare-web.mjs` ze složky web. Bez nového SQL nebo Workeru.

Ověření: skutečný Chrome v rozměrech **320 × 740, 360 × 780, 390 × 844, 430 × 932, 768 × 1024 a 844 × 390**. Kontrola přetékání, oddělení portrétu a textu, nabídky, výběru postav, lore, deníku, gramofonu, správy, editoru a telegramů. Prošel také celý původní prohlížečový průchod a **83 automatických testů**. Lokální testovací účty; produkční data a zprávy se nemění.
