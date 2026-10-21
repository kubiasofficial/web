# Nasazení na Vercel

Tento projekt je hotový statický web. Nevyžaduje npm, instalaci balíčků ani sestavení. Úvodní soubor je v `dist/index.html`, nikoli v kořeni této složky.

## Pokud Git repozitář obsahuje přímo obsah složky web

- Root Directory: ponechte kořen repozitáře (`.`).
- Framework Preset: Other.
- Soubor `vercel.json` v tomto adresáři nastaví Output Directory na `dist` a vypne instalační i build příkaz.

## Pokud Git repozitář obsahuje celou složku nwhorizont

- Buď nastavte Root Directory na `web` a použije se `web/vercel.json`.
- Nebo ponechte Root Directory v kořeni a nahrajte i kořenový `vercel.json`, který má Output Directory `web/dist`.

Nemíchejte Root Directory `web/dist` s Output Directory `dist` — Vercel by pak hledal neexistující `web/dist/dist`.

Konfigurace musí být v Git repozitáři ve stejné větvi, ze které Vercel nasazuje. Po nahrání opravy spusťte nové nasazení. Příběhy používají adresy s `#`, takže nepotřebují přepisování všech cest na index.html.

Dokumentace: https://vercel.com/docs/project-configuration/vercel-json
