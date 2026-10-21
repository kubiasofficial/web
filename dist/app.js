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



const people = {
 nathaniel: {
  name:'Nathaniel James Raven',given:'NATHANIEL JAMES',nickname:'Nate',file:'nathaniel-james-raven.md',image:'nathaniel.png',number:'003',birth:'14. XI. 1862',age:'35 let',occupation:'Železničář & mechanik',relatives:'Daniel & Scarlet Raven',
  kicker:'Ne každý náklad je zapsaný v knihách.',description:'Železničář. Obchodník. Muž, který se<br>naučil znát cenu mlčení.',cta:'POZNAT JEHO MINULOST',sidebar:'JEHO PŘÍBĚH',
  alt:'Nathaniel Raven v černém klobouku a dlouhém kabátu, s hodinkovým řetízkem na vestě',
  quote:'Jestli hledáte slušnýho chlapa, zkuste kostel.<br>Jestli hledáte někoho, kdo svou práci odvede,<br>možná se domluvíme.',
  closing:'Tentokrát chce být tím,<br><em>kdo rozhoduje o směru své cesty.</em>',chapters:window.RAVEN_CHAPTERS||[],
  family:[{label:'DVOJČE · BRATR',name:'Daniel Thomas Raven',text:'Chce se věnovat výcviku koní. Temperament a tvrdohlavost si přiváží z Missouri.'},{label:'MLADŠÍ SESTRA',name:'Scarlet Sky Raven',text:'Hledá vlastní životní cestu. Nathaniel k ní od dětství cítí silné ochranné pouto.',href:'#scarlet'}]
 },
 scarlet: {
  name:'Scarlet Sky Raven',given:'SCARLET SKY',nickname:'Sky',file:'scarlet-sky-raven.md',image:'scarlet.png',number:'001',birth:'12. IV. 1879',age:'18 let',occupation:'Obchodnice · stáje & hostince',relatives:'Nathaniel & Daniel Raven',
  kicker:'Podceňuj mě dál. Je to tvoje největší chyba.',description:'Vlastní hlava. Ostrý jazyk.<br>Svoboda, o které rozhoduje sama.',cta:'POZNAT JEJÍ MINULOST',sidebar:'JEJÍ PŘÍBĚH',
  alt:'Scarlet Sky Raven, mladá pihovatá žena v černém klobouku, indigové košili a vysokých jezdeckých botách',
  quote:'Podceňuj mě dál.<br>Je to tvoje největší chyba.',
  closing:'Nechce, aby rozhodovali za ni.<br><em>Svou cestu si vybere sama.</em>',chapters:window.SCARLET_CHAPTERS||[],
  family:[{label:'NEJSTARŠÍ BRATR',name:'Nathaniel James Raven',text:'Respektuje ho a ví, že se na něj může spolehnout. Jeho ochranitelské poučování jí ale leze na nervy.',href:'#nathaniel'},{label:'STARŠÍ BRATR',name:'Daniel Thomas Raven',text:'Učil ji jezdit na koni. Dokážou se hádat a provokovat, ale spojuje je silné sourozenecké pouto.'}]
 }
};
const selection=document.getElementById('selection');
const profile=document.getElementById('profile');
const notice=document.getElementById('notice');
let noticeTimer,activePerson=null,observer;
function chapterID(key,index){return (key==='scarlet'?'scarlet-':'')+'kapitola-'+(index+1);}
function renderProfile(key){
 const person=people[key];
 profile.classList.toggle('scarlet-profile',key==='scarlet');
 profile.querySelector('.profile-heading>.eyebrow').textContent='OSOBNÍ SPIS № '+person.number+' · NEW HORIZON, 1897';
 profile.querySelector('.profile-kicker').textContent=person.kicker;
 profile.querySelector('h1').innerHTML='<span>'+escapeHTML(person.given)+'</span>RAVEN';
 profile.querySelector('.signature').textContent=person.nickname;
 profile.querySelector('.hero-description').innerHTML=person.description;
 const storyLink=profile.querySelector('.profile-heading .story-button');
 storyLink.innerHTML=person.cta+' <span>↓</span>';
 storyLink.href=key==='scarlet'?'#scarlet-pribeh':'#pribeh';
 const image=profile.querySelector('.hero-character');image.src='assets/'+person.image;image.alt=person.alt;
 profile.querySelector('.stamp').innerHTML='SEDALIA · MISSOURI<strong>'+person.birth+'</strong>RODINNÝ ARCHIV RAVENOVÝCH';
 const facts=[['JMÉNO',person.name],['VĚK V LORE',person.age],['POVOLÁNÍ',person.occupation],['RODINA',person.relatives]];
 profile.querySelector('.facts').innerHTML=facts.map(([title,value])=>'<div><span>'+escapeHTML(title)+'</span><strong>'+escapeHTML(value)+'</strong></div>').join('');
 profile.querySelector('.quote blockquote').innerHTML=person.quote;
 profile.querySelector('.quote .eyebrow').textContent=person.name.toUpperCase();
 profile.querySelector('.story-shell').id=key==='scarlet'?'scarlet-pribeh':'pribeh';
 profile.querySelector('.chapter-sidebar>.eyebrow').textContent=person.sidebar;
 document.getElementById('story').innerHTML=person.chapters.map((chapter,index)=>`<section class="chapter" id="${chapterID(key,index)}"><h2><span class="chapter-number">${index<6?'KAPITOLA '+String(index+1).padStart(2,'0'):'OSOBNÍ SPIS'}</span>${escapeHTML(chapter.title)}</h2>${blocks(chapter.text)}</section>`).join('');
 document.getElementById('chapter-nav').innerHTML=person.chapters.map((chapter,index)=>`<a href="#${chapterID(key,index)}">${escapeHTML(chapter.title)}</a>`).join('');
 profile.querySelector('.download').href='assets/'+person.file;
 profile.querySelector('.family-members').innerHTML=person.family.map(member=>`<div><span>${escapeHTML(member.label)}</span><h3>${member.href?'<a href="'+member.href+'">'+escapeHTML(member.name)+' ↗</a>':escapeHTML(member.name)}</h3><p>${escapeHTML(member.text)}</p>${member.href?'<a class="family-link" href="'+member.href+'">Otevřít příběh ↗</a>':'<small>Příběh připravujeme</small>'}</div>`).join('');
 profile.querySelector('.profile-footer>p').innerHTML=person.closing;
 activePerson=key;
 if('IntersectionObserver' in window){
  observer?.disconnect();
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('#chapter-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-5% 0px -70% 0px'});
  document.querySelectorAll('.chapter').forEach(chapter=>observer.observe(chapter));
 }
}
function route(){
 const hash=location.hash;
 const key=/^#scarlet(?:$|-)/.test(hash)?'scarlet':(hash==='#nathaniel'||hash==='#pribeh'||/^#kapitola-\d+$/.test(hash))?'nathaniel':null;
 const wasProfile=!profile.hidden;
 const previousPerson=activePerson;
 clearTimeout(noticeTimer);notice.hidden=true;
 if(key&&activePerson!==key)renderProfile(key);
 selection.hidden=!!key;profile.hidden=!key;
 document.title=key?people[key].name+' · New Horizon RP':'New Horizon RP · Pět osudů, jeden horizont';
 requestAnimationFrame(()=>{
  if(hash==='#nathaniel'||hash==='#scarlet'||!hash)window.scrollTo({top:0,left:0,behavior:'instant'});
  else document.getElementById(hash.slice(1))?.scrollIntoView({behavior:'instant'});
  if(!key&&wasProfile)document.querySelector('.character.'+previousPerson)?.focus({preventScroll:true});
 });
}
window.addEventListener('hashchange',route);route();
document.querySelectorAll('button.character').forEach(button=>button.addEventListener('click',()=>{
 clearTimeout(noticeTimer);notice.textContent=button.dataset.name+' — příběh připravujeme. Zatím můžeš poznat Nathaniela a Scarlet.';notice.hidden=false;
 noticeTimer=setTimeout(()=>{notice.hidden=true;},4200);
}));
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!profile.hidden)location.hash='';});
