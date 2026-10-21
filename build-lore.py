"""Build browser-safe chapter data from the supplied, unchanged Czech lore."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
text = (root / 'dist/assets/nathaniel-james-raven.md').read_text(encoding='utf-8-sig')
parts = re.split(r'^## (.+)$', text, flags=re.MULTILINE)
chapters = []
for index in range(1, len(parts), 2):
    title, body = parts[index].strip(), parts[index + 1].strip()
    if title == 'Cíle na New Horizonu':
        body = body.split('\n---')[0].strip()
    chapters.append({'title': title, 'text': body})
(root / 'dist/lore.js').write_text('window.RAVEN_CHAPTERS = ' + json.dumps(chapters, ensure_ascii=False) + ';\n', encoding='utf-8')
print(f'Built {len(chapters)} chapters from original lore.')
