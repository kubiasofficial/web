const dialog = document.getElementById('lore-dialog');
const notice = document.getElementById('notice');
let noticeTimer;
function escapeHTML(text) { return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function inline(text) { return escapeHTML(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'); }
function blocks(text) {
  return text.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^- /.test(line))) return '<ul>' + lines.map(line => '<li>' + inline(line.slice(2)) + '</li>').join('') + '</ul>';
    if (lines.every(line => /^\d+\. /.test(line))) return '<ol>' + lines.map(line => '<li>' + inline(line.replace(/^\d+\. /, '')) + '</li>').join('') + '</ol>';
    if (/^---/.test(block)) return '';
    return '<p>' + inline(block).replace(/\n/g,'<br>') + '</p>';
  }).join('');
}

document.getElementById('story').innerHTML = (window.RAVEN_CHAPTERS || []).map(chapter => '<section><h2>' + escapeHTML(chapter.title) + '</h2>' + blocks(chapter.text) + '</section>').join('');
document.querySelectorAll('.hotspot').forEach(button => {
  button.addEventListener('click', () => {
    clearTimeout(noticeTimer); notice.hidden = true;
    if (button.classList.contains('nathaniel')) {
      dialog.showModal(); dialog.scrollTop = 0;
    } else {
      notice.textContent = button.dataset.name + ' — příběh připravujeme.';
      notice.hidden = false;
      noticeTimer = setTimeout(() => { notice.hidden = true; }, 3500);
    }
  });
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
