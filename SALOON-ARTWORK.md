# Ilustrace Herního saloonu

Všech deset obrázků vzniklo vestavěným nástrojem **image_gen**, bez CLI a bez externího placeného API. Originály byly zkopírované do projektu, nejde o odkazy na pracovní adresář generátoru.

## Výsledné soubory

Vše je ve `dist/assets/`:

- `saloon-night.png` — noční New Horizon, základ vstupní stránky a noci.
- `saloon-day.png` — stejné pohraniční město za svítání, denní diskuse.
- `saloon-citizen.png` — obyvatelka s lucernou.
- `saloon-bandit.png` — bandita v černém klobouku a rudém šátku.
- `saloon-sheriff.png` — šerif s odznakem a zatykačem.
- `saloon-doctor.png` — lékařka s koženou brašnou a obvazy.
- `saloon-telegraphist.png` — telegrafista u mosazného Morseova klíče.
- `saloon-dispatcher.png` — výpravčí s hodinkami a signální lucernou.
- `saloon-saloonkeeper.png` — majitelka saloonu za mahagonovým barem.
- `saloon-forger.png` — padělatel s listinami, perem a pečetí.

Web používá optimalizované kopie v `dist/assets/optimized/`: scény 800/1600 px a karty 480/960 px. České názvy a schopnosti se vykreslují jako HTML, aby byly čitelné a přístupné i na telefonu.

## Zadání obrázků

Scény: široký filmový pohled do města na americkém pohraničí v roce 1897, veranda saloonu vlevo, kancelář šerifa vpravo, vodárenská věž a hory v pozadí. Noční varianta: měsíční světlo, indigová obloha a jantarové lampy. Denní varianta: stejná kompozice při teplém ranním světle. Bez textu, rozhraní a lidí v popředí.

Společná šablona promptu karet; místo `[subject]` vložen příslušný popis níže:

> Use case: historical-scene. One premium illustrated secret role card portrait for the social deduction western browser game Night in New Horizon, 1897. Portrait 2:3 vertical composition, same consistent art direction as a collectible luxury western board game. [subject]. Bust to waist portrait centered in upper and middle area, intricate antique brass thin filigree around the very outside edge, dark charcoal lower 20 percent reserved for separately rendered HTML role label. Painterly photorealistic AAA western game concept art, extremely beautiful detailed face and fabrics, cinematic chiaroscuro, weathered leather and paper texture, rich restrained colors, ominous saloon atmosphere. Single character only, no text, no letters, no typography, no UI, no multiple panels, no modern objects.

| Karta | Subject |
| --- | --- |
| citizen | A brave young adult frontier ranch woman in a worn dark hat and work jacket, holding a brass lantern, humble town buildings behind her, warm ivory and muted gold |
| bandit | A dangerous adult outlaw with a black hat and red bandana around neck, one gloved hand resting on holstered revolver, raven and crimson night mist, restrained dark red |
| sheriff | A weathered adult sheriff in a dark leather coat with a prominently visible brass six-point sheriff badge, holding a folded warrant, golden lamplight |
| doctor | An adult woman frontier physician in a dark coat, leather medical bag and clean bandages on a table, caring determined expression, sage teal lamplight |
| telegraphist | An adult telegraph operator in waistcoat and rolled sleeves, hand on a brass Morse telegraph key, tangled telegraph wires and paper messages, steel blue lamplight |
| dispatcher | An adult railway dispatcher with a pocket watch and signal lantern, steam locomotive behind, dark coat and peaked period railway cap, violet and amber lamplight |
| saloonkeeper | An adult charismatic woman saloon proprietor in elegant burgundy waistcoat over cream blouse, polishing a whiskey glass, mahogany bar and amber bottles behind, rich copper gold |
| forger | An elegant adult schemer in dark suit and hat, holding forged documents and an engraved fountain pen near a wax seal, sly subtle smile, plum crimson lamplight |
