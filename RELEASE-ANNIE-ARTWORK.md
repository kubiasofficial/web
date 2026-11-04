# Annie Sky Raven · sjednocení vzhledu

4. listopadu 2026. Nové obrázky připravené lokálně podle dodané referenční tabule. Uživatel výslovně potvrdil zachování **kočky**, včetně malého kočičího medailonu. Modré oči, pihy, černý cop s modrými květy, černý klobouk s modrou stuhou a modrý šátek jsou společné všem novým podobám.

## Finální soubory

- `dist/assets/annie-v2.png` — celá postava s průhledným pozadím pro osobní archiv, úvod lore a postranní portréty.
- `dist/assets/icon-annie-v2.png` — modrý kruhový medailon s kočkou pro výběr postav, galerii, deník, narozeniny, schvalování a další prvky používající původní klíč Sky.
- `dist/assets/annie-scenes-v2.png` — tři stejně vysoké panoramatické řádky: hotel, obchodní stůl, cesta. Modré doplňky a její nový klobouk; bez nových postav a bez přepisování příběhu.
- `dist/assets/postavy-annie-v2.png` — společné pozadí s novým vzhledem Sky v levém panelu a zachovanou kompozicí ostatních postav.

Původní PNG se nepřepisují. `asset-aliases.json` přepojí původní obrazové klíče na nové verze v optimalizovaném manifestu. Vercel zároveň přepisuje původní přímé PNG adresy na nové soubory, aby zůstaly platné také obrázky v Discord kartách; již uložené Discord náhledy se mohou obnovit až po vypršení jeho vlastní cache.

Texty, jméno a soukromé lore se touto vizuální úpravou nemění. Technický klíč postavy `scarlett` zůstává kvůli existujícím účtům, schváleným záznamům a odkazům. Aktuální schválené jméno dál dodává server.

Nasazení: pushnout web včetně všech čtyř nových PNG, optimalizovaných WebP, `asset-aliases.json`, manifestu, verzovaných souborů a `vercel.json`. Nové SQL ani nový Worker nejsou pro tuto vizuální změnu potřeba.

Ověření: **83 automatických testů prošlo**. Chrome ověřil nový medailon ve veřejném výběru, nový portrét v osobním archivu i lore, přepojené pozadí scén a mobil bez vodorovného přetékání. Současně je opravené přebuildování HTML: zdroj obrázku se rozpozná i ze starého optimalizovaného názvu, takže úvodní stránka nezůstává na předchozí podobě medailonu. Jde o lokální testy, nikoli potvrzení produkčního nasazení.

## Generování a zadání

Použit vestavěný **image_gen** podle skillu imagegen; bez CLI a bez API klíče uživatele. Referencí byla uživatelova tabule Annie. Nový celkový portrét sloužil jako společná identitní reference pro další obrázky. Při úpravách medailonu, scén a pozadí byly navíc použity jejich původní soubory jako reference stylu a kompozice.

Sada promptů:

1. **Postava:** samostatná celá osmnáctiletá Annie Sky Raven z dodané tabule, přední tříčtvrteční pohled od klobouku po boty, formát 2:3, skutečná průhlednost; modré oči, pihy, černý cop s modrými pětilistými květy, černý westernový klobouk s modrým páskem a bronzovým konchem, modrý šátek, praktický černý kabátek, kalhoty, boty a pouzdro. Realistický filmový westernový styl, teplé obrysové a chladné modré světlo. Bez textu, prostředí, podlahy, koláže a dalších osob.
2. **Medailon:** upravit původní modrý medailon jen novým obličejem, copem s květy, kloboukem a oblečením podle nového portrétu. Zachovat černou kočku s modrýma očima u ramene a kočičí hlavu v malém dolním znaku, safírový kruh, diamantové ozdoby, modré květy, měsíc a westernové městečko. Čtvercový obrázek s průhledným vnějškem, bez textu.
3. **Scény:** zachovat tři stejně vysoké vodorovné panoramatické pruhy v jednom čtverci podle původního atlasu: hotelová recepce, stůl s mincemi a dopisy, město při západu slunce. Fialové látky/stuhy nahradit kobaltově modrými, přidat drobné modré květy a na stůl její nový klobouk. Zachovat atmosféru, dřevo, kůži, lampy a kompozici. Bez lidí, nápisů a rámečků.
4. **Pozadí:** upravit pouze ženu úplně vlevo podle nového portrétu; zachovat ostatní čtyři tváře, jejich umístění a oblečení, diagonální členění portrétů, zlatý rám, západ slunce, městečko, vlak na mostě, havrana a koně. Stejný široký formát 16:9 a filmový westernový styl. Bez textu a dalších osob.
