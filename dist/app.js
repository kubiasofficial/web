const home = document.querySelector('#home');
const profile = document.querySelector('#profile');
const chapters = window.RAVEN_CHAPTERS || [];
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
document.querySelector('#story').innerHTML = chapters.map((chapter, index) => `<section class="story-chapter" id="kapitola-${index+1}"><h2><small>${index < 6 ? 'KAPITOLA '+String(index+1).padStart(2,'0') : 'OSOBNÍ SPIS'}</small>${escapeHTML(chapter.title)}</h2>${blocks(chapter.text)}</section>`).join('');
document.querySelector('#chapter-nav').innerHTML = chapters.map((chapter,index) => `<a href="#kapitola-${index+1}">${escapeHTML(chapter.title)}</a>`).join('');
function route() {
  const hash = location.hash;
  const isProfile = hash === '#nathaniel' || hash === '#pribeh' || /^#kapitola-\d+$/.test(hash);
  home.hidden = isProfile; profile.hidden = !isProfile;
  document.title = isProfile ? 'Nathaniel James Raven — New Horizon RP' : 'New Horizon RP — Příběhy z pohraničí';
  requestAnimationFrame(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (hash === '#nathaniel' || !hash) window.scrollTo({top:0,left:0,behavior:'instant'});
    else if (target) target.scrollIntoView({behavior:'instant',block:'start'});
  });
}
window.addEventListener('hashchange',route); route();
document.querySelectorAll('.pending').forEach(button => button.addEventListener('click',() => {
  document.querySelector('#cast-message').textContent = `${button.dataset.name}: příběh se připravuje. Zatím můžeš otevřít Nathaniela.`;
}));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) {
      document.querySelectorAll('#chapter-nav a').forEach(link => link.classList.toggle('active',link.hash === '#'+entry.target.id));
    }});
  },{rootMargin:'-5% 0px -70% 0px'});
  document.querySelectorAll('.story-chapter').forEach(section=>observer.observe(section));
}
// If the original poster is supplied, each panel becomes a crop of the SAME
// source image. Keeping it intact preserves the five characters' identities.
const poster = new Image();
poster.onload = () => {
  document.querySelectorAll('.character').forEach((panel,index) => {
    panel.style.backgroundImage = 'url("assets/postavy-original.png")';
    panel.style.backgroundSize = '500% auto';
    panel.style.backgroundPosition = `${index*25}% top`;
    panel.style.backgroundRepeat = 'no-repeat';
    panel.querySelector('.monogram, img')?.setAttribute('hidden','');
  });
};
poster.src = 'assets/postavy-original.png';
