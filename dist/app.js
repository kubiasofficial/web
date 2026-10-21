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


const chapters = window.RAVEN_CHAPTERS || [];
const escape = escapeHTML;
document.getElementById('story').innerHTML = chapters.map((chapter,index) => `<section class="chapter" id="kapitola-${index+1}"><h2><span class="chapter-number">${index<6?'KAPITOLA '+String(index+1).padStart(2,'0'):'OSOBNÍ SPIS'}</span>${escape(chapter.title)}</h2>${blocks(chapter.text)}</section>`).join('');
document.getElementById('chapter-nav').innerHTML = chapters.map((chapter,index) => `<a href="#kapitola-${index+1}">${escape(chapter.title)}</a>`).join('');
const selection=document.getElementById('selection');
const profile=document.getElementById('profile');
const notice=document.getElementById('notice');
let noticeTimer;
function route(){
 const hash=location.hash;
 const onProfile=hash==='#nathaniel'||hash==='#pribeh'||/^#kapitola-\d+$/.test(hash);
 const wasProfile=!profile.hidden;
 selection.hidden=onProfile;profile.hidden=!onProfile;
 document.title=onProfile?'Nathaniel James Raven · New Horizon RP':'New Horizon RP · Pět osudů, jeden horizont';
 requestAnimationFrame(()=>{
  if(hash==='#nathaniel'||!hash)window.scrollTo({top:0,left:0,behavior:'instant'});
  else document.getElementById(hash.slice(1))?.scrollIntoView({behavior:'instant'});
  if(!onProfile&&wasProfile)document.querySelector('.nathaniel').focus({preventScroll:true});
 });
}
window.addEventListener('hashchange',route);route();
document.querySelectorAll('button.character').forEach(button=>button.addEventListener('click',()=>{
 clearTimeout(noticeTimer);notice.textContent=button.dataset.name+' — její/jeho příběh připravujeme. Zatím můžeš poznat Nathaniela.';notice.hidden=false;
 noticeTimer=setTimeout(()=>{notice.hidden=true;},4200);
}));
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!profile.hidden)location.hash='';});
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('#chapter-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-5% 0px -70% 0px'});
 document.querySelectorAll('.chapter').forEach(chapter=>observer.observe(chapter));
}
