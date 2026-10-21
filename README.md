# New Horizon RP — kronika postav

Statický český web. `dist/index.html` lze otevřít přímo v prohlížeči.

- Nathaniel má celý dodaný příběh, obrázek, kapitoly, rodinu a stažení originálu.
- Ostatní postavy jsou označené jako připravované. Jejich portréty se nevymýšlejí.
- Originální společný plakát nebyl dostupný jako místní soubor. Až bude dodán, uložte jeho PNG jako `dist/assets/postavy-original.png`; web automaticky použije výřezy pro výběr postav. Pro finální přesné šikmé ořezy a mobilní výběr je potřeba upravit ořezy podle originálu.
- Logo serveru dosud nebylo dostupné v projektu; použit je textový název.
- Po úpravě `dist/assets/nathaniel-james-raven.md` spusťte `python build-lore.py`.
- Volitelný náhled: `python -m http.server 4173 --directory dist`.
- Fonty Google Fonts mají lokální systémové náhrady pro offline režim.
