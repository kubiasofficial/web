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
  name:'Nathaniel James Raven',given:'NATHANIEL JAMES',nickname:'Nate',file:'nathaniel-james-raven.md',image:'nathaniel.png',number:'003',birth:'14. XI. 1862',age:'35 let',occupation:'Železničář & mechanik',relatives:'Daniel & Scarlett Raven',
  kicker:'Ne každý náklad je zapsaný v knihách.',description:'Železničář. Obchodník. Muž, který se<br>naučil znát cenu mlčení.',cta:'POZNAT JEHO MINULOST',sidebar:'JEHO PŘÍBĚH',
  alt:'Nathaniel Raven v černém klobouku a dlouhém kabátu, s hodinkovým řetízkem na vestě',
  quote:'Jestli hledáte slušnýho chlapa, zkuste kostel.<br>Jestli hledáte někoho, kdo svou práci odvede,<br>možná se domluvíme.',
  closing:'Tentokrát chce být tím,<br><em>kdo rozhoduje o směru své cesty.</em>',chapters:window.RAVEN_CHAPTERS||[],
  family:[{label:'MLADŠÍ BRATR',name:'Daniel Thomas Raven',text:'Chce se věnovat výcviku koní. Temperament a tvrdohlavost si přiváží z Missouri.',href:'#daniel'},{label:'MLADŠÍ SESTRA',name:'Scarlett Sky Raven',text:'Hledá vlastní životní cestu. Nathaniel k ní od dětství cítí silné ochranné pouto.',href:'#scarlett'}]
 },
 scarlett: {
  name:'Scarlett Sky Raven',given:'SCARLETT SKY',nickname:'Sky',file:'scarlett-sky-raven.md',image:'scarlett.png',number:'001',birth:'12. IV. 1879',age:'18 let',occupation:'Obchodnice · stáje & hostince',relatives:'Nathaniel & Daniel Raven',
  kicker:'Podceňuj mě dál. Je to tvoje největší chyba.',description:'Vlastní hlava. Ostrý jazyk.<br>Svoboda, o které rozhoduje sama.',cta:'POZNAT JEJÍ MINULOST',sidebar:'JEJÍ PŘÍBĚH',
  alt:'Scarlett Sky Raven, mladá pihovatá žena v černém klobouku, indigové košili a vysokých jezdeckých botách',
  quote:'Podceňuj mě dál.<br>Je to tvoje největší chyba.',
  closing:'Nechce, aby rozhodovali za ni.<br><em>Svou cestu si vybere sama.</em>',chapters:window.SCARLETT_CHAPTERS||[],
  family:[{label:'NEJSTARŠÍ BRATR',name:'Nathaniel James Raven',text:'Respektuje ho a ví, že se na něj může spolehnout. Jeho ochranitelské poučování jí ale leze na nervy.',href:'#nathaniel'},{label:'STARŠÍ BRATR',name:'Daniel Thomas Raven',text:'Učil ji jezdit na koni. Dokážou se hádat a provokovat, ale spojuje je silné sourozenecké pouto.',href:'#daniel'}]
 }
 ,daniel: {
  name:'Daniel Thomas Raven',given:'DANIEL THOMAS',nickname:'Dan',file:'daniel-thomas-raven.md',image:'daniel.png',number:'002',birth:'1867',age:'30 let',occupation:'Trenér a cvičitel koní',relatives:'Nathaniel & Scarlett Raven',
  kicker:'Když to nejde po dobrým, půjde to po mým.',description:'Trpělivost pro koně. Ostrý jazyk pro lidi.<br>Nový začátek s minulostí v sedle.',cta:'POZNAT JEHO MINULOST',sidebar:'JEHO PŘÍBĚH',
  alt:'Daniel Thomas Raven, muž s rozcuchanými hnědými vlasy, krátkými vousy a tmavým praktickým jezdeckým oblečením',
  quote:'Koně jsou jednoduchý. Když se tě bojí, poznáš to. Když ti věří, poznáš to taky. Zato člověk se na tebe usměje, potřese ti rukou a druhej den tě klidně prodá za pár dolarů.',
  closing:'Jeho největší předností není schopnost koně ukrást.<br><em>Je to schopnost ho vycvičit.</em>',chapters:window.DANIEL_CHAPTERS||[],
  family:[{label:'STARŠÍ BRATR',name:'Nathaniel James Raven',text:'Nathaniel plánuje a promýšlí. Daniel častěji jedná podle situace. Rozdílné povahy ale rodinné pouto nepřetrhly.',href:'#nathaniel'},{label:'MLADŠÍ SESTRA',name:'Scarlett Sky Raven',text:'Učil ji jezdit na koni a dodnes ji rád provokuje. Přes všechny hádky by se jí neváhal zastat.',href:'#scarlett'}]
 }

 ,katie: {
  name:'Katharine Jane Hunter',given:'KATHARINE JANE',surname:'HUNTER',nickname:'Katie',file:'katharine-jane-hunter.md',image:'katie.png',number:'004',birth:'02. II. 1871',origin:'TEXAS',stampTitle:'OSOBNÍ ARCHIV · KATIE HUNTER',age:'26 let',occupation:'Rančerka · farmářka · lovkyně',relatives:'Blackwater',relationLabel:'BYDLIŠTĚ',
  kicker:'Některé rány nejsou vidět, ale pořád bolí.',description:'Pevná vůle. Důvěra zasloužená činy.<br>Vlastní cesta do Blackwateru.',cta:'POZNAT JEJÍ MINULOST',sidebar:'JEJÍ PŘÍBĚH',storyChapterCount:7,
  alt:'Katharine Jane Hunter s tmavým copem, jizvou na tváři a praktickým koženým jezdeckým oblečením',
  quote:'Některé rány nejsou vidět,<br>ale pořád bolí.',closing:'Někdy je nejtěžší cesta ta,<br><em>která vede domů.</em>',chapters:window.KATIE_CHAPTERS||[],
  familyTitle:'Lidé po jejím boku',familyEyebrow:'DŮVĚRA SE POZNÁ PODLE ČINŮ.',familyDescription:'Nečeká velká gesta. Váží si lidí, kteří drží slovo, přiloží ruku k dílu a nezmizí při prvním problému.',
  family:[{label:'SPOLEČNÉ CESTY A OBCHODY',name:'Sophie Cherry',text:'Při společných cestách obchodovaly s domorodými obyvateli. Naučily se i jejich jazyk, který občas používají mezi sebou.',href:'#sophie'},{label:'OPORA V NOVÉM KRAJI',name:'Rodina Crowe',text:'S rodinou Crowe přijela do Blackwateru. Je pro ni důležitou oporou, vlastní nezávislosti se však nevzdává.',status:'Opora v Blackwateru'}]
 }

 ,sophie: {
  name:'Sophie Cherry',given:'SOPHIE',surname:'CHERRY',nickname:'Soph',file:'sophie-cherry.md',image:'sophie.png',number:'005',birth:'1869',origin:'MISSOURI',stampTitle:'OSOBNÍ ARCHIV · SOPHIE CHERRY',age:'28 let',occupation:'Lovkyně · stopařka · práce s koňmi',relatives:'Katharine Jane Hunter',relationLabel:'BLÍZKÁ OSOBA',
  kicker:'Lepší je držet si odstup, než litovat důvěry.',description:'Ticho lesa. Věrnost koní.<br>Svoboda, kterou si nenechá vzít.',cta:'POZNAT JEJÍ MINULOST',sidebar:'JEJÍ PŘÍBĚH',storyChapterCount:8,
  alt:'Sophie Cherry v černém klobouku s tmavými vlasy, modrošedýma očima, fialovým šátkem a loveckou výbavou',
  quote:'Lidem nevěřím. Zvířata jsou upřímnější než jakýkoliv člověk.<br>V přírodě nacházím klid, který mi žádný člověk nedokáže dát.',closing:'Kůň člověka nezradí ze zlého úmyslu,<br><em>ale člověk to dokáže udělat i s úsměvem na tváři.</em>',chapters:window.SOPHIE_CHAPTERS||[],
  familyTitle:'Ti, kterým důvěřuje',familyEyebrow:'DŮVĚRA NENÍ SAMOZŘEJMOST.',familyDescription:'Své soukromí si chrání a o minulosti mluví zřídka. Zvířatům důvěřuje více než lidem, ale vytrvalost a poctivé činy u ní mají váhu.',
  family:[{label:'SPOLEČNÉ CESTY A OBCHODY',name:'Katharine Jane Hunter',text:'S Katie ji spojují společné cesty, obchodování s domorodými obyvateli i jazyk, který se během těchto cest naučily.',href:'#katie'},{label:'JEJÍ NEJVĚTŠÍ ZALÍBENÍ',name:'Koně plemene Shire',text:'Obdivuje jejich sílu, klidnou povahu a věrnost. Sní o malé stáji, kde by se jim mohla věnovat po zbytek života.',status:'Její sen · vlastní stáj a kousek země'}]
 }

};
const selection=document.getElementById('selection');
const profile=document.getElementById('profile');
let activePerson=null;
function chapterID(key,index){return (key==='nathaniel'?'':key+'-')+'kapitola-'+(index+1);}
function renderProfile(key){
 const person=people[key];
 profile.classList.add('chronicle-profile');
 profile.classList.toggle('nathaniel-profile',key==='nathaniel');
 profile.classList.toggle('scarlett-profile',key==='scarlett');
 profile.classList.toggle('daniel-profile',key==='daniel');
 profile.classList.toggle('katie-profile',key==='katie');
 profile.classList.toggle('sophie-profile',key==='sophie');
 profile.querySelector('.profile-heading>.eyebrow').textContent='OSOBNÍ SPIS № '+person.number+' · NEW HORIZON, 1897';
 profile.querySelector('.profile-kicker').textContent=person.kicker;
 profile.querySelector('h1').innerHTML='<span>'+escapeHTML(person.given)+'</span>'+escapeHTML(person.surname||'RAVEN');
 profile.querySelector('.signature').textContent=person.nickname;
 profile.querySelector('.hero-description').innerHTML=person.description;
 const storyLink=profile.querySelector('.profile-heading .story-button');
 storyLink.innerHTML=person.cta+' <span>↓</span>';
 storyLink.href=key==='nathaniel'?'#pribeh':'#'+key+'-pribeh';
 const image=profile.querySelector('.hero-character');image.src='assets/'+person.image;image.alt=person.alt;
 profile.querySelector('.stamp').innerHTML=escapeHTML(person.origin||'SEDALIA · MISSOURI')+'<strong>'+escapeHTML(person.birth)+'</strong>'+escapeHTML(person.stampTitle||'RODINNÝ ARCHIV RAVENOVÝCH');
 const facts=[['JMÉNO',person.name],['VĚK V LORE',person.age],['POVOLÁNÍ',person.occupation],[person.relationLabel||'RODINA',person.relatives]];
 profile.querySelector('.facts').innerHTML=facts.map(([title,value])=>'<div><span>'+escapeHTML(title)+'</span><strong>'+escapeHTML(value)+'</strong></div>').join('');
 profile.querySelector('.quote blockquote').innerHTML=person.quote;
 profile.querySelector('.quote .eyebrow').textContent=person.name.toUpperCase();
 profile.querySelector('.story-shell').id=key==='nathaniel'?'pribeh':key+'-pribeh';
 profile.querySelector('.chapter-sidebar>.eyebrow').textContent=person.sidebar;
 document.getElementById('story').innerHTML=person.chapters.map((chapter,index)=>`<section class="chapter" id="${chapterID(key,index)}"><h2><span class="chapter-number">${index<(person.storyChapterCount||6)?'KAPITOLA '+String(index+1).padStart(2,'0'):'OSOBNÍ SPIS'}</span>${escapeHTML(chapter.title)}</h2>${blocks(chapter.text)}</section>`).join('');
 document.getElementById('chapter-nav').innerHTML=person.chapters.map((chapter,index)=>`<a href="#${chapterID(key,index)}">${escapeHTML(chapter.title)}</a>`).join('');
 profile.querySelector('.download').href='assets/'+person.file;
 profile.querySelector('.family h2').textContent=person.familyTitle||'Rodina Ravenových';
 profile.querySelector('.family>div>.eyebrow').textContent=person.familyEyebrow||'KREV SPOJUJE. MINULOST ROZDĚLUJE.';
 profile.querySelector('.family>div>p').textContent=person.familyDescription||'Po letech cestování dostávají možnost být znovu poblíž sebe. Každý si však přiváží vlastní cíle a tajemství.';
 profile.querySelector('.family-members').innerHTML=person.family.map(member=>`<div><span>${escapeHTML(member.label)}</span><h3>${member.href?'<a href="'+member.href+'">'+escapeHTML(member.name)+' ↗</a>':escapeHTML(member.name)}</h3><p>${escapeHTML(member.text)}</p>${member.href?'<a class="family-link" href="'+member.href+'">Otevřít příběh ↗</a>':'<small>'+escapeHTML(member.status||'Příběh připravujeme')+'</small>'}</div>`).join('');
 profile.querySelector('.profile-footer>p').innerHTML=person.closing;
 activePerson=key;
 window.VisualReading?.render(key,person,{chapterID,escapeHTML});
}

const archiveLock=document.createElement('dialog');
archiveLock.className='archive-lock';
archiveLock.setAttribute('aria-labelledby','archive-title');
archiveLock.innerHTML=`<form class="archive-lock-form"><button class="archive-close" type="button" aria-label="Zavřít">×</button><div class="archive-lock-seal"><img src="assets/icon-nathaniel.png" alt="" width="132" height="132"><span aria-hidden="true">⌑</span></div><p class="archive-eyebrow">NEW HORIZON · SOUKROMÝ ARCHIV</p><p class="archive-file">OSOBNÍ SPIS № 003</p><h2 id="archive-title">Některá tajemství<br>zůstávají pod zámkem.</h2><p class="archive-owner">Nathaniel James Raven</p><div class="archive-divider" aria-hidden="true">✦</div><label for="archive-code">Zadej čtyřmístný přístupový kód</label><input id="archive-code" name="code" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" minlength="4" autocomplete="off" required aria-describedby="archive-status"><p id="archive-status" role="status" aria-live="polite">Pouze pro ty, kterým byla svěřena důvěra.</p><button class="archive-unlock" type="submit">ODEMKNOUT PŘÍBĚH <span aria-hidden="true">↗</span></button><button class="archive-return" type="button">← Zpět k postavám</button><p class="archive-bottom">SEDALIA, MISSOURI <span>1897</span></p></form>`;
document.body.append(archiveLock);
const archiveCode=archiveLock.querySelector('input');
const archiveStatus=archiveLock.querySelector('#archive-status');
const archiveCodes={nathaniel:'2811',sophie:'6984',daniel:'4536',katie:'4691',scarlett:'5817'};
let archiveUnlocked=null,archivePerson=null;
function closeArchive(){const key=archivePerson;archiveLock.close();location.hash='';requestAnimationFrame(()=>document.querySelector('.cast-link.'+key)?.focus());}
archiveLock.querySelector('.archive-close').addEventListener('click',closeArchive);
archiveLock.querySelector('.archive-return').addEventListener('click',closeArchive);
archiveLock.addEventListener('cancel',event=>{event.preventDefault();closeArchive();});
archiveCode.addEventListener('input',()=>{archiveCode.value=archiveCode.value.replace(/\D/g,'');archiveCode.removeAttribute('aria-invalid');archiveStatus.textContent='Pouze pro ty, kterým byla svěřena důvěra.';archiveLock.classList.remove('archive-error');});
archiveLock.querySelector('form').addEventListener('submit',event=>{
 event.preventDefault();
 if(archiveCode.value!==archiveCodes[archivePerson]){
  archiveCode.setAttribute('aria-invalid','true');archiveLock.classList.add('archive-error');archiveStatus.textContent='Tento kód archiv neotevře. Zkus to znovu.';archiveCode.select();return;
 }
 archiveUnlocked=archivePerson;archiveLock.close();route();
});
function route(){
 const hash=location.hash;
 const prefixedKey=Object.keys(people).find(name=>hash==='#'+name||hash.startsWith('#'+name+'-'));
 const key=prefixedKey||((hash==='#pribeh'||/^#kapitola-\d+$/.test(hash))?'nathaniel':null);
 const wasProfile=!profile.hidden;
 const previousPerson=activePerson;
 if(key!==archiveUnlocked)archiveUnlocked=null;
 if(archiveCodes[key]&&archiveUnlocked!==key){
  if(archivePerson!==key&&archiveLock.open)archiveLock.close();
  archivePerson=key;
  const person=people[key];
  archiveLock.classList.toggle('archive-sophie',key==='sophie');
  archiveLock.classList.toggle('archive-daniel',key==='daniel');
  archiveLock.classList.toggle('archive-katie',key==='katie');
  archiveLock.classList.toggle('archive-scarlett',key==='scarlett');
  archiveLock.querySelector('.archive-lock-seal img').src='assets/icon-'+key+'.png';
  archiveLock.querySelector('.archive-owner').textContent=person.name;
  archiveLock.querySelector('.archive-file').textContent='OSOBNÍ SPIS № '+person.number;
  archiveLock.querySelector('.archive-bottom').textContent=(person.origin||'SEDALIA, MISSOURI')+' ';
  const archiveYear=document.createElement('span');archiveYear.textContent='1897';archiveLock.querySelector('.archive-bottom').append(archiveYear);
  selection.hidden=false;profile.hidden=true;window.VisualReading?.syncVisibility(null);
  document.title='Uzamčený archiv · New Horizon RP';
  if(!archiveLock.open){archiveCode.value='';archiveCode.removeAttribute('aria-invalid');archiveLock.classList.remove('archive-error');archiveStatus.textContent='Pouze pro ty, kterým byla svěřena důvěra.';archiveLock.showModal();archiveCode.focus();}
  return;
 }
 if(archiveLock.open)archiveLock.close();
 if(key&&activePerson!==key)renderProfile(key);
 selection.hidden=!!key;profile.hidden=!key;
 window.VisualReading?.syncVisibility(key);
 document.title=key?people[key].name+' · New Horizon RP':'New Horizon RP · Pět osudů, jeden horizont';
 requestAnimationFrame(()=>{
  if((key&&hash==='#'+key)||!hash)window.scrollTo({top:0,left:0,behavior:'instant'});
  else document.getElementById(hash.slice(1))?.scrollIntoView({behavior:'instant'});
  if(!key&&wasProfile)document.querySelector('.cast-link.'+previousPerson)?.focus({preventScroll:true});
 });
}
window.addEventListener('hashchange',route);route();
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!profile.hidden)location.hash='';});
