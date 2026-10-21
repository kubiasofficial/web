"""Build browser-safe character chapter data from the project Markdown files."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
for filename, output, variable in [
    ('nathaniel-james-raven.md', 'lore.js', 'RAVEN_CHAPTERS'),
    ('scarlet-sky-raven.md', 'scarlet-lore.js', 'SCARLET_CHAPTERS'),
    ('daniel-thomas-raven.md', 'daniel-lore.js', 'DANIEL_CHAPTERS'),
]:
    text = (root / 'dist/assets' / filename).read_text(encoding='utf-8-sig')
    parts = re.split(r'^## (.+)$', text, flags=re.MULTILINE)
    chapters = []
    for index in range(1, len(parts), 2):
        title, body = parts[index].strip(), parts[index + 1].strip()
        if title == 'Cíle na New Horizonu':
            body = re.split(r'\n\s*---', body, maxsplit=1)[0].strip()
        chapters.append({'title': title, 'text': body})
    (root / 'dist' / output).write_text('window.' + variable + ' = ' + json.dumps(chapters, ensure_ascii=False) + ';\n', encoding='utf-8')
    print(f'{filename}: {len(chapters)} chapters')
