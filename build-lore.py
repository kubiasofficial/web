"""Rebuild private chapter data. Never publish biographies in web/dist."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'bot' / 'private'
profiles = json.loads((root / 'profiles.json').read_text(encoding='utf-8'))
for key, person in profiles.items():
    filename = person['file']
    text = (root / 'lore' / filename).read_text(encoding='utf-8-sig')
    parts = re.split(r'^## (.+)$', text, flags=re.MULTILINE)
    chapters = []
    for index in range(1, len(parts), 2):
        title, body = parts[index].strip(), parts[index + 1].strip()
        if title == 'Cíle na New Horizonu':
            body = re.split(r'\n\s*---', body, maxsplit=1)[0].strip()
        chapters.append({'title': title, 'text': body})
    person['chapters'] = chapters
    print(f'{filename}: {len(chapters)} chapters')
(root / 'profiles.json').write_text(json.dumps(profiles, ensure_ascii=False, indent=2), encoding='utf-8')
print('Run node bot/build-worker.mjs to include the private data in worker.js.')
