# Osobní kurzory a stopy – patch k verzi 3.0

Připraveno 12. 11. 2026. Lokální implementace; zveřejní se pushem složky `web` a dokončením nasazení Vercel. Pro tuto úpravu není potřeba SQL migrace ani nové nasazení Workeru.

## Co se změnilo

| Účet | Motiv | Barevnost a detail |
| --- | --- | --- |
| Graciie04 | Kočka | Modrá, stříbrná, uši a drobný květ na kurzoru; kočičí tlapka |
| kubiasofficial | Havran | Vínová a světlá hrana; peří a havraní pařát |
| Eidík | Panter | Měděná a jantarová; drápy na kurzoru a kočičí stopa s drobnými jiskrami |
| Safík Alex | Vlk | Ledově modrá, horský detail, vlčí tlapa s námrazovým ornamentem |
| BuFu | Drak | Safírová a stříbrná; šupiny, dračí dráp a modrý plamen |
| mata20_official | Německý ovčák | Koženohnědá a jantarová; psí tlapka a drobný prach |

Motiv se vybírá podle vlastní postavy z ověřené Discord relace. Návštěva cizího příběhu jej nemění. Hosté, účty bez přiřazené postavy a omezené účty používají běžné ovládání.

Kliknutí zanechá jednu drobnou stopu, která přibližně za půl sekundy zmizí. Při rychlém klikání je počet omezený na šest stop současně. Nevzniká souvislá stopa za pohybem myši a nejsou přidané zvuky.

## Kde to najít

**Profilka vpravo nahoře → Nastavení → Vzhled a efekty.**

- Vlastní kurzor: ve výchozím stavu zapnutý pro myš.
- Efekt kliknutí: ve výchozím stavu zapnutý.
- Efekty při dotyku: ve výchozím stavu vypnuté; lze zapnout pro telefon, tablet a pero.
- Tlačítko **Vyzkoušet stopu** ukáže motiv přímo v dialogu.
- Změny se ukládají automaticky **v daném prohlížeči, odděleně pro každý Discord účet**. Nepřenášejí se automaticky na jiný přístroj. Při nedostupném místním úložišti fungují volby během aktuální návštěvy.

Při psaní se používá běžný textový kurzor, posuvníky a přetahování zachovávají nativní ovládání. V místnosti karetní hry jsou osobní kurzor i běžné otisky vypnuté. Při omezeném pohybu stopa pouze vybledne, bez zvětšování. Při opuštění okna nebo skrytí záložky se efekty uklidí.

## Provedení a ověření

Kurzor vykresluje přímo prohlížeč; nepoužívá neustálý animační cyklus ani skrytí systémového kurzoru pomocí `cursor:none`. Celkem 18 malých vektorových souborů (normální kurzor, aktivní kurzor a stopa pro šest motivů) má dohromady přibližně 15 kB. Aktivní ukazatel má drobný světlý bod pro rozeznání klikatelného prvku. Efekt neblokuje tlačítka a má omezenou dobu existence.

Zdroj: `pointer-runtime.js`, `dist/pointer.css`, `tools/build-pointer-art.mjs`. Sestavení přes `bot/prepare-web.mjs` generuje grafiku a přidává modul do verzovaného balíčku webu.

Ověřeno lokálně přes skutečný Worker a SQLite: přiřazení všech šesti účtů, načtení SVG, otisky i uvnitř dialogu, přepínače, uložení po obnovení, oddělení nastavení účtů, psaní skutečného telegramu, přetahování, omezení rychlého klikání, omezený pohyb, skutečná karetní místnost, mobilní dotyk a posouvání, blacklist a odhlášení. Konzole bez chyb. Dosavadní sada `npm.cmd test`: **126/126**.

## Návrh oznámení po zveřejnění

**Nadpis:** 🐾 Tvůj kurzor. Tvoje stopa. Nový osobní detail na webu!

Každý z naší šestice teď dostává vlastní kurzor a krátký efekt kliknutí podle motivu své postavy. Kočičí a vlčí tlapky, havraní pařát, panter, ovčák i dračí stopa — stačí se přihlásit a motiv se vybere automaticky.

👉 **Profilka → Nastavení → Vzhled a efekty**

Tady si zvlášť zapneš nebo vypneš vlastní kurzor a otisky. Na telefonu jsou stopy volitelné; posouvání stránky je nevytváří. Tlačítkem **Vyzkoušet stopu** si svůj efekt prohlédneš.

Při psaní a u karetního stolu zůstává běžné ovládání. Všechno je bez zvuků a svůj základní motiv máte zdarma. Volby si pamatuje aktuální prohlížeč pro váš účet.

🌅 Šest osudů. Šest vlastních stop.
