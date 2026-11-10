function escapeHTML(text){return String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function inline(text){return escapeHTML(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');}
function blocks(text){return text.trim().split(/\n\s*\n/).map(block=>{const lines=block.split('\n');if(lines.every(line=>/^- /.test(line)))return '<ul>'+lines.map(line=>'<li>'+inline(line.slice(2))+'</li>').join('')+'</ul>';return '<p>'+inline(block).replace(/\n/g,'<br>')+'</p>';}).join('');}
const people={};
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
 profile.classList.toggle('vincent-profile',key==='vincent');
 profile.classList.toggle('elijah-profile',key==='elijah');
 profile.querySelector('.profile-heading>.eyebrow').textContent='OSOBNÍ SPIS № '+person.number+' · NEW HORIZON, 1897';
 profile.querySelector('.profile-kicker').textContent=person.kicker;
 profile.querySelector('h1').innerHTML='<span>'+escapeHTML(person.given)+'</span>'+escapeHTML(person.surname||'RAVEN');
 profile.querySelector('.signature').textContent=person.nickname;
 profile.querySelector('.hero-description').innerHTML=person.description;
 const storyLink=profile.querySelector('.profile-heading .story-button');
 storyLink.innerHTML=person.cta+' <span>↓</span>';
 storyLink.href=key==='nathaniel'?'#pribeh':'#'+key+'-pribeh';
 const image=profile.querySelector('.hero-character');mediaImage(image,person.image,'(max-width:700px) 90vw, 50vw',960);image.alt=person.alt;
 profile.querySelector('.stamp').innerHTML=escapeHTML(person.origin||'SEDALIA · MISSOURI')+'<strong>'+escapeHTML(person.birth)+'</strong>'+escapeHTML(person.stampTitle||'RODINNÝ ARCHIV RAVENOVÝCH');
 const facts=[['JMÉNO',person.name],['VĚK V LORE',person.age],['POVOLÁNÍ',person.occupation],[person.relationLabel||'RODINA',person.relatives]];
 profile.querySelector('.facts').innerHTML=facts.map(([title,value])=>'<div><span>'+escapeHTML(title)+'</span><strong>'+escapeHTML(value)+'</strong></div>').join('');
 profile.querySelector('.quote blockquote').innerHTML=person.quote;
 profile.querySelector('.quote .eyebrow').textContent=person.name.toUpperCase();
 profile.querySelector('.story-shell').id=key==='nathaniel'?'pribeh':key+'-pribeh';
 profile.querySelector('.chapter-sidebar>.eyebrow').textContent=person.sidebar;
 document.getElementById('story').innerHTML=person.chapters.map((chapter,index)=>`<section class="chapter" id="${chapterID(key,index)}"><h2><span class="chapter-number">${index<(person.storyChapterCount||6)?'KAPITOLA '+String(index+1).padStart(2,'0'):'OSOBNÍ SPIS'}</span>${escapeHTML(chapter.title)}</h2>${blocks(chapter.text)}</section>`).join('');
 document.getElementById('chapter-nav').innerHTML=person.chapters.map((chapter,index)=>`<a href="#${chapterID(key,index)}">${escapeHTML(chapter.title)}</a>`).join('');
 profile.querySelector('.download').href='/api/ubd/archive/download/'+key;
 profile.querySelector('.family h2').textContent=person.familyTitle||'Rodina Ravenových';
 profile.querySelector('.family>div>.eyebrow').textContent=person.familyEyebrow||'KREV SPOJUJE. MINULOST ROZDĚLUJE.';
 profile.querySelector('.family>div>p').textContent=person.familyDescription||'Po letech cestování dostávají možnost být znovu poblíž sebe. Každý si však přiváží vlastní cíle a tajemství.';
 profile.querySelector('.family-members').innerHTML=person.family.map(member=>`<div><span>${escapeHTML(member.label)}</span><h3>${member.href?'<a href="'+member.href+'">'+escapeHTML(member.name)+' ↗</a>':escapeHTML(member.name)}</h3><p>${escapeHTML(member.text)}</p>${member.href?'<a class="family-link" href="'+member.href+'">Otevřít příběh ↗</a>':'<small>'+escapeHTML(member.status||'Příběh připravujeme')+'</small>'}</div>`).join('');
 profile.querySelector('.profile-footer>p').innerHTML=person.closing;
 activePerson=key;
 window.VisualReading?.render(key,person,{chapterID,escapeHTML});
}


const profileTemplate=profile.innerHTML;
const PortalPolish = (() => {
 let loader, confirmation, resolveConfirmation=null, browser, castToggle, castNavigation, returnFocus=null;
 const playerNames={daniel:'Eidík',nathaniel:'kubiasofficial',vincent:'BuFu',elijah:'mata20_official',katie:'Safík Alex',scarlett:'Graciie04',sophie:'🐭Myška🐭'};
 const names=new Map(), pendingNames=new Map(), avatars=new Map();
 let playerObserver;
 function closeCast(){
  if(!browser?.open)return;
  browser.close();portal.after(rail);rail.classList.remove('cast-in-dialog');
  castToggle.setAttribute('aria-expanded','false');document.body.classList.remove('cast-browser-open');
  if(returnFocus?.isConnected){const target=returnFocus.closest('[inert]')?document.querySelector('.user-trigger'):returnFocus;target?.focus({preventScroll:true});}returnFocus=null;
 }
 function openCast(){
  if(!identity||browser.open)return;
  returnFocus=document.activeElement;browser.querySelector('.cast-browser-content').append(rail);rail.classList.add('cast-in-dialog');
  browser.showModal();castToggle.setAttribute('aria-expanded','true');document.body.classList.add('cast-browser-open');
  browser.querySelector('.cast-browser-close').focus();
  for(const entry of rail.querySelectorAll('[data-character]'))loadName(entry.dataset.character);
 }
 function syncPlayer(key){
  const target=rail.querySelector('[data-character="'+key+'"]');if(!target)return;
  target.querySelector('.rail-player').textContent=names.get(key)||playerNames[key];
  const avatar=target.querySelector('.rail-avatar');avatar.hidden=!avatars.has(key);if(avatars.has(key))avatar.src=avatars.get(key);
  target.querySelector('.player-placeholder').hidden=avatars.has(key);
 }
 const lock='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>';
 const seal='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 3 4 1 1 4 2 3-3 3-1 4-4-1-3 2-3-3-4-1 1-4-2-3 3-3 1-4 4 1zM8 12l3 3 5-6"/></svg>';
 let bookId=0;
 function book(key,small=false){
  const id='journal-cover-'+(++bookId),p=catalog[key];
  return '<svg class="journal-icon'+(small?' journal-icon-small':'')+'" viewBox="0 0 120 140" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" x2="1" y2="1"><stop stop-color="#63402a"/><stop offset=".45" stop-color="#291d19"/><stop offset="1" stop-color="#150f11"/></linearGradient><linearGradient id="'+id+'-metal"><stop stop-color="#755130"/><stop offset=".5" stop-color="#e6c58b"/><stop offset="1" stop-color="#937045"/></linearGradient></defs><g class="journal-pages"><path d="M20 18h82v111H20z" fill="#cbb890"/><path d="M24 23h75M24 27h75M24 121h75M24 125h75" stroke="#746447" stroke-width="1"/></g><g class="journal-cover"><path d="M19 10h82v116H19Q10 126 10 117V20q0-10 9-10Z" fill="url(#'+id+')" stroke="#a98150" stroke-width="1.5"/><path d="M24 11v114M29 19h63v97H29z" fill="none" stroke="#9b744653"/><path d="M28 17h17l-17 17Zm65 0H76l17 17Zm0 101H76l17-17Zm-65 0h17l-17-17Z" fill="url(#'+id+'-metal)"/><path d="M15 26h12M15 42h12M15 98h12M15 113h12" stroke="#b7915f" stroke-width="3"/><circle cx="61" cy="62" r="23" fill="#100d0c" stroke="currentColor" stroke-width="1.5"/><image href="'+mediaURL('icon-'+key+'.png',160)+'" x="38" y="39" width="46" height="46"/><path d="M43 95h35M50 100h21" stroke="#b68a52"/><path d="M98 62h10v16H98q-6-8 0-16Z" fill="#38281c" stroke="#bb965e"/><circle cx="101" cy="70" r="2" fill="#d8b87c"/></g></svg>';
 }
 function confirmAction(title,text,label='Potvrdit'){
  if(resolveConfirmation)return Promise.resolve(false);
  confirmation.querySelector('h2').textContent=title;confirmation.querySelector('p').textContent=text;confirmation.querySelector('.confirm-accept').textContent=label;
  confirmation.showModal();confirmation.querySelector('.confirm-cancel').focus();return new Promise(resolve=>resolveConfirmation=resolve);
 }
 function settle(value){confirmation.close();const resolve=resolveConfirmation;resolveConfirmation=null;resolve?.(value);}
 function init(){
  loader=document.createElement('div');loader.className='archive-loader';loader.hidden=true;loader.setAttribute('role','status');loader.setAttribute('aria-live','polite');loader.innerHTML='<span class="loader-orbit"><img width="110" height="110" alt=""></span><span>Otevírám soukromý archiv…</span>';document.body.append(loader);
  confirmation=document.createElement('dialog');confirmation.className='confirm-dialog';confirmation.setAttribute('aria-labelledby','confirm-title');confirmation.innerHTML='<span class="eyebrow">JEŠTĚ JEDNO ROZHODNUTÍ</span><h2 id="confirm-title"></h2><p></p><div><button class="confirm-cancel" type="button">Zpět</button><button class="confirm-accept" type="button"></button></div>';document.body.append(confirmation);
  confirmation.querySelector('.confirm-accept').onclick=()=>settle(true);confirmation.querySelector('.confirm-cancel').onclick=()=>settle(false);confirmation.addEventListener('cancel',event=>{event.preventDefault();settle(false);});
  portal.after(rail);rail.id='private-cast';
  browser=document.createElement('dialog');browser.className='cast-browser';browser.id='cast-browser';browser.setAttribute('aria-label','Postavy New Horizon');
  browser.innerHTML='<button type="button" class="cast-browser-close" aria-label="Zavřít výběr postav">Zavřít <span aria-hidden="true">×</span></button><div class="cast-browser-content"></div>';
  document.body.append(browser);browser.querySelector('.cast-browser-close').onclick=closeCast;
  browser.addEventListener('cancel',event=>{event.preventDefault();closeCast();});
  browser.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeCast();}});
  browser.addEventListener('click',event=>{if(event.target===browser){const r=browser.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeCast();}});
  castNavigation=document.createElement('nav');castNavigation.className='portal-navigation';castNavigation.setAttribute('aria-label','Tvůj archiv');
  castNavigation.innerHTML='<a class="portal-home" href="#">Můj archiv</a><button type="button" class="cast-toggle" aria-haspopup="dialog" aria-controls="cast-browser" aria-expanded="false"><span aria-hidden="true">✦</span> Postavy</button>';
  accountControls.before(castNavigation);castToggle=castNavigation.querySelector('button');castToggle.onclick=openCast;
  const readerCast=document.querySelector('.toolbar-back');readerCast.textContent='✦ POSTAVY';readerCast.setAttribute('aria-haspopup','dialog');readerCast.setAttribute('aria-controls','cast-browser');readerCast.onclick=event=>{event.preventDefault();openCast();};
  playerObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loadName(entry.target.dataset.character);playerObserver.unobserve(entry.target);}},{rootMargin:'150px'});
  rail.addEventListener('click',event=>{if(event.target.closest('a'))closeCast();});
  window.addEventListener('hashchange',closeCast);

 }
 async function loadName(key){
  if(!key||names.has(key)||pendingNames.has(key))return;
  const promise=api('/players/'+key).then(data=>{
   if(typeof data.name==='string')names.set(key,data.name);
   if(typeof data.avatar==='string'&&data.avatar.startsWith('https://cdn.discordapp.com/'))avatars.set(key,data.avatar);
   syncPlayer(key);
  }).catch(()=>{}).finally(()=>pendingNames.delete(key));pendingNames.set(key,promise);

 }
 function account(person,own){
  closeCast();
  welcome.classList.add('welcome-reveal');
  let avatar=welcome.querySelector('.welcome-avatar');if(!avatar){avatar=new Image(58,58);avatar.className='welcome-avatar';avatar.alt='';welcome.prepend(avatar);}avatar.src=identity.user.avatar;
  let label=welcome.querySelector('.welcome-identity');if(!label){label=document.createElement('span');label.className='welcome-identity';welcome.querySelector('h2').after(label);}label.textContent=person?person.name+' · Tvůj soukromý archiv':'Tvůj prostor mezi příběhy';
  const scene=portal.querySelector('.personal-scene');scene.dataset.character=own||'guest';
  if(own)scene.style.setProperty('--personal-world',mediaBackground(own+'-scenes.png'));
  const atmosphere=document.createElement('div');atmosphere.className='personal-atmosphere';atmosphere.setAttribute('aria-hidden','true');atmosphere.innerHTML='<span class="personal-fog"></span>'+Array.from({length:7},(_,i)=>'<i style="--i:'+i+'"></i>').join('');scene.prepend(atmosphere);
  if(own){const link=document.createElement('a');link.className='journal-open';link.href='#journal-'+own;link.innerHTML=book(own)+'<span><strong>Otevřít můj deník</strong><small>Myšlenky, které stojí za uchování.</small></span><span aria-hidden="true">↗</span>';portal.querySelector('.personal-copy .story-button').after(link);}
  const browse=document.createElement('button');browse.type='button';browse.className='browse-cast';browse.innerHTML='<span aria-hidden="true">✦</span> Příběhy kolem tebe <span aria-hidden="true">↓</span>';
  browse.onclick=()=>rail.scrollIntoView({behavior:motionAllowed()?'smooth':'instant',block:'start'});portal.querySelector('.personal-copy').append(browse);
  playerObserver.disconnect();
  for(const anchor of rail.querySelectorAll('.private-medallion')){
   const key=anchor.hash.slice(1),p=catalog[key],allowed=identity.access.includes(key),journal=identity.journalAccess?.includes(key);
   anchor.dataset.playerKey=key;anchor.classList.toggle('is-unlocked',allowed);anchor.classList.toggle('is-locked',!allowed);
   anchor.setAttribute('aria-label','Otevřít příběh: '+p.name);anchor.querySelector('span')?.remove();
   const portrait=document.createElement('span');portrait.className='cast-portrait';portrait.append(anchor.querySelector('img'));
   const status=document.createElement('span');status.className='medallion-status';status.innerHTML=allowed?seal:lock;portrait.append(status);anchor.append(portrait);
   const label=document.createElement('span');label.className='cast-name';label.innerHTML='<span>'+escapeHTML(p.given.toLocaleLowerCase('cs-CZ').replace(/(^|\s)\p{L}/gu,c=>c.toLocaleUpperCase('cs-CZ')))+'</span><strong>'+escapeHTML(p.surname)+'</strong><em>'+escapeHTML(p.nickname)+'</em>';anchor.append(label);
   const wrapper=document.createElement('article');wrapper.className='private-member';wrapper.dataset.character=key;wrapper.style.setProperty('--aura',p.color);anchor.replaceWith(wrapper);wrapper.append(anchor);
   const player=document.createElement('div');player.className='cast-player';player.innerHTML='<span class="player-placeholder" aria-hidden="true">✦</span><img class="rail-avatar" width="28" height="28" alt="" hidden><span class="rail-player"></span>';wrapper.append(player);
   const actions=document.createElement('div');actions.className='cast-actions';actions.innerHTML='<a class="cast-story" href="#'+key+'"><span>'+seal+' Příběh <b aria-hidden="true">↗</b></span><small>'+(allowed?'Přístup udělen':'Soukromý archiv')+'</small></a><a class="rail-journal" href="#journal-'+key+'"><span>'+book(key,true)+' Deník <b aria-hidden="true">↗</b></span><small>'+(journal?'Přístup udělen':'Soukromé zápisky')+'</small></a>';
   actions.querySelector('.cast-story').classList.toggle('is-available',allowed);actions.querySelector('.rail-journal').classList.toggle('is-available',!!journal);
   actions.querySelector('.cast-story').setAttribute('aria-label','Příběh: '+p.name+(allowed?' — přístup udělen':' — uzamčeno'));
   actions.querySelector('.rail-journal').setAttribute('aria-label','Deník: '+p.name+(journal?' — přístup udělen':' — uzamčeno'));
   wrapper.append(actions);syncPlayer(key);playerObserver.observe(wrapper);
  }

 }
 function loading(key,on=true){loader.hidden=!on;if(on){loader.style.setProperty('--aura',catalog[key]?.color||'#bd965b');mediaImage(loader.querySelector('img'),'icon-'+key+'.png','140px',320);}}
 function active(key,kind='lore'){
  closeCast();rail.querySelectorAll('.private-member').forEach(member=>member.classList.toggle('member-current',member.querySelector('[data-player-key]')?.dataset.playerKey===key));
  rail.querySelectorAll('.private-medallion,.rail-journal').forEach(link=>{const match=kind==='journal'?link.hash==='#journal-'+key:link.hash==='#'+key;link.classList.toggle('is-current',match);if(match)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 }
 function revealProfile(key){
  if(matchMedia('(max-width:900px)').matches){const contents=profile.querySelector('.chapter-list');if(contents)contents.open=false;}
  let journalLink=profile.querySelector('.profile-journal-link');if(!journalLink){journalLink=document.createElement('a');journalLink.className='profile-journal-link';profile.querySelector('.profile-heading .story-button').after(journalLink);}journalLink.href='#journal-'+key;journalLink.innerHTML=book(key,true)+'<span>Osobní deník ↗</span>';
  UserChrome.decorateBirthdays();
  if(motionAllowed()){profile.querySelector('.hero-character').animate([{opacity:0,transform:'translateX(35px) scale(1.015)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.65,.25,1)'});profile.querySelector('.profile-heading').animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'ease-out'});}
 }
 return {init,account,loading,active,book,confirm:confirmAction,closeCast,cancelConfirmation:()=>{if(resolveConfirmation)settle(false);},revealProfile};
})();

window.Journal = (() => {
 let page,editor,key=null,canEdit=false,selected=null,nextCursor=null,requestVersion=0;
 let entries=new Map(),draft=null,baseline='',suspendedDraft=null,saving=false;
 const fields=()=>editor.querySelector('form').elements;
 const routeKey=()=>/^#journal-([a-z]+)(?:\/([a-f0-9-]{36}))?$/.exec(location.hash);
 const fonts={book:'Knižní',hand:'Rukopis',typewriter:'Strojopis'};
 function date(entry){return entry.date?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'long',timeZone:'UTC'}).format(new Date(entry.date)):new Intl.DateTimeFormat('cs-CZ',{dateStyle:'long',timeZone:'Europe/Prague'}).format(new Date(entry.createdAt*1000));}
 function markup(text){
  const inline=value=>escapeHTML(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
  return String(text).trim().split(/\n\s*\n/).map(block=>{const lines=block.split('\n');if(lines.every(line=>/^[-*] /.test(line)))return '<ul>'+lines.map(line=>'<li>'+inline(line.slice(2))+'</li>').join('')+'</ul>';if(lines.every(line=>/^\d+\. /.test(line)))return '<ol>'+lines.map(line=>'<li>'+inline(line.replace(/^\d+\. /,''))+'</li>').join('')+'</ol>';return '<p>'+lines.map(inline).join('<br>')+'</p>';}).join('');
 }
 function paintText(node,entry){node.className='journal-prose journal-font-'+(Object.hasOwn(fonts,entry.font)?entry.font:'book');node.style.fontSize=Math.max(16,Math.min(26,Number(entry.size)||19))+'px';node.innerHTML=markup(entry.text);}
 function status(text){if(page)page.querySelector('.journal-status').textContent=text;}
 function editorValues(){const f=fields();return{title:f.title.value,text:f.text.value,date:f.date.value,font:f.font.value,size:Number(f.size.value)};}
 function dirty(){return !!draft&&JSON.stringify(editorValues())!==baseline;}
 function resetEditor(){editor.close();editor.querySelector('form').reset();editor.querySelector('.journal-live-preview').replaceChildren();editor.querySelector('.editor-status').textContent='';editor.querySelector('.dialog-close').disabled=false;saving=false;draft=null;baseline='';}
 async function closeEditor(){if(saving)return;if(dirty()&&!await PortalPolish.confirm('Zahodit rozepsané změny?','Neuložený text se zahodí. Uložený zápis zůstane beze změny.','Zahodit změny'))return;resetEditor();}
 function purge({preserveDraft=false}={}){
  requestVersion++;
  if(preserveDraft&&draft&&canEdit)suspendedDraft={...draft,...editorValues(),baseline};else if(!preserveDraft)suspendedDraft=null;
  PortalPolish.cancelConfirmation();if(editor)resetEditor();if(page){page.hidden=true;page.querySelector('.journal-index').replaceChildren();page.querySelector('.journal-paper-content').replaceChildren();page.querySelector('.journal-entry-actions').replaceChildren();status('');}
  entries.clear();key=null;selected=null;canEdit=false;nextCursor=null;
 }
 function renderIndex(){
  const index=page.querySelector('.journal-index');index.replaceChildren();
  const ordered=[...entries.values()].sort((a,b)=>b.createdAt-a.createdAt||b.id.localeCompare(a.id));
  for(const entry of ordered){const link=document.createElement('a');link.href='#journal-'+key+'/'+entry.id;link.className='journal-index-entry';if(selected===entry.id)link.setAttribute('aria-current','page');const heading=document.createElement('strong');heading.textContent=entry.title;const time=document.createElement('span');time.textContent=date(entry);link.append(time,heading);index.append(link);}
  page.querySelector('.journal-more').hidden=!nextCursor;
 }
 function renderEntry(id){
  selected=id;const content=page.querySelector('.journal-paper-content'),actions=page.querySelector('.journal-entry-actions');content.replaceChildren();actions.replaceChildren();
  const entry=entries.get(id);
  if(!entry){content.innerHTML='<div class="journal-empty"><span aria-hidden="true">✦</span><h2>První stránka ještě čeká.</h2><p></p></div>';content.querySelector('p').textContent=canEdit?'Zachyť dnešní události. Na webu nebo příkazem /deník na Discordu.':'Majitel do tohoto deníku zatím nic nenapsal.';renderIndex();return;}
  const time=document.createElement('p');time.className='journal-entry-date';time.textContent=date(entry);
  const title=document.createElement('h2');title.className='journal-entry-title';title.textContent=entry.title;
  const body=document.createElement('div');paintText(body,entry);
  const footer=document.createElement('p');footer.className='journal-entry-footnote';footer.textContent='Z osobního deníku '+catalog[key].name+' · '+fonts[entry.font];content.append(time,title,body,footer);
  if(canEdit){const edit=document.createElement('button');edit.type='button';edit.textContent='Upravit zápis';edit.onclick=()=>showEditor(entry);const remove=document.createElement('button');remove.type='button';remove.className='journal-delete';remove.textContent='Smazat';remove.onclick=()=>deleteEntry(entry);actions.append(edit,remove);}
  renderIndex();
 }
 async function deleteEntry(entry){
  const journalKey=key,version=requestVersion;
  if(!await PortalPolish.confirm('Smazat tento zápis?',entry.title+' bude odstraněn z deníku. Tuto změnu nepůjde vrátit.','Smazat zápis'))return;
  if(version!==requestVersion||!canEdit)return;
  status('Mažu zápis…');
  try{await api('/journal/entries/'+journalKey+'/'+entry.id,{method:'DELETE',body:JSON.stringify({revision:entry.revision})});if(version!==requestVersion)return;entries.delete(entry.id);const first=entries.values().next().value;selected=first?.id||null;history.replaceState(null,'','#journal-'+journalKey+(selected?'/'+selected:''));renderEntry(selected);status('Zápis byl smazán.');}catch(error){if(version===requestVersion)status(error.message);}
 }
 async function open(journalKey,entryId,force=false){
  loadDiaryFonts();
  const same=key===journalKey&&!page.hidden,version=++requestVersion,user=identity?.user.id;
  if(!same){entries.clear();nextCursor=null;selected=null;}
  key=journalKey;page.hidden=true;PortalPolish.loading(journalKey);
  try{
   let result,entry;
   if(same&&entryId&&!force){result=await api('/journal/entries/'+key+'/'+entryId);entry=result.entry;}
   else{result=await api('/journal/entries/'+key);}
   if(version!==requestVersion||user!==identity?.user.id||document.hidden)return;
   canEdit=result.canEdit;
   if(result.entries){entries=new Map(result.entries.map(item=>[item.id,item]));nextCursor=result.nextCursor;if(entryId&&!entries.has(entryId)){const detail=await api('/journal/entries/'+key+'/'+entryId);if(version!==requestVersion||user!==identity?.user.id||document.hidden)return;entries.set(detail.entry.id,detail.entry);}}
   else if(entry)entries.set(entry.id,entry);
   const person=catalog[key];page.style.setProperty('--aura',person.color);page.dataset.character=key;
   page.querySelector('.journal-book-emblem').innerHTML=PortalPolish.book(key);page.querySelector('.journal-owner').textContent=person.name;
   page.querySelector('.journal-owner-signature').textContent=person.nickname;page.querySelector('.journal-back').href='#'+key;
   page.querySelector('.journal-new').hidden=!canEdit;page.querySelector('.journal-permission').textContent=canEdit?'TVŮJ SOUKROMÝ ZÁPISNÍK':'SDÍLENÝ DENÍK · JEN PRO ČTENÍ';
   selected=entryId||selected||entries.values().next().value?.id||null;renderEntry(selected);page.hidden=false;status('');document.title='Deník · '+person.name+' · New Horizon RP';PortalPolish.active(key,'journal');
   if(!same&&motionAllowed())page.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
   if(suspendedDraft){const saved=suspendedDraft;suspendedDraft=null;if(saved.key===key&&canEdit)showEditor(saved,true);}
  }catch(error){if(version!==requestVersion)return;purge();if([401,403].includes(error.status))deny(journalKey,deniedText,'journal');else{portal.hidden=false;setNotice(error.message);}}
  finally{if(version===requestVersion||!key)PortalPolish.loading(journalKey,false);}
 }
 function showEditor(entry=null,restore=false){
  if(!canEdit)return;const f=fields();
  draft={key,id:entry?.id||null,revision:entry?.revision,requestId:entry?.requestId||crypto.randomUUID()};
  f.title.value=entry?.title||'';f.text.value=entry?.text||'';f.date.value=entry?.date||'';f.font.value=entry?.font||'book';f.size.value=entry?.size||19;
  baseline=restore?entry.baseline:JSON.stringify(editorValues());editor.querySelector('fieldset').disabled=false;editor.querySelector('.editor-status').textContent='';editor.querySelector('.journal-editor-title').textContent=entry?.id?'Upravit zápis':'Nový zápis';updatePreview();editor.showModal();f.title.focus();
 }
 function updatePreview(){const values=editorValues(),preview=editor.querySelector('.journal-live-preview');preview.replaceChildren();const title=document.createElement('h3');title.textContent=values.title||'Nadpis tvého zápisu';const body=document.createElement('div');paintText(body,{...values,text:values.text||'Tady se objeví tvůj příběh…'});preview.append(title,body);editor.querySelector('.journal-character-count').textContent=values.text.length.toLocaleString('cs-CZ')+' / 10 000 znaků';}
 function format(kind){const textarea=fields().text,start=textarea.selectionStart,end=textarea.selectionEnd,value=textarea.value.slice(start,end);let replacement;
  if(kind==='list')replacement=(value||'Položka seznamu').split('\n').map(line=>'- '+line).join('\n');else replacement=(kind==='bold'?'**':'*')+(value||'text')+(kind==='bold'?'**':'*');
  if(textarea.value.length-(end-start)+replacement.length>10000)return;textarea.setRangeText(replacement,start,end,'select');textarea.focus();updatePreview();}
 async function save(event){
  event.preventDefault();if(!draft||!canEdit||saving)return;const pending={...draft,...editorValues()},version=requestVersion;
  saving=true;editor.querySelector('.dialog-close').disabled=true;editor.querySelector('fieldset').disabled=true;editor.querySelector('.editor-status').textContent='Ukládám zápis…';
  try{const result=await api('/journal/entries/'+pending.key+(pending.id?'/'+pending.id:''),{method:pending.id?'PUT':'POST',body:JSON.stringify(pending)});if(version!==requestVersion)return;
   entries.set(result.entry.id,result.entry);selected=result.entry.id;resetEditor();history.replaceState(null,'','#journal-'+key+'/'+selected);renderEntry(selected);status('Zápis byl uložen.');
  }catch(error){if(version!==requestVersion)return;if([401,403].includes(error.status)){purge();deny(pending.key,deniedText,'journal');return;}saving=false;editor.querySelector('.dialog-close').disabled=false;editor.querySelector('fieldset').disabled=false;editor.querySelector('.editor-status').textContent=error.message;}
 }
 async function more(){const version=requestVersion,cursor=nextCursor,journalKey=key,button=page.querySelector('.journal-more');if(!cursor)return;button.disabled=true;
  try{const result=await api('/journal/entries/'+journalKey+'?cursor='+encodeURIComponent(cursor));if(version!==requestVersion)return;for(const entry of result.entries)entries.set(entry.id,entry);nextCursor=result.nextCursor;renderIndex();}
  catch(error){if(version===requestVersion){if([401,403].includes(error.status)){purge();deny(journalKey,deniedText,'journal');}else status(error.message);}}finally{button.disabled=false;}
 }
 function init(){
  page=document.createElement('main');page.id='journal-page';page.hidden=true;
  page.innerHTML='<header class="journal-banner"><a class="journal-back" href="#">← Příběh postavy</a><div class="journal-book-emblem"></div><div><span class="journal-permission eyebrow"></span><h1>Osobní deník</h1><p class="journal-owner"></p><p class="journal-owner-signature"></p></div><div class="journal-banner-actions"><button class="journal-refresh" type="button">Obnovit</button><button class="journal-new" type="button">+ Nový zápis</button></div></header><p class="journal-status" role="status" aria-live="polite"></p><div class="journal-layout"><aside class="journal-navigation"><span class="eyebrow">STRÁNKY TVÉHO PŘÍBĚHU</span><nav class="journal-index" aria-label="Zápisky deníku"></nav><button class="journal-more" type="button" hidden>Starší zápisy ↓</button></aside><article class="journal-paper"><div class="journal-entry-actions"></div><div class="journal-paper-content"></div></article></div>';
  selection.before(page);page.querySelector('.journal-new').onclick=()=>showEditor();page.querySelector('.journal-more').onclick=more;page.querySelector('.journal-refresh').onclick=()=>open(key,selected,true);
  editor=document.createElement('dialog');editor.className='journal-editor';editor.setAttribute('aria-labelledby','journal-editor-title');
  editor.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít editor">×</button><span class="eyebrow">SLOVA, KTERÁ ZŮSTANOU</span><h2 class="journal-editor-title" id="journal-editor-title"></h2><form><fieldset><div class="journal-editor-layout"><div class="journal-fields"><label>Nadpis<input name="title" maxlength="120" required placeholder="Jak pojmenuješ tento den?"></label><div class="journal-style-row"><label>Datum události<input name="date" type="date"><small>Nepovinné; můžeš zadat datum z RP.</small></label><label>Písmo<select name="font"><option value="book">Knižní</option><option value="hand">Rukopis</option><option value="typewriter">Strojopis</option></select></label><label>Velikost<select name="size">'+Array.from({length:11},(_,i)=>'<option value="'+(i+16)+'"'+(i+16===19?' selected':'')+'>'+(i+16)+' px</option>').join('')+'</select></label></div><div class="journal-formatting" role="group" aria-label="Formátování zápisu"><button type="button" data-format="bold" aria-label="Tučné písmo"><b>B</b></button><button type="button" data-format="italic" aria-label="Kurzíva"><i>I</i></button><button type="button" data-format="list">• Seznam</button><span>Odstavce odděl prázdným řádkem.</span></div><label>Text zápisu<textarea name="text" maxlength="10000" rows="13" required placeholder="Začni psát svůj příběh…"></textarea></label><span class="journal-character-count"></span></div><aside class="journal-preview"><span class="eyebrow">TAKTO SE ZÁPIS ZOBRAZÍ</span><div class="journal-live-preview"></div></aside></div><p class="editor-status" role="status" aria-live="polite"></p><div class="journal-save-actions"><button class="journal-editor-cancel" type="button">Zrušit</button><button type="submit">Uložit zápis</button></div></fieldset></form>';
  document.body.append(editor);editor.querySelector('form').onsubmit=save;editor.querySelector('.dialog-close').onclick=closeEditor;editor.querySelector('.journal-editor-cancel').onclick=closeEditor;editor.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});editor.querySelector('form').addEventListener('input',updatePreview);for(const button of editor.querySelectorAll('[data-format]'))button.onclick=()=>format(button.dataset.format);
  addEventListener('beforeunload',event=>{if(draft&&dirty()){event.preventDefault();event.returnValue='';}});
 }
 return{init,open,purge,get key(){return key;},get route(){return routeKey();},markup};
})();

const SeasonLab=(()=>{
 let stage,canvas,ctx,base,observer,resize,frame=0,lastFrame=0,holes=[],season='off',strength=65,visible=true,disposed=true,reduced,watchVisibility,watchReduced,feedback;
 const seasons={spring:'Jaro',summer:'Léto',autumn:'Podzim',winter:'Zima',off:'Bez efektu'};
 const currentSeason=()=>{const month=Number(new Intl.DateTimeFormat('en',{month:'numeric',timeZone:'Europe/Prague'}).format(new Date()));return month>=3&&month<=5?'spring':month>=6&&month<=8?'summer':month>=9&&month<=11?'autumn':'winter';};
 const noise=i=>{const x=Math.sin(i*91.37+12.91)*43758.54;return x-Math.floor(x);};
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function dispose(){disposed=true;stop();observer?.disconnect();resize?.disconnect();if(watchVisibility)document.removeEventListener('visibilitychange',watchVisibility);if(watchReduced)reduced?.removeEventListener('change',watchReduced);stage=null;canvas=null;ctx=null;base=null;holes=[];}
 function drawFrost(){
  if(!base)return;const c=base.getContext('2d'),w=base.width,h=base.height,level=strength/100;c.clearRect(0,0,w,h);
  const veil=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.1,w/2,h/2,Math.max(w,h)*.6);veil.addColorStop(0,'rgba(206,230,240,'+(.06*level)+')');veil.addColorStop(.6,'rgba(211,234,244,'+(.24*level)+')');veil.addColorStop(1,'rgba(231,246,252,'+(.88*level)+')');c.fillStyle=veil;c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(226,246,255,'+(.65*level)+')';c.lineWidth=1;
  for(let i=0;i<100;i++){const side=i%4,t=noise(i+4),x=side<2?t*w:side===2?noise(i+2)*w*.2:w-noise(i+2)*w*.2,y=side<2?(side===0?noise(i+9)*h*.2:h-noise(i+9)*h*.2):t*h,size=9+noise(i+19)*40;
   c.save();c.translate(x,y);c.rotate(noise(i+17)*Math.PI);for(let arm=0;arm<6;arm++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(0,0);c.lineTo(0,size);for(let j=1;j<=3;j++){const v=size*j/4;c.moveTo(0,v);c.lineTo(-size*.18,v-size*.18);c.moveTo(0,v);c.lineTo(size*.18,v-size*.18);}c.stroke();}c.restore();
  }
 }
 function fit(){if(disposed||!stage)return;const r=stage.getBoundingClientRect();canvas.width=Math.max(1,Math.round(Math.min(r.width,1200)));canvas.height=Math.max(1,Math.round(canvas.width*r.height/r.width));base=document.createElement('canvas');base.width=canvas.width;base.height=canvas.height;drawFrost();stop();paint(performance.now());}
 function paint(time){
  if(frame)cancelAnimationFrame(frame);frame=0;if(disposed||!visible||document.hidden||!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  if(season==='winter'){
   ctx.drawImage(base,0,0);holes=holes.filter(p=>time-p.time<14000);ctx.globalCompositeOperation='destination-out';
   for(const p of holes){const opacity=Math.min(1,(14000-(time-p.time))/6500),r=Math.min(w,h)*.2,g=ctx.createRadialGradient(p.x*w,p.y*h,0,p.x*w,p.y*h,r);g.addColorStop(0,'rgba(0,0,0,'+opacity+')');g.addColorStop(.55,'rgba(0,0,0,'+opacity*.95+')');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(p.x*w-r,p.y*h-r,r*2,r*2);}
   ctx.globalCompositeOperation='source-over';
  }else if(season!=='off'){
   const count=season==='autumn'?Math.ceil(3+strength/17):Math.ceil(5+strength/10),mobile=stage.clientWidth<600,n=mobile?Math.min(count,4):count;
   for(let i=0;i<n;i++){const phase=reduced.matches?noise(i+4):(time/1000*(season==='autumn'?.025:.012)+noise(i+4))%1,x=(noise(i+1)+Math.sin(phase*6+i)*.065)*w,y=phase*(h+70)-35;ctx.save();ctx.translate(x,y);ctx.rotate(i+phase*4);if(season==='autumn'){const size=9+noise(i+6)*8;ctx.fillStyle=['#c68d45','#b76532','#d6ae65'][i%3];ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(size*1.2,-size*.5,size,size,0,size);ctx.bezierCurveTo(-size,size,-size*.9,-size*.5,0,-size);ctx.fill();ctx.strokeStyle='#633e2a';ctx.beginPath();ctx.moveTo(0,-size*.7);ctx.lineTo(0,size*1.3);ctx.stroke();}else{ctx.globalAlpha=.15+strength/250;ctx.fillStyle=season==='spring'?'#c8d9a6':'#efc880';ctx.beginPath();ctx.ellipse(0,0,season==='spring'?5:1.5,season==='spring'?2:1.5,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  if(!reduced.matches&&season!=='off'&&(season!=='winter'||holes.length))schedule();
 }
 function schedule(){if(frame||disposed||!visible||document.hidden)return;frame=requestAnimationFrame(time=>{frame=0;if(time-lastFrame<40){schedule();return;}lastFrame=time;paint(time);});}
 function change(value){season=value==='auto'?currentSeason():value;holes=[];stage.dataset.season=season;feedback.textContent=season==='winter'?'Přejeď myší nebo se dotkni skla. Vyčištěná stopa později znovu namrzne.':season==='off'?'Sezónní vzhled je vypnutý.':'Tvoje atmosféra: '+seasons[season]+'.';stop();paint(performance.now());}
 async function open(container){
  dispose();if(!identity||!container.isConnected||identity.restricted)return;
  disposed=false;season='off';strength=65;visible=true;reduced=matchMedia('(prefers-reduced-motion: reduce)');
  container.innerHTML='<div class="section-heading"><h2>Sezónní laboratoř</h2><span class="status-pill">JEN TVŮJ NÁHLED</span></div><p class="web-muted">Zkoušej atmosféru přímo na skle kroniky. Ostatním hráčům se vzhled nemění.</p><div class="season-controls"><label>Roční období<select class="season-choice"><option value="off">Bez efektu</option><option value="auto">Podle aktuálního období</option><option value="spring">Jaro</option><option value="summer">Léto</option><option value="autumn">Podzim</option><option value="winter">Zima · zamrzlé sklo</option></select></label><label>Síla efektu <output class="season-level">65 %</output><input class="season-strength" type="range" min="10" max="100" value="65"></label><button class="web-button frost-reset" type="button">Obnovit námrazu</button><button class="web-button season-off" type="button">Vypnout náhled</button></div><section class="season-stage" data-season="off" aria-label="Náhled sezónní atmosféry"><div class="season-landscape" aria-hidden="true"></div><div class="season-sunlight" aria-hidden="true"></div><div class="season-preview-copy"><span class="eyebrow">SEDM OSUDŮ · JEDEN HORIZONT</span><h3>Příběhy pod<br>stejným nebem.</h3><p class="season-greeting">Tvoje kronika. Tvoje atmosféra.</p><button type="button" class="web-button season-click-test">Zkusit tlačítko ↗</button><span class="season-click-result" role="status"></span></div><canvas class="season-canvas" aria-hidden="true"></canvas></section><p class="season-feedback" role="status"></p>';
  container.querySelector('h2').textContent='Tvoje roční období';container.querySelector('.status-pill').textContent='VZHLED PRO TEBE';container.querySelector('.web-muted').textContent='Období se mění automaticky podle kalendáře. Tady si můžeš zvolit vlastní atmosféru, její sílu nebo efekty vypnout. Volba platí pro celý web v tomto prohlížeči.';
  stage=container.querySelector('.season-stage');canvas=stage.querySelector('canvas');ctx=canvas.getContext('2d');feedback=container.querySelector('.season-feedback');
  const greetings={spring:'Ráno voní novým začátkem.',summer:'Slunce zlátne nad cestami kroniky.',autumn:'Za okny padá listí. Tvůj příběh pokračuje.',winter:'Za zamrzlým sklem příběhy neutichají.',off:'Tvoje kronika. Tvoje atmosféra.'};
  const choose=value=>{container.querySelector('select').value=value;change(value);stage.querySelector('.season-greeting').textContent=greetings[season];SeasonAtmosphere.configure(value,strength);};
  container.querySelector('select').onchange=event=>choose(event.target.value);
  container.querySelector('.season-strength').oninput=event=>{strength=Number(event.target.value);container.querySelector('output').textContent=strength+' %';drawFrost();stop();paint(performance.now());SeasonAtmosphere.configure(container.querySelector('select').value,strength);};
  container.querySelector('.frost-reset').onclick=()=>choose('winter');container.querySelector('.season-off').onclick=()=>choose('off');
  stage.querySelector('.season-click-test').onclick=()=>stage.querySelector('.season-click-result').textContent='Klikání funguje i přes námrazu.';
  const melt=event=>{if(season!=='winter')return;const r=stage.getBoundingClientRect(),p={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height,time:performance.now()},last=holes.at(-1);if(last&&Math.hypot((last.x-p.x)*r.width,(last.y-p.y)*r.height)<9)return;holes.push(p);if(holes.length>100)holes.shift();paint(p.time);};stage.addEventListener('pointermove',melt,{passive:true});stage.addEventListener('pointerdown',melt,{passive:true});
  observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)paint(performance.now());else stop();});observer.observe(stage);resize=new ResizeObserver(fit);resize.observe(stage);watchVisibility=()=>{if(document.hidden)stop();else if(visible)paint(performance.now());};document.addEventListener('visibilitychange',watchVisibility);watchReduced=()=>{stop();paint(performance.now());};reduced.addEventListener('change',watchReduced);
  strength=SeasonAtmosphere.strength;container.querySelector('.season-strength').value=strength;container.querySelector('output').textContent=strength+' %';fit();choose(SeasonAtmosphere.mode);
 }
 return{open,dispose};
})();

// Public, viewport-sized atmosphere. It contains no account data and never
// intercepts input. Only this browser's preference is saved, not other players'.
const SeasonAtmosphere=(()=>{
 const modes=['auto','off','spring','summer','autumn','winter'];
 let suspended=false;
 let host,canvas,ctx,ice,frame=0,lastFrame=0,holes=[],mode='auto',strength=45,season='off',reduced;
 const current=()=>{const m=Number(new Intl.DateTimeFormat('en',{month:'numeric',timeZone:'Europe/Prague'}).format(new Date()));return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';};
 const noise=i=>{const n=Math.sin(i*83.71+9)*43758.54;return n-Math.floor(n);};
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function frost(){
  if(!ice)return;const c=ice.getContext('2d'),w=ice.width,h=ice.height,s=strength/100;c.clearRect(0,0,w,h);
  const veil=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.64);veil.addColorStop(0,'rgba(214,237,251,0)');veil.addColorStop(.55,'rgba(214,237,251,'+s*.04+')');veil.addColorStop(1,'rgba(230,245,255,'+s*.8+')');c.fillStyle=veil;c.fillRect(0,0,w,h);c.strokeStyle='rgba(223,243,255,'+s*.65+')';c.lineWidth=.8;
  for(let i=0;i<70;i++){const side=i%4,x=side<2?noise(i+4)*w:side===2?noise(i+3)*w*.06:w-noise(i+3)*w*.06,y=side<2?(side===0?noise(i+9)*h*.07:h-noise(i+9)*h*.07):noise(i+4)*h,size=10+noise(i+12)*32;c.save();c.translate(x,y);c.rotate(noise(i)*6);for(let a=0;a<6;a++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(0,0);c.lineTo(0,size);for(let j=1;j<=3;j++){const v=size*j/4;c.moveTo(0,v);c.lineTo(-size*.18,v-size*.18);c.moveTo(0,v);c.lineTo(size*.18,v-size*.18);}c.stroke();}c.restore();}
 }
 function fit(){if(!host)return;const w=innerWidth,h=innerHeight;if(!w||!h)return;canvas.width=Math.round(Math.min(1200,w));canvas.height=Math.round(canvas.width*h/w);ice=document.createElement('canvas');ice.width=canvas.width;ice.height=canvas.height;frost();paint(performance.now());}
 function paint(t){
  stop();if(!ctx||document.hidden)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);if(season==='off')return;
  if(season==='winter'){
   ctx.drawImage(ice,0,0);holes=holes.filter(p=>t-p.t<14000);ctx.globalCompositeOperation='destination-out';
   for(const p of holes){const r=Math.min(w,h)*.18,a=Math.min(1,(14000-t+p.t)/6500),g=ctx.createRadialGradient(p.x*w,p.y*h,0,p.x*w,p.y*h,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(.55,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(p.x*w-r,p.y*h-r,r*2,r*2);}ctx.globalCompositeOperation='source-over';
  }else{
   const n=innerWidth<600?3:Math.ceil(2+strength/18);
   for(let i=0;i<n;i++){const p=reduced.matches?noise(i+4):(t/1000*(season==='autumn'?.023:.012)+noise(i+4))%1,x=(noise(i+1)+Math.sin(p*6+i)*.06)*w,y=p*(h+60)-30;ctx.save();ctx.translate(x,y);ctx.rotate(i+p*4);ctx.globalAlpha=season==='autumn'?.58:.25;
    if(season==='autumn'){const s=10+noise(i+9)*8;ctx.fillStyle=['#b97b39','#bc6536','#d1a65e'][i%3];ctx.beginPath();ctx.moveTo(0,-s);ctx.bezierCurveTo(s,-s*.5,s,s,0,s);ctx.bezierCurveTo(-s,s,-s,-s*.5,0,-s);ctx.fill();ctx.strokeStyle='#633e2a';ctx.beginPath();ctx.moveTo(0,-s*.6);ctx.lineTo(0,s*1.25);ctx.stroke();}
    else{ctx.fillStyle=season==='spring'?'#c9dfa2':'#f2cd89';ctx.beginPath();ctx.ellipse(0,0,season==='spring'?4:1.6,season==='spring'?2:1.6,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  if(!reduced.matches&&(season!=='winter'||holes.length))schedule();
 }
 function schedule(){if(frame||document.hidden||season==='off')return;frame=requestAnimationFrame(t=>{frame=0;if(t-lastFrame<40){schedule();return;}lastFrame=t;paint(t);});}
 function apply(){if(!host)return;season=(suspended||identity?.restricted)?'off':mode==='auto'?current():mode;host.dataset.season=season;document.documentElement.dataset.season=season;holes=[];frost();paint(performance.now());}
 function configure(next,level){mode=modes.includes(next)?next:'auto';strength=Math.min(100,Math.max(10,Number(level)||45));try{localStorage.setItem('nh-season',JSON.stringify({mode,strength}));}catch{}apply();}
 function init(){
  if(host)return;try{const saved=JSON.parse(localStorage.getItem('nh-season'));if(saved&&modes.includes(saved.mode)){mode=saved.mode;strength=Math.min(100,Math.max(10,Number(saved.strength)||45));}}catch{}
  reduced=matchMedia('(prefers-reduced-motion: reduce)');host=document.createElement('div');host.className='season-global';host.setAttribute('aria-hidden','true');host.innerHTML='<span class="season-global-light"></span><canvas></canvas>';document.body.append(host);canvas=host.querySelector('canvas');ctx=canvas.getContext('2d');
  const melt=event=>{if(season!=='winter'||document.hidden)return;const p={x:event.clientX/innerWidth,y:event.clientY/innerHeight,t:performance.now()},last=holes.at(-1);if(last&&Math.hypot((last.x-p.x)*innerWidth,(last.y-p.y)*innerHeight)<10)return;holes.push(p);if(holes.length>70)holes.shift();if(reduced.matches)paint(p.t);else schedule();};
  window.addEventListener('pointermove',melt,{passive:true});window.addEventListener('pointerdown',melt,{passive:true});window.addEventListener('resize',fit,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():apply());reduced.addEventListener('change',()=>paint(performance.now()));fit();apply();
 }
 function syncSession(){const next=(suspended||identity?.restricted)?'off':mode==='auto'?current():mode;if(host&&season!==next)apply();}
 return{init,configure,syncSession,suspend(value){suspended=!!value;apply();},get mode(){return mode;},get strength(){return strength;}};
})();

// Shared voting and discussions. Playback remains owned by Gramophone.
const MusicCommunity=(()=>{
 const up='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H3V10zm0 0 5-8c3 0 2 5 2 6h5c2 0 2 2 1 5l-2 7H7"/></svg>',down='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14V3H3v11zm0 0 5 8c3 0 2-5 2-6h5c2 0 2-2 1-5l-2-7H7"/></svg>';
 let root=null,version=0,user=null,tracks=[],states=new Map(),dialog=null,catalogRetry=null;
 const esc=escapeHTML,valid=(v,id)=>v===version&&user===id&&!!identity&&!identity.restricted&&identity.user.id===id&&root?.isConnected;
 const newTrack=t=>Number.isFinite(Date.parse(t.addedAt))&&Date.parse(t.addedAt)>Date.now()-14*86400000&&Date.parse(t.addedAt)<=Date.now()+300000;
 function markup(track){return (newTrack(track)?'<span class="music-new"><i aria-hidden="true"></i>NEW<span class="visually-hidden"> — nová skladba</span></span>':'')+'<div class="music-reactions" aria-label="Hodnocení skladby"><button type="button" data-vote="1" disabled aria-pressed="false" aria-label="Líbí se mi: '+esc(track.title)+'">'+up+'<span>—</span></button><button type="button" data-vote="-1" disabled aria-pressed="false" aria-label="Nelíbí se mi: '+esc(track.title)+'">'+down+'<span>—</span></button><button type="button" class="music-comments-open" disabled aria-label="Komentáře ke skladbě '+esc(track.title)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v13H9l-6 4z"/></svg><span>—</span></button></div>';}
 function dispose(){version++;clearTimeout(catalogRetry);catalogRetry=null;root=null;user=null;tracks=[];states.clear();dialog?.close();dialog?.remove();dialog=null;}
 function card(id){return root?.querySelector('.record-card[data-id="'+id+'"]');}
 function paint(id){const s=states.get(id),el=card(id);if(!s||!el)return;for(const b of el.querySelectorAll('[data-vote]')){const value=Number(b.dataset.vote);b.disabled=!!s.busy;b.setAttribute('aria-pressed',String(s.vote===value));b.querySelector('span').textContent=String(value===1?s.likes:s.dislikes);}const b=el.querySelector('.music-comments-open');b.disabled=false;b.querySelector('span').textContent=String(s.comments);}
 function feedback(text){const el=root?.querySelector('.music-community-message');if(el)el.textContent=text;}
 async function load(){const v=version,id=user;try{const result=await api('/gramophone/community');if(!valid(v,id))return;for(const s of result.tracks){states.set(s.id,s);paint(s.id);}clearTimeout(catalogRetry);if(tracks.some(t=>!states.has(t.id))){feedback('Hodnocení nových desek se právě synchronizuje…');catalogRetry=setTimeout(()=>{if(valid(v,id))load();},65000);}else feedback('');}catch(error){if(valid(v,id))feedback(([403,404].includes(error.status)?'Hodnocení a komentáře čekají na aktualizaci serveru.':error.message)+' Přehrávání hudby funguje dál.');}}
 function attach(container,list){dispose();root=container;tracks=list;user=identity.user.id;for(const track of list){const el=card(track.id);el.insertAdjacentHTML('beforeend',markup(track));el.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>vote(track.id,Number(b.dataset.vote)));el.querySelector('.music-comments-open').onclick=()=>discussion(track);}load();}
 async function vote(id,value){const s=states.get(id);if(!s||s.busy)return;const v=version,who=user;s.busy=true;paint(id);try{const r=await api('/gramophone/community/'+id+'/vote',{method:'PUT',body:JSON.stringify({value:s.vote===value?0:value})});if(!valid(v,who))return;Object.assign(s,r);feedback('');}catch(error){if(valid(v,who))feedback(error.message);}finally{if(valid(v,who)){s.busy=false;paint(id);}}}
 const date=at=>new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(new Date(at*1000));
 function discussion(track){
  dialog?.close();dialog?.remove();const d=document.createElement('dialog');dialog=d;d.className='music-discussion';d.setAttribute('aria-labelledby','music-discussion-title');
  d.innerHTML='<header><div><span class="eyebrow">HLASY U GRAMOFONU</span><h2 id="music-discussion-title">'+esc(track.title)+'</h2><p>Jak na tebe tahle deska zapůsobila?</p></div><button type="button" class="music-discussion-close" aria-label="Zavřít komentáře">×</button></header><form class="music-comment-form"><label for="music-comment-text">Tvůj komentář</label><textarea id="music-comment-text" name="text" rows="3" maxlength="1000" required placeholder="Napiš, co se ti honí hlavou…"></textarea><div><small class="music-comment-length">0 / 1000</small><button type="button" class="web-button music-cancel-edit" hidden>Zrušit úpravu</button><button type="submit" class="web-button primary">Odeslat komentář</button></div></form><p class="music-discussion-status" role="status" aria-live="polite"></p><div class="music-comment-list"></div><button type="button" class="web-button music-more" hidden>Načíst starší komentáře</button>';
  document.body.append(d);const v=version,who=user,form=d.querySelector('form'),area=form.elements.text,submit=form.querySelector('[type=submit]'),cancel=form.querySelector('.music-cancel-edit'),list=d.querySelector('.music-comment-list'),more=d.querySelector('.music-more');let entries=[],next=null,editing=null,requestId=null,saving=false;
  const active=()=>valid(v,who)&&dialog===d&&d.isConnected;
  const status=t=>{if(active())d.querySelector('.music-discussion-status').textContent=t;};
  const length=()=>d.querySelector('.music-comment-length').textContent=area.value.length+' / 1000';area.oninput=()=>{requestId=null;length();};
  const reset=()=>{editing=null;requestId=null;form.reset();length();submit.textContent='Odeslat komentář';cancel.hidden=true;};cancel.onclick=reset;
  async function close(){if(saving)return;if(area.value.trim()&&!await PortalPolish.confirm('Zahodit rozepsaný komentář?','Komentář zatím není uložený.','Zahodit'))return;if(d.isConnected)d.close();}
  d.querySelector('.music-discussion-close').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});d.addEventListener('close',()=>{d.remove();if(dialog===d)dialog=null;},{once:true});
  function paintList(){list.innerHTML=entries.length?entries.map(c=>'<article class="music-comment" data-comment="'+c.id+'"><div class="music-comment-identity">'+(c.avatar?'<img src="'+esc(c.avatar)+'" alt="" width="38" height="38" loading="lazy">':'<span class="music-comment-avatar" aria-hidden="true">♫</span>')+'<div><strong>'+esc(c.name)+'</strong><time>'+date(c.createdAt)+(c.revision>1?' · upraveno':'')+'</time></div></div><p class="music-comment-body">'+esc(c.text)+'</p>'+((c.mine||c.canDelete)?'<div class="music-comment-tools">'+(c.mine?'<button type="button" data-edit="'+c.id+'">Upravit</button>':'')+(c.canDelete?'<button type="button" data-remove="'+c.id+'">Smazat</button>':'')+'</div>':'')+'</article>').join(''):'<p class="music-comments-empty">Tahle deska zatím čeká na první slovo. Bude tvoje?</p>';
   list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{if(saving)return;editing=entries.find(c=>c.id===b.dataset.edit);area.value=editing.text;requestId=null;length();submit.textContent='Uložit úpravu';cancel.hidden=false;area.focus();form.scrollIntoView({block:'nearest',behavior:'smooth'});});
   list.querySelectorAll('[data-remove]').forEach(b=>b.onclick=async()=>{if(saving)return;const c=entries.find(c=>c.id===b.dataset.remove);if(!await PortalPolish.confirm('Smazat komentář?',c.mine?'Tvůj komentář bude odstraněný.':'Jako správce odstraníš tento komentář.','Smazat'))return;if(!active())return;b.disabled=true;try{await api('/gramophone/community/'+track.id+'/comments/'+c.id,{method:'DELETE',body:JSON.stringify({revision:c.revision})});if(!active())return;if(editing?.id===c.id)reset();await page(false);await load();}catch(error){status(error.message);if(b.isConnected)b.disabled=false;}});
  }
  async function page(append){more.disabled=true;status('Načítám komentáře…');try{const r=await api('/gramophone/community/'+track.id+'/comments'+(append&&next?'?before='+encodeURIComponent(next):''));if(!active())return;entries=append?[...entries,...r.comments.filter(c=>!entries.some(old=>old.id===c.id))]:r.comments;next=r.next;paintList();more.hidden=!next;status('');}catch(error){status(error.message);}finally{if(active())more.disabled=false;}}
  more.onclick=()=>page(true);
  form.onsubmit=async e=>{e.preventDefault();const text=area.value.trim();if(saving||!text)return;const editingNow=editing;requestId??=crypto.randomUUID();saving=true;submit.disabled=true;cancel.disabled=true;area.disabled=true;status(editingNow?'Ukládám úpravu…':'Odesílám komentář…');try{await api('/gramophone/community/'+track.id+'/comments'+(editingNow?'/'+editingNow.id:''),{method:editingNow?'PUT':'POST',body:JSON.stringify(editingNow?{text,revision:editingNow.revision}:{text,requestId})});if(!active())return;reset();await page(false);await load();}catch(error){status(error.message);}finally{if(active()){saving=false;submit.disabled=false;cancel.disabled=false;area.disabled=false;}}};
  d.showModal();page(false);
 }
 return{attach,dispose};
})();

// Audio belongs to the application, never to a route's DOM tree.
const Gramophone=(()=>{
 let root=null,audio=null,dock=null,tracks=[],selected=null,busy=false,volume=.65,viewVersion=0,action=0,message='',owner=null;
 const flights=new Set(),authorized=()=>!!identity&&!identity.restricted;
 const label=track=>'<span class="vinyl"><span class="vinyl-label"><b>'+escapeHTML(track.title)+'</b></span></span>';
 const time=value=>Number.isFinite(value)?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'0:00';
 function status(text){message=text;update();}
 function cancelFlights(){for(const animation of flights)animation.cancel();flights.clear();document.querySelectorAll('.record-flight').forEach(e=>e.remove());}
 function detach(){MusicCommunity.dispose();viewVersion++;cancelFlights();root=null;update();}
 function stop(){action++;busy=false;selected=null;message='Deska je zpátky ve sbírce.';if(audio){audio.pause();audio.removeAttribute('src');audio.load();}update();}
 function dispose(){detach();stop();audio?.remove();audio=null;dock?.remove();dock=null;owner=null;tracks=[];if('mediaSession' in navigator){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}}
 function syncSession(){if(!authorized()||owner&&owner!==identity.user.id)dispose();}
 function initAudio(){
  if(audio)return;owner=identity.user.id;audio=document.createElement('audio');audio.preload='metadata';audio.hidden=true;audio.className='gramophone-audio';audio.volume=volume;document.body.append(audio);
  dock=document.createElement('aside');dock.className='gramophone-dock';dock.hidden=true;dock.setAttribute('aria-label','Hudba na pozadí');
  dock.innerHTML='<a href="#gramophone" class="dock-open"><span aria-hidden="true">♫</span><span class="dock-title"></span></a><button type="button" class="dock-pause" aria-label="Pozastavit hudbu">Ⅱ</button><button type="button" class="dock-stop" aria-label="Vypnout hudbu">×</button>';
  document.body.append(dock);dock.querySelector('.dock-pause').onclick=playPause;dock.querySelector('.dock-stop').onclick=stop;
  for(const event of ['loadedmetadata','durationchange','timeupdate','play','pause','playing','waiting'])audio.addEventListener(event,update);
  audio.addEventListener('ended',()=>{if(root?.isConnected)putAway();else stop();});
  audio.addEventListener('error',()=>{if(selected)status('Skladbu se nepodařilo přehrát. Zkus ji spustit znovu.');});
  if('mediaSession' in navigator){for(const [name,handler]of [['play',()=>{if(audio?.paused)playPause();}],['pause',()=>audio?.pause()],['stop',stop],['seekto',event=>{if(audio&&Number.isFinite(audio.duration)&&Number.isFinite(event.seekTime))audio.currentTime=Math.min(audio.duration,Math.max(0,event.seekTime));}]])try{navigator.mediaSession.setActionHandler(name,handler);}catch{}}
 }
 function update(){
  if(!audio)return;const playing=!!selected&&!audio.paused&&!audio.ended;
  if(dock){dock.hidden=!selected||!!root?.isConnected||!authorized();dock.querySelector('.dock-title').textContent=selected?.title||'';dock.querySelector('.dock-pause').textContent=playing?'Ⅱ':'▶';dock.querySelector('.dock-pause').setAttribute('aria-label',playing?'Pozastavit hudbu':'Přehrát hudbu');}
  if('mediaSession' in navigator)navigator.mediaSession.playbackState=selected?(playing?'playing':'paused'):'none';
  document.body.classList.toggle('has-background-music',!!dock&&!dock.hidden);
  if(!root?.isConnected)return;
  root.querySelector('.gramophone-now-title').textContent=selected?.title||'Vyber si desku';root.querySelector('.gramophone-artist').textContent=selected?.artist||'Hudební místnost New Horizon';
  const deck=root.querySelector('.deck-record');deck.hidden=!selected||busy;deck.classList.toggle('is-spinning',playing&&!document.hidden);if(selected&&deck.dataset.id!==selected.id){deck.innerHTML=label(selected);deck.dataset.id=selected.id;}
  root.querySelector('.tonearm').classList.toggle('is-lowered',!!selected);
  const play=root.querySelector('.gramophone-play');play.textContent=playing?'Pozastavit':'Přehrát';play.disabled=!selected||busy;root.querySelector('.gramophone-stop').disabled=!selected||busy;
  const seek=root.querySelector('.gramophone-position');seek.disabled=!selected||!Number.isFinite(audio.duration)||busy;seek.value=Number.isFinite(audio.duration)&&audio.duration>0?String(audio.currentTime/audio.duration*1000):'0';root.querySelector('.gramophone-current').textContent=time(audio.currentTime);root.querySelector('.gramophone-duration').textContent=time(audio.duration);
  root.querySelector('.gramophone-status').textContent=message||'Klikni na desku a nech kroniku rozeznít.';
  root.querySelectorAll('.record-card').forEach(card=>{card.classList.toggle('is-selected',selected?.id===card.dataset.id);card.querySelector('button').disabled=busy;});
 }
 async function fly(track,toDeck){
  if(!root?.isConnected||!motionAllowed()||document.hidden)return;
  const stage=root.querySelector('.gramophone-stage').getBoundingClientRect(),token=root.querySelector('.record-card[data-id="'+track.id+'"] .record-token')?.getBoundingClientRect();if(!token)return;
  const size=stage.width*.32,deck={x:stage.left+stage.width*.555,y:stage.top+stage.height*.612},shelf={x:token.left+token.width/2,y:token.top+token.height/2};
  const transform=(p,sx,sy)=>'translate('+(p.x-size/2)+'px,'+(p.y-size/2)+'px) scale('+sx+','+sy+')';
  const start=transform(shelf,token.width/size,token.height/size),end=transform(deck,1,.28),flight=document.createElement('div');flight.className='record-flight';flight.style.width=size+'px';flight.innerHTML=label(track);document.body.append(flight);
  const animation=flight.animate(toDeck?[{transform:start,opacity:1},{transform:end,opacity:1}]:[{transform:end,opacity:1},{transform:start,opacity:1}],{duration:720,easing:'cubic-bezier(.22,.68,.25,1)',fill:'both'});flights.add(animation);try{await animation.finished;}catch{}finally{flights.delete(animation);flight.remove();}
 }
 async function select(track){
  if(busy||!authorized())return;if(selected?.id===track.id){await playPause();return;}
  initAudio();const t=++action;busy=true;selected=track;message='Pokládám desku na gramofon…';audio.src=track.url;audio.load();
  if('mediaSession' in navigator&&typeof MediaMetadata!=='undefined')navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:'New Horizon RP'});
  // play() runs in the click gesture, before asynchronous animation work.
  const playback=audio.play().then(()=>{if(t===action)status('Právě hraje · '+track.title);},error=>{if(t===action)status(error.name==='NotAllowedError'?'Deska je připravená. Klikni na Přehrát.':'Zvuk není dostupný. Zkus skladbu spustit znovu.');});
  update();if(root){const stage=root.querySelector('.gramophone-stage'),r=stage.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)stage.scrollIntoView({block:'center',behavior:'instant'});}
  await fly(track,true);if(t===action){busy=false;update();}await playback;
 }
 async function playPause(){
  if(!audio||!selected||busy||!authorized())return;if(!audio.paused){audio.pause();status('Pozastaveno · '+selected.title);return;}
  const t=action;try{if(audio.error){audio.src=selected.url;audio.load();}await audio.play();if(t===action&&selected)status('Právě hraje · '+selected.title);}catch{if(t===action)status('Přehrávání se nepodařilo spustit. Zkus Přehrát znovu.');}
 }
 async function putAway(){
  if(!selected||busy)return;const t=++action,track=selected;busy=true;audio.pause();status('Zvedám raménko a uklízím desku…');if(root)root.querySelector('.tonearm').classList.remove('is-lowered');await fly(track,false);if(t===action)stop();
 }
 async function open(container){
  detach();if(!authorized())throw Error('Pro poslech se přihlas přes Discord.');const v=viewVersion,user=identity.user.id;
  const response=await fetch('/music-library.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Hudební sbírku se nepodařilo načíst.');const library=await response.json();
  if(v!==viewVersion||!authorized()||identity.user.id!==user||!container.isConnected)return;
  tracks=Array.isArray(library.tracks)?library.tracks.filter(t=>/^[a-f0-9]{20}$/.test(t.id)&&/^\/music\/[a-f0-9]{20}\.[a-f0-9]{16}\.(mp3|wav|m4a|ogg)$/.test(t.url)&&typeof t.title==='string'):[];initAudio();root=container;
  root.innerHTML='<section class="gramophone-page"><div class="gramophone-intro"><div><span class="eyebrow">HUDEBNÍ MÍSTNOST · NEW HORIZON</span><h2>Nech kroniku rozeznít.</h2></div></div><div class="gramophone-player"><div class="gramophone-stage"><img class="gramophone-art" src="'+mediaURL('gramophone.png',1600)+'" srcset="'+mediaSrcset('gramophone.png')+'" sizes="(max-width:700px) 95vw, 850px" alt="Starožitný mosazný gramofon na dřevěném podstavci" width="1536" height="1024"><div class="deck-record" hidden></div><span class="tonearm" aria-hidden="true"></span></div><section class="gramophone-controls" aria-label="Ovládání gramofonu"><h3 class="gramophone-now-title"></h3><p class="gramophone-artist"></p><div class="gramophone-buttons"><button type="button" class="web-button primary gramophone-play" disabled>Přehrát</button><button type="button" class="web-button gramophone-stop" disabled>Vypnout a uklidit</button></div><div class="gramophone-seek"><span class="gramophone-current">0:00</span><input type="range" class="gramophone-position" min="0" max="1000" value="0" aria-label="Pozice ve skladbě" disabled><span class="gramophone-duration">0:00</span></div><label class="gramophone-volume">Hlasitost<input type="range" min="0" max="100" value="'+Math.round(volume*100)+'" aria-label="Hlasitost"></label><p class="gramophone-status" role="status"></p></section></div><div class="section-heading"><h2>Naše sbírka</h2><span class="gramophone-count"></span></div><p class="music-community-message" role="status" aria-live="polite"></p><div class="record-shelf"></div><p class="web-muted">Hudba hraje dál i při čtení příběhů nebo po přepnutí záložky. Zastavíš ji tady nebo malým přehrávačem na pozadí.</p></section>';
  root.querySelector('.gramophone-count').textContent=tracks.length+' '+(tracks.length===1?'deska':tracks.length>=2&&tracks.length<=4?'desky':'desek');
  const shelf=root.querySelector('.record-shelf');if(!tracks.length)shelf.innerHTML='<p class="gramophone-empty">První desky už jsou na cestě.</p>';
  for(const track of tracks){const card=document.createElement('article');card.className='record-card';card.dataset.id=track.id;card.innerHTML='<button type="button" class="record-pick" aria-label="Přehrát: '+escapeHTML(track.title)+'"><span class="record-token">'+label(track)+'</span><span class="record-title">'+escapeHTML(track.title)+'</span></button><p class="record-author">'+escapeHTML(track.artist||'New Horizon RP')+'</p>';card.querySelector('button').onclick=()=>select(track);shelf.append(card);}
  MusicCommunity.attach(root,tracks);
  root.querySelector('.gramophone-play').onclick=playPause;root.querySelector('.gramophone-stop').onclick=putAway;
  root.querySelector('.gramophone-position').oninput=event=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(event.target.value)/1000*audio.duration;update();}};
  root.querySelector('.gramophone-volume input').oninput=event=>{volume=Number(event.target.value)/100;audio.volume=volume;};update();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelFlights();update();});
 return{open,detach,dispose,syncSession};
})();

// Local vector library: same stroke and optical size in the picker and on the map.
const AtlasIcons=(()=>{
 const groups={places:'Místa a stavby',travel:'Cesty a práce',nature:'Příroda',personal:'Osobní',warning:'Zákon a nebezpečí'};
 const items={
 pin:['Bod','places','M12 22s7-8 7-13a7 7 0 0 0-14 0c0 5 7 13 7 13M9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
 home:['Domov','places','M3 11l9-8 9 8M5 9v12h14V9M10 21v-7h4v7'],
 well:['Studna','places','M3 8l9-6 9 6M6 7v15M18 7v15M3 22h18M6 15h12M12 6v7M9 11h6v6H9z'],
 ranch:['Ranč','places','M3 10l9-7 9 7v11H3zM8 21V11h8v10M8 12l8 9M16 12L8 21'],
 horse:['Kůň','nature','M6 21l2-7-3-3 4-6 1-3 3 3 5 2 2 5-4 1-3-2-2 10M13 8h.1'],
 horseshoe:['Podkova','travel','M5 3h5v9a2 2 0 0 0 4 0V3h5v9a7 7 0 0 1-14 0zM7 6h.1M7 10h.1M17 6h.1M17 10h.1'],
 shop:['Obchod','places','M3 10l2-6h14l2 6M3 10c0 4 4 4 4 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 4 4 4 0M5 14v7h14v-7M9 21v-5h6v5'],
 coins:['Peníze','travel','M3 7c0-4 14-4 14 0s-14 4-14 0M3 7v8c0 4 14 4 14 0V7M3 11c0 4 14 4 14 0M19 9h2v10c-3 3-9 3-12 2'],
 scales:['Váhy','travel','M12 3v17M6 21h12M4 7h16M6 7l-4 8h8zM18 7l-4 8h8z'],
 train:['Lokomotiva','travel','M7 3h10v13H7zM7 10h10M9 6h2M14 6h1M7 16l-3 5M17 16l3 5M6 19h12M9 13h.1M15 13h.1'],
 station:['Nádraží','places','M3 21V9l9-6 9 6v12M7 21v-8h10v8M8 9h8M10 17h4M10 13v8M14 13v8'],
 bridge:['Most','places','M2 8h20M2 11h20M4 11v10M20 11v10M8 11v4M12 11v2M16 11v4M4 21c0-11 16-11 16 0'],
 camp:['Tábor','places','M3 18L12 3l9 15zM8 18l4-8 4 8M5 22l14-2M5 20l14 2'],
 fire:['Oheň','nature','M12 2c2 6-5 6-2 11 2 0 4-3 5-5 7 7 4 14-3 14S2 15 6 10c-1 5 5 3 6-8z'],
 tent:['Stan','places','M2 21L12 4l10 17zM12 4v17M7 21l5-8 5 8M9 2l6 3'],
 forest:['Les','nature','M8 2L2 12h3l-4 7h14l-4-7h3zM8 19v3M17 3l5 9h-3l4 7h-6M18 19v3'],
 mountain:['Hory','nature','M1 21L9 4l6 12 3-6 5 11zM6 11l3 2 3-2'],
 river:['Řeka','nature','M15 2C2 6 21 10 9 14S5 20 7 22M19 2C6 6 25 10 13 14S9 20 11 22'],
 lake:['Jezero','nature','M3 12c3-3 6 3 9 0s6 3 9 0M3 17c3-3 6 3 9 0s6 3 9 0M3 22c3-3 6 3 9 0s6 3 9 0M5 8l4-5 4 5'],
 boat:['Loď','travel','M3 16h18l-4 5H7zM12 3v13M12 3l7 10h-7M4 23c3-2 5 2 8 0s5 2 8 0'],
 fish:['Ryba','nature','M6 12c4-8 10-8 15 0-5 8-11 8-15 0L2 8v8zM16 11h.1'],
 deer:['Jelen','nature','M8 10l-3-5V2M5 5L2 4M16 10l3-5V2M19 5l3-1M8 9l4 2 4-2 2 5-6 8-6-8zM9 14h.1M15 14h.1'],
 paw:['Tlapka','nature','M8 15c-7 7 15 10 8 0-3-5-5-5-8 0M3 8a2 3 0 1 0 4 0 2 3 0 1 0-4 0M9 5a2 3 0 1 0 4 0 2 3 0 1 0-4 0M16 7a2 3 0 1 0 4 0 2 3 0 1 0-4 0'],
 bird:['Pták','nature','M3 16c6 0 5-9 9-10l5 1 4 4-5-1c1 9-7 13-13 10l5-5M13 8h.1'],
 flower:['Květina','nature','M12 12c-8-2-6-10-1-5 1-8 9-6 5 0 8 0 7 8 1 7 5 7-3 10-5 3-5 6-12 0-7-3-6-2-3-7 2-2zM12 17v6'],
 sun:['Slunce','nature','M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2'],
 moon:['Měsíc','nature','M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z'],
 star:['Hvězda','personal','M12 2l3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1z'],
 heart:['Srdce','personal','M12 21L3 12C-3 4 7-1 12 6c5-7 15-2 9 6z'],
 memory:['Vzpomínka','personal','M4 12a8 8 0 1 0 3-6M3 3v6h6M12 7v6l4 2'],
 camera:['Fotografie','personal','M3 7h4l2-3h6l2 3h4v14H3zM8 13a4 4 0 1 0 8 0 4 4 0 1 0-8 0'],
 letter:['Telegram','personal','M2 5h20v15H2zM2 5l10 9L22 5M2 20l7-8M22 20l-7-8'],
 book:['Kniha','personal','M12 5C8 2 4 2 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1v16'],
 key:['Klíč','personal','M3 7a5 5 0 1 0 10 0A5 5 0 1 0 3 7M12 11l9 10M17 17l3-3M19 19l3-3'],
 lock:['Zámek','personal','M5 10h14v12H5zM8 10V6a4 4 0 0 1 8 0v4M12 15v3'],
 shield:['Ochrana','warning','M12 2l9 4v7c0 6-9 10-9 10s-9-4-9-10V6zM8 12l3 3 5-6'],
 sheriff:['Šerif','warning','M12 2l3 6h7l-4 6 2 7-8-3-8 3 2-7-4-6h7zM9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0'],
 danger:['Nebezpečí','warning','M12 2L1 21h22zM12 8v6M12 17v1'],
 skull:['Lebka','warning','M7 18C-2 12 3 2 12 2s14 10 5 16v4H7zM7 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0M14 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0M10 22v-4M14 22v-4'],
 cross:['Hrob','warning','M10 2h4v5h6v4h-6v11h-4V11H4V7h6z'],
 hospital:['Lékař','places','M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'],
 food:['Jídlo','travel','M4 2v7c0 4 6 4 6 0V2M7 2v20M20 22V2c-7 0-7 12 0 12'],
 beer:['Hostinec','places','M4 5h12v17H4zM16 8h5v9h-5M7 9v9M11 9v9M4 2h12'],
 tools:['Dílna','travel','M15 3c-6-3-10 3-6 7L2 18l4 4 8-8c6 3 11-2 8-8l-4 4-4-4z'],
 mine:['Důl','places','M2 22L5 7l7-5 7 5 3 15M7 22V10l5-3 5 3v12M8 22l3-9M16 22l-3-9M10 16h4'],
 target:['Střelnice','warning','M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0M11 12h2M12 11v2'],
 flag:['Cíl','travel','M4 23V2c6-4 10 4 16 0v12c-6 4-10-4-16 0'],
 trail:['Trasa','travel','M4 21c-5-7 15-3 15-10 0-6-12-1-12-6M4 5a3 3 0 1 0 6 0 3 3 0 1 0-6 0M1 21h6']
 };
 const svg=key=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(items[key]||items.pin)[2]+'"/></svg>';
 return {items,groups,svg};
})();

const Atlas=(()=>{
 const categories={home:'Domov',ranch:'Ranč',camp:'Camp',memory:'Vzpomínka',danger:'Nebezpečí',other:'Jiné'},esc=escapeHTML,svg=AtlasIcons.svg;
 let sharingDialog=null;
 let host,map,layer,drawLayer,resize,poll,generation=0,requestSequence=0,items=[],chosen=null,draft=null,baseline='',picking='',loading,uploading=false,theme='paper',savedDraft=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const endpoint=item=>'/atlas/'+item.kind+'/'+item.id;
 function formData(){const form=host?.querySelector('.atlas-form');return form?Object.fromEntries(new FormData(form)):null;}
 function signature(){return JSON.stringify({fields:formData(),lat:draft?.lat,lng:draft?.lng,points:draft?.points});}
 function dirty(){return uploading||!!draft&&signature()!==baseline;}
 function dispose({preserveDraft=false}={}){
  sharingDialog?.close();sharingDialog?.remove();sharingDialog=null;
  if(preserveDraft&&draft)savedDraft={user:identity?.user.id,draft:{...draft,...formData()},baseline};else if(!preserveDraft)savedDraft=null;
  generation++;requestSequence++;clearInterval(poll);resize?.disconnect();layer?.clearLayers();drawLayer?.clearLayers();map?.remove();map=null;layer=null;drawLayer=null;resize=null;host=null;items=[];chosen=null;draft=null;picking='';uploading=false;
 }
 function library(){
  if(window.L)return Promise.resolve();if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   if(!document.querySelector('[data-atlas-style]')){const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';css.dataset.atlasStyle='';document.head.append(css);}
   const script=document.createElement('script');script.src='vendor/leaflet/leaflet.js';const timer=setTimeout(()=>{script.remove();loading=null;reject(Error('Mapa se nenačetla. Obnov stránku a zkus to znovu.'));},15000);
   script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();loading=null;reject(Error('Mapový prohlížeč se nepodařilo načíst.'));};document.head.append(script);
  });return loading;
 }
 function status(message){if(host)host.querySelector('.atlas-status').textContent=message;}
 function feedback(message){const e=host?.querySelector('.atlas-feedback');if(e)e.textContent=message;}
 function button(label,handler,style=''){const b=document.createElement('button');b.type='button';b.className='web-button '+style;b.textContent=label;b.onclick=handler;return b;}
 function filtered(){const q=host.querySelector('.atlas-search').value.trim().toLocaleLowerCase('cs'),category=host.querySelector('.atlas-category').value,scope=host.querySelector('.atlas-scope').value;return items.filter(p=>(!category||p.category===category)&&(!q||(p.title+' '+p.description).toLocaleLowerCase('cs').includes(q))&&(scope==='all'||scope==='mine'&&p.canEdit||scope==='shared'&&!p.canEdit||scope==='favorites'&&p.favorite||scope===p.kind));}
 function center(item){if(item.kind==='routes')map.fitBounds(item.points,{padding:[45,45],maxZoom:5,animate:!reduced()});else map.setView([item.lat,item.lng],Math.max(4,map.getZoom()),{animate:!reduced()});}
 function markerIcon(icon,color,selected=false){return L.divIcon({className:'atlas-marker-wrap',html:'<span class="atlas-marker'+(selected?' atlas-selected':'')+'" style="--pin:'+color+'">'+svg(icon)+'</span>',iconSize:[38,44],iconAnchor:[19,42]});}
 function render(){
  if(!host||!map)return;layer.clearLayers();const list=host.querySelector('.atlas-list');list.replaceChildren();const rows=filtered();host.querySelector('.atlas-count').textContent=rows.length+' / '+items.length;
  for(const p of rows){
   const selected=chosen?.id===p.id;const b=document.createElement('button');b.type='button';b.className='atlas-place'+(selected?' selected':'');b.innerHTML='<span style="color:'+p.color+'">'+svg(p.icon)+'</span><span><strong>'+esc(p.title)+(p.favorite?' ★':'')+'</strong><small>'+(p.kind==='routes'?'Trasa · ':'')+esc(categories[p.category])+' · '+(p.canEdit?'Moje':'Sdílené')+'</small></span>';b.onclick=()=>select(p);list.append(b);
   if(draft?.id===p.id)continue;
   const choose=event=>picking?map.fire('click',{latlng:event.latlng}):select(p);
   if(p.kind==='routes'){L.polyline(p.points,{color:p.color,weight:selected?6:4,opacity:.85,bubblingMouseEvents:false,className:selected?'atlas-route-selected':''}).addTo(layer).on('click',choose);L.marker(p.points.at(-1),{title:p.title,icon:markerIcon(p.icon,p.color,selected)}).addTo(layer).on('click',choose);}
   else L.marker([p.lat,p.lng],{title:p.title,icon:markerIcon(p.icon,p.color,selected)}).addTo(layer).on('click',choose);
  }
  if(!rows.length)list.innerHTML='<p class="atlas-empty">'+(items.length?'Žádný záznam neodpovídá hledání.':'Tvůj atlas je zatím nepopsaný. Přidej místo nebo nakresli první trasu.')+'</p>';
 }
 function panel(){const p=host.querySelector('.atlas-detail');p.hidden=false;return p;}
 function clear(){if(!host)return;const detail=host.querySelector('.atlas-detail');detail.hidden=true;detail.replaceChildren();chosen=null;draft=null;picking='';uploading=false;drawLayer?.clearLayers();host.classList.remove('atlas-picking');host.querySelector('.atlas-draw-tools').hidden=true;render();}
 async function abandon(){return !dirty()||await PortalPolish.confirm('Zahodit rozepsané změny?','Úpravy místa nebo trasy dosud nebyly uložené.','Zahodit');}
 async function close(){if(await abandon()){clear();status('Atlas je připravený.');}}
 async function select(item,{force=false,pan=true}={}){
  if(!force&&!await abandon())return;if(!host)return;clear();chosen=item;if(pan)center(item);render();
  const p=panel();p.innerHTML='<button class="atlas-close" type="button" aria-label="Zavřít detail">×</button><span class="eyebrow">'+(item.kind==='routes'?'TRASA':'MÍSTO')+' · '+(item.canEdit?'TVŮJ ZÁZNAM':'SDÍLENO KE ČTENÍ')+'</span><div class="atlas-detail-symbol" style="color:'+item.color+'">'+svg(item.icon)+'</div><h2>'+esc(item.title)+'</h2>'+(item.image_url?'<img class="atlas-photo" src="'+esc(item.image_url)+'" alt="Fotografie místa" referrerpolicy="no-referrer" loading="lazy">':'')+'<p class="atlas-description">'+esc(item.description||'Bez poznámky.')+'</p>'+(item.canEdit?'':'<p class="web-muted">Sdílí: '+esc(item.owner_name||'hráč')+'</p>')+'<div class="atlas-actions"></div><div class="atlas-sharing"></div><p class="atlas-feedback" role="status"></p>';
  p.querySelector('.atlas-close').onclick=close;p.querySelector('.atlas-photo')?.addEventListener('error',event=>{event.target.hidden=true;feedback('Fotografie není dostupná nebo k ní již nemáš přístup.');});
  const actions=p.querySelector('.atlas-actions');actions.append(button(item.favorite?'★ Odebrat z oblíbených':'☆ Oblíbené',async event=>{const version=generation;event.target.disabled=true;try{await api(endpoint(item)+'/favorite',{method:item.favorite?'DELETE':'PUT'});if(version!==generation)return;item.favorite=!item.favorite;render();await select(item,{force:true,pan:false});}catch(error){if(version===generation){feedback(error.message);event.target.disabled=false;}}},'atlas-favorite'));
  if(!item.canEdit)return;
  actions.append(button('Upravit',()=>edit(item),'atlas-edit'),button('Sdílet tento záznam',()=>share(item),'atlas-share'),button('Odstranit',async event=>{if(!await PortalPolish.confirm('Odstranit '+(item.kind==='routes'?'trasu':'místo')+'?',item.title+' a jeho sdílení budou odstraněny.','Odstranit'))return;const version=generation;event.target.disabled=true;try{await api(endpoint(item),{method:'DELETE',body:JSON.stringify({revision:item.revision})});if(version!==generation)return;clear();await reload();status('Záznam byl odstraněn.');}catch(error){if(version===generation){feedback(error.message);event.target.disabled=false;}}},'atlas-delete'));
 }
 async function shareAtlas(){
  if(!host||!identity)return;if(sharingDialog?.open){sharingDialog.querySelector('input')?.focus();return;}
  const version=generation,dialog=document.createElement('dialog');sharingDialog=dialog;dialog.className='atlas-share-dialog';dialog.setAttribute('aria-labelledby','atlas-sharing-title');
  dialog.innerHTML='<button type="button" class="atlas-close" aria-label="Zavřít sdílení atlasu">×</button><span class="eyebrow">TVŮJ ATLAS · TVOJE DŮVĚRA</span><h2 id="atlas-sharing-title">Sdílení mého atlasu</h2><p>Povol vybranému hráči čtení <strong>všech svých současných i budoucích míst a tras</strong>, včetně jejich fotografií. Tvoje lore a deník tím nezpřístupníš.</p><form class="atlas-whole-share-form"><label for="atlas-share-user">Discord ID hráče</label><div><input id="atlas-share-user" name="userId" inputmode="numeric" pattern="[0-9]{17,20}" required placeholder="Například 417061947759001600"><button class="web-button" type="submit">Povolit čtení atlasu</button></div></form><h3>Kdo může číst můj atlas <span class="atlas-share-count"></span></h3><div class="atlas-whole-grants">Načítám oprávnění…</div><p class="atlas-whole-share-status" role="status" aria-live="polite"></p><p class="atlas-share-note">Přístup můžeš kdykoliv odebrat. Samostatná povolení pro jednotlivé záznamy se spravují u daného místa nebo trasy.</p>';
  const valid=()=>version===generation&&dialog.isConnected&&sharingDialog===dialog;
  const message=value=>{if(valid())dialog.querySelector('.atlas-whole-share-status').textContent=value;};
  async function load(){
   const result=await api('/atlas/sharing');if(!valid())return;dialog.querySelector('.atlas-share-count').textContent='('+result.grants.length+')';const list=dialog.querySelector('.atlas-whole-grants');list.replaceChildren();
   for(const grant of result.grants){const row=document.createElement('div');row.className='atlas-grant';row.innerHTML=(grant.avatar?'<img class="atlas-share-avatar" src="'+esc(grant.avatar)+'" alt="" width="40" height="40" referrerpolicy="no-referrer">':'')+'<span><strong>'+esc(grant.display_name)+'</strong><small>'+esc(grant.grantee_id)+'</small><small>Celý atlas · pouze čtení</small></span>';
    row.append(button('Odebrat přístup',async event=>{const b=event.currentTarget;if(!await PortalPolish.confirm('Odebrat přístup k celému atlasu?',grant.display_name+' již neuvidí celý tvůj atlas. Případná samostatná povolení k jednotlivým záznamům zůstanou platná.','Odebrat přístup')||!valid())return;b.disabled=true;try{await api('/atlas/sharing/'+grant.grantee_id,{method:'DELETE'});await load();message('Přístup k celému atlasu byl odebrán.');}catch(error){message(error.message);b.disabled=false;}},'atlas-revoke-whole'));list.append(row);
   }if(!result.grants.length)list.innerHTML='<p class="atlas-share-empty">Celý tvůj atlas zatím nevidí nikdo další.</p>';
  }
  const form=dialog.querySelector('form');form.onsubmit=async event=>{event.preventDefault();const b=form.querySelector('button');b.disabled=true;message('Ověřuji hráče na Discordu…');try{await api('/atlas/sharing',{method:'POST',body:JSON.stringify({userId:form.elements.userId.value.trim()})});if(!valid())return;form.reset();await load();message('Čtení celého atlasu bylo povoleno. Platí také pro budoucí místa a trasy.');}catch(error){message(error.message);}finally{b.disabled=false;}};
  dialog.querySelector('.atlas-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();if(sharingDialog===dialog)sharingDialog=null;},{once:true});dialog.onkeydown=event=>event.stopPropagation();document.body.append(dialog);dialog.showModal();try{await load();}catch(error){message(error.message);}
 }
 async function share(item){
  const version=generation,container=host.querySelector('.atlas-sharing');container.innerHTML='<h3>Komu důvěřuješ?</h3><p class="web-muted">Sdílíš pouze tento záznam a jeho fotografii. Lore a deník zůstávají oddělené.</p><form class="atlas-share-form"><label>Discord ID hráče<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" required placeholder="Například 417061947759001600"></label><button class="web-button" type="submit">Povolit čtení</button></form><div class="atlas-grants"></div>';
  async function load(){const result=await api(endpoint(item)+'/grants');if(version!==generation||chosen?.id!==item.id||!container.isConnected)return;const list=container.querySelector('.atlas-grants');list.replaceChildren();for(const grant of result.grants){const row=document.createElement('div');row.className='atlas-grant';row.innerHTML='<span><strong>'+esc(grant.display_name)+'</strong><small>'+esc(grant.grantee_id)+'</small></span>';row.append(button('Odebrat',async event=>{event.target.disabled=true;try{await api(endpoint(item)+'/grants/'+grant.grantee_id,{method:'DELETE'});await load();feedback('Přístup byl odebrán.');}catch(error){feedback(error.message);event.target.disabled=false;}}));list.append(row);}if(!result.grants.length)list.textContent='Zatím nesdílíš s nikým.';}
  container.querySelector('form').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget,b=form.querySelector('button');b.disabled=true;try{await api(endpoint(item)+'/grants',{method:'POST',body:JSON.stringify({userId:form.elements.userId.value.trim()})});if(version!==generation||!form.isConnected)return;form.reset();await load();feedback('Čtení bylo povoleno.');}catch(error){if(version===generation)feedback(error.message);}finally{b.disabled=false;}};
  try{await load();}catch(error){if(version===generation)feedback(error.message);}
 }
 function picker(form){
  const details=form.querySelector('.atlas-icon-picker'),grid=details.querySelector('.atlas-icon-grid'),query=details.querySelector('[type=search]'),group=details.querySelector('select');
  function paint(){grid.replaceChildren();const q=query.value.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{Diacritic}/gu,'');let count=0;for(const [key,[label,category]]of Object.entries(AtlasIcons.items)){if(group.value&&group.value!==category||!label.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(q))continue;count++;const b=document.createElement('button');b.type='button';b.className='atlas-icon-option';b.setAttribute('aria-pressed',String(form.elements.icon.value===key));b.innerHTML=svg(key)+'<span>'+label+'</span>';b.onclick=()=>{form.elements.icon.value=key;details.querySelector('summary span').innerHTML=svg(key)+esc(label);details.open=false;drawDraft();paint();};grid.append(b);}if(!count)grid.innerHTML='<p>Žádná ikona neodpovídá hledání.</p>';}
  query.oninput=paint;group.onchange=paint;details.addEventListener('toggle',()=>{if(details.open)details.scrollIntoView({block:'nearest',behavior:'instant'});});paint();
 }
 async function compressedPhoto(file){
  if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw Error('Vyber JPG, PNG nebo WebP do 15 MB.');
  const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#ead8ba';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);for(const quality of [.84,.68,.5,.32]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=262144)return blob;}throw Error('Fotografie je příliš složitá. Zkus menší obrázek.');}finally{bitmap.close();}
 }
 function edit(item){
  draft={...item,...(item.points?{points:item.points.map(p=>[...p])}:{})};chosen=item;picking='';const p=panel();
  p.innerHTML='<button class="atlas-close" type="button" aria-label="Zavřít formulář">×</button><span class="eyebrow">TVŮJ ATLAS · '+(item.kind==='routes'?'VLASTNÍ TRASA':'VLASTNÍ MÍSTO')+'</span><h2>'+(item.id?'Upravit záznam':item.kind==='routes'?'Nová trasa':'Nové místo')+'</h2><form class="atlas-form"><label>Název<input name="title" maxlength="100" required value="'+esc(item.title||'')+'"></label><label>Druh místa<select name="category">'+Object.entries(categories).map(([k,v])=>'<option value="'+k+'"'+(k===item.category?' selected':'')+'>'+v+'</option>').join('')+'</select></label><input type="hidden" name="icon" value="'+esc(item.icon||'pin')+'"><details class="atlas-icon-picker"><summary><span>'+svg(item.icon)+esc(AtlasIcons.items[item.icon]?.[0]||'Bod')+'</span>Vybrat ikonu</summary><label>Hledat ikonu<input type="search" placeholder="Kůň, vlak, tábor…"></label><label>Skupina<select><option value="">Všechny ikony</option>'+Object.entries(AtlasIcons.groups).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select></label><div class="atlas-icon-grid"></div></details><label>Poznámka<textarea name="description" maxlength="4000" rows="4">'+esc(item.description||'')+'</textarea></label><label>Barva značky<input name="color" type="color" value="'+item.color+'"></label><div class="atlas-position"><span class="atlas-position-label"></span><button type="button" class="web-button atlas-position-edit">'+(item.kind==='routes'?'Upravit body trasy':'Přesunout bod na mapě')+'</button></div><label class="atlas-photo-upload">'+svg('camera')+'Nahrát fotografii<input type="file" class="atlas-file" accept="image/jpeg,image/png,image/webp"></label><p class="atlas-upload-status" role="status"></p><label>Fotografie · uložená nebo HTTPS<input name="image_url" maxlength="1500" placeholder="Nahraj obrázek nebo vlož https://…" value="'+esc(item.image_url||'')+'"></label><button type="button" class="web-button atlas-photo-remove">Odpojit fotografii</button><p class="web-muted">Záznam vidíš ty a hráči s povolením k tomuto záznamu nebo celému tvému atlasu. Fotografie se automaticky zmenší.</p><button class="web-button primary" type="submit">Uložit '+(item.kind==='routes'?'trasu':'místo')+' ↗</button><p class="atlas-feedback" role="status"></p></form>';
  const form=p.querySelector('form');p.querySelector('.atlas-close').onclick=close;picker(form);form.elements.color.oninput=drawDraft;form.querySelector('.atlas-photo-remove').onclick=()=>{form.elements.image_url.value='';};
  form.querySelector('.atlas-position-edit').onclick=()=>{picking=draft.kind==='routes'?'route':'move';host.classList.add('atlas-picking');p.hidden=true;host.querySelector('.atlas-draw-tools').hidden=false;host.querySelector('.atlas-map').scrollIntoView({block:'center',behavior:'instant'});drawDraft();status(draft.kind==='routes'?'Klepáním přidávej body. Stávající body můžeš přetáhnout. Potom dej Dokončit.':'Přetáhni značku nebo klepni na nové místo.');};
  form.querySelector('.atlas-file').onchange=async event=>{const version=generation,file=event.target.files[0];if(!file)return;uploading=true;const save=form.querySelector('[type=submit]');save.disabled=true;form.querySelector('.atlas-upload-status').textContent='Zmenšuji a ukládám fotografii…';try{const blob=await compressedPhoto(file);if(version!==generation||!form.isConnected)return;const result=await api('/atlas/photos',{method:'POST',body:blob,headers:{'Content-Type':'image/jpeg'}});if(version!==generation||!form.isConnected)return;form.elements.image_url.value=result.url;form.querySelector('.atlas-upload-status').textContent='Fotografie připravena · '+Math.ceil(blob.size/1024)+' kB. Ulož záznam.';}catch(error){if(form.isConnected)form.querySelector('.atlas-upload-status').textContent=error.message;}finally{if(form.isConnected){uploading=false;save.disabled=false;}}};
  form.onsubmit=async event=>{event.preventDefault();if(uploading)return;if(draft.kind==='routes'&&draft.points.length<2){feedback('Trasa potřebuje alespoň dva body.');return;}const version=generation,save=form.querySelector('[type=submit]');save.disabled=true;
   try{const data={...formData(),...(draft.kind==='routes'?{points:draft.points}:{lat:draft.lat,lng:draft.lng}),revision:draft.revision},saved=await api('/atlas/'+draft.kind+(draft.id?'/'+draft.id:''),{method:draft.id?'PUT':'POST',body:JSON.stringify(data)});if(version!==generation)return;const kind=draft.kind;draft=null;await reload();if(version!==generation)return;const result=items.find(row=>row.id===saved.id&&row.kind===kind);await select(result,{force:true,pan:false});status('Záznam byl uložen do tvého atlasu.');const marker=host.querySelector('.atlas-selected');marker?.classList.add('atlas-new');marker?.addEventListener('animationend',()=>marker.classList.remove('atlas-new'),{once:true});}catch(error){if(version===generation){feedback(error.message);save.disabled=false;}}
  };baseline=signature();render();drawDraft();status('Uprav údaje a potom záznam ulož. Polohu můžeš změnit na mapě.');form.elements.title.focus({preventScroll:true});
 }
 function drawDraft(){
  if(!draft||!map||!host)return;drawLayer.clearLayers();const form=host.querySelector('.atlas-form'),icon=form?.elements.icon.value||draft.icon,color=form?.elements.color.value||draft.color;
  if(draft.kind==='routes'){
   if(draft.points.length>1)L.polyline(draft.points,{color,weight:5,dashArray:'8 6'}).addTo(drawLayer);
   draft.points.forEach((point,index)=>{L.marker(point,{draggable:true,title:'Bod trasy '+(index+1),icon:L.divIcon({className:'atlas-handle',html:'<span>'+(index+1)+'</span>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(drawLayer).on('dragend',event=>{const p=event.target.getLatLng();if(validPoint(p)){draft.points[index]=[p.lat,p.lng];}drawDraft();});});
  }else L.marker([draft.lat,draft.lng],{draggable:true,title:'Přesunout bod',icon:markerIcon(icon,color,true)}).addTo(drawLayer).on('dragend',event=>{const p=event.target.getLatLng();if(validPoint(p)){draft.lat=p.lat;draft.lng=p.lng;}drawDraft();});
  const label=host.querySelector('.atlas-position-label');if(label)label.textContent=draft.kind==='routes'?draft.points.length+' / 100 bodů':draft.lat.toFixed(2)+' · '+draft.lng.toFixed(2);
  host.querySelector('.atlas-draw-count').textContent=draft.kind==='routes'?draft.points.length+' bodů':'Přesun místa';host.querySelector('.atlas-undo').hidden=draft.kind!=='routes';
 }
 const validPoint=p=>p.lat>=-144&&p.lat<=0&&p.lng>=0&&p.lng<=176;
 async function start(kind){if(!await abandon()||!host)return;clear();if(kind==='places'){picking='new';host.classList.add('atlas-picking');status('Klepni na mapu a vyber místo. Escape výběr zruší.');return;}
  edit({kind:'routes',title:'',description:'',category:'other',color:'#b98a49',icon:'trail',image_url:'',points:[],canEdit:true});host.querySelector('.atlas-position-edit').click();
 }
 async function reload({quiet=false}={}){
  const version=generation,sequence=++requestSequence;try{const result=await api('/atlas/places');if(version!==generation||sequence!==requestSequence||!host)return;items=[...result.places.map(p=>({...p,kind:'places'})),...result.routes.map(p=>({...p,kind:'routes'}))];render();
   if(chosen&&!draft){const next=items.find(p=>p.id===chosen.id&&p.kind===chosen.kind);if(!next){clear();status('Přístup byl odebrán nebo byl záznam odstraněn.');}else if(next.revision!==chosen.revision)await select(next,{force:true,pan:false});}
  }catch(error){if(version===generation&&quiet){layer?.clearLayers();items=[];clear();status('Ověření přístupu selhalo. '+error.message);}else throw error;}
 }
 function applyTheme(value){theme=value==='night'?'night':'paper';host.dataset.atlasTheme=theme;host.querySelector('.atlas-theme').textContent=theme==='night'?'☀ Denní mapa':'☾ Noční mapa';try{localStorage.setItem('nh-atlas-theme',theme);}catch{}}
 async function open(container){
  const restored=savedDraft;dispose({preserveDraft:!!restored});if(!identity||identity.restricted)throw Error('Přihlas se přes Discord.');host=container;const version=generation;
  host.innerHTML='<div class="atlas-toolbar"><div><span class="eyebrow">TAM, KDE ZAČÍNAJÍ PŘÍBĚHY</span><h2>Tvůj atlas</h2></div><button class="web-button atlas-theme" type="button">Noční mapa</button><button class="web-button atlas-add" type="button">+ Místo</button><button class="web-button atlas-add-route" type="button">'+svg('trail')+' Nakreslit trasu</button></div><p class="atlas-status" role="status">Načítám mapu a tvoje záznamy…</p><div class="atlas-workspace"><aside class="atlas-index"><label>Hledat<input type="search" class="atlas-search" placeholder="Název nebo poznámka…"></label><label>Zobrazit<select class="atlas-scope"><option value="all">Všechna dostupná</option><option value="mine">Moje záznamy</option><option value="shared">Sdílené se mnou</option><option value="favorites">★ Oblíbené</option><option value="places">Pouze místa</option><option value="routes">Pouze trasy</option></select></label><label>Kategorie<select class="atlas-category"><option value="">Všechny kategorie</option>'+Object.entries(categories).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select></label><div class="atlas-index-heading"><span class="atlas-count"></span><button class="atlas-reset web-button" type="button">Celá mapa</button></div><div class="atlas-list"></div></aside><div class="atlas-map-shell"><div class="atlas-map" aria-label="Mapa světa Red Dead Redemption 2"></div><span class="atlas-compass" aria-hidden="true">N<br>✥</span><div class="atlas-draw-tools" hidden><span class="atlas-draw-count"></span><button class="web-button atlas-undo" type="button">Zpět o bod</button><button class="web-button atlas-finish" type="button">Dokončit</button><button class="web-button atlas-cancel-draw" type="button">Zrušit</button></div></div><aside class="atlas-detail" hidden></aside></div><p class="atlas-source">Podklad © Rockstar Games · Neoficiální fanouškovský atlas. Moje místa a trasy jsou soukromé, dokud je nesdílím. Noční režim upravuje stejný podklad.</p>';
  const shareButton=button('Sdílení mého atlasu',shareAtlas,'atlas-share-all');shareButton.innerHTML=svg('key')+' Sdílení mého atlasu';host.querySelector('.atlas-toolbar').append(shareButton);
  await Promise.all([reload(),library()]);if(version!==generation||!host?.isConnected)return;
  const bounds=[[-144,0],[0,176]];map=L.map(host.querySelector('.atlas-map'),{crs:L.CRS.Simple,minZoom:1,maxZoom:7,maxBounds:[[-155,-15],[15,191]],maxBoundsViscosity:.9,zoomAnimation:!reduced(),fadeAnimation:!reduced()}).fitBounds(bounds);
  const tiles=L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg',{bounds,noWrap:true,minNativeZoom:2,maxNativeZoom:6,maxZoom:7,attribution:'Map © <a href="https://www.rockstargames.com/" target="_blank" rel="noopener noreferrer">Rockstar Games</a>',referrerPolicy:'no-referrer',keepBuffer:1}).addTo(map);
  let failures=0;tiles.on('tileerror',()=>{if(++failures>3)status('Část mapového podkladu není dostupná. Tvoje záznamy zůstávají uložené.');});
  layer=L.layerGroup().addTo(map);drawLayer=L.layerGroup().addTo(map);resize=new ResizeObserver(()=>map?.invalidateSize({pan:false}));resize.observe(host.querySelector('.atlas-map'));
  for(const selector of ['.atlas-search','.atlas-category','.atlas-scope'])host.querySelector(selector).addEventListener(selector==='.atlas-search'?'input':'change',render);
  host.querySelector('.atlas-reset').onclick=()=>map.fitBounds(bounds,{animate:!reduced()});host.querySelector('.atlas-add').onclick=()=>start('places');host.querySelector('.atlas-add-route').onclick=()=>start('routes');host.querySelector('.atlas-theme').onclick=()=>applyTheme(theme==='paper'?'night':'paper');
  host.querySelector('.atlas-undo').onclick=()=>{if(draft?.kind==='routes'){draft.points.pop();drawDraft();}};
  host.querySelector('.atlas-finish').onclick=()=>{if(draft?.kind==='routes'&&draft.points.length<2){status('Přidej alespoň dva body trasy.');return;}picking='';host.classList.remove('atlas-picking');host.querySelector('.atlas-draw-tools').hidden=true;panel();};host.querySelector('.atlas-cancel-draw').onclick=close;
  map.on('click',event=>{if(!picking)return;const p=event.latlng;if(!validPoint(p)){status('Vyber bod uvnitř mapy.');return;}if(picking==='new'){host.classList.remove('atlas-picking');edit({kind:'places',lat:p.lat,lng:p.lng,title:'',description:'',category:'home',color:'#b98a49',icon:'pin',image_url:'',canEdit:true});}else if(picking==='move'){draft.lat=p.lat;draft.lng=p.lng;drawDraft();picking='';host.classList.remove('atlas-picking');host.querySelector('.atlas-draw-tools').hidden=true;panel();}else if(draft.points.length<100){draft.points.push([p.lat,p.lng]);drawDraft();}else status('Trasa může mít nejvýše 100 bodů.');});
  host.onkeydown=event=>{if(event.key==='Escape')close();};try{theme=localStorage.getItem('nh-atlas-theme')||'paper';}catch{}applyTheme(theme);render();
  if(restored?.user===identity.user.id&&(!restored.draft.id||items.some(p=>p.id===restored.draft.id&&p.canEdit))){edit(restored.draft);baseline=restored.baseline;status('Rozepsaný záznam byl obnoven.');}else status('Tvoje místa, tvoje trasy. Začni tlačítkem + Místo nebo Nakreslit trasu.');savedDraft=null;
  poll=setInterval(()=>{if(host&&!document.hidden&&!draft&&!picking)reload({quiet:true});},15000);
 }
 return {open,dispose,dirty,get pendingDraft(){return !!savedDraft;}};
})();

// Ústav rozdává: private hands, server-authoritative turns, no background polling.
const Cards=(()=>{
 let root,state=null,timer=null,clock=null,version=0,busy=false,offset=0,pendingCard=null,selected=null,announce=false,controller=null,lastSeq=null,errors=0;
 const names={red:'Červená',blue:'Modrá',amber:'Zlatá',green:'Zelená',wild:'Divoká'},symbols={red:'◆',blue:'●',amber:'✦',green:'♣',wild:'✧'},labels={skip:'STŮJ!',reverse:'OBRAT',two:'+2',wild:'BARVA',four:'+4'},portraits={scarlett:'annie-v2.png'};

 const specialArt={"skip":"assets/cards/skip-v2.699593685f96.webp","reverse":"assets/cards/reverse-v2.27e798c550ff.webp","two":"assets/cards/two-v2.268eece19055.webp","wild":"assets/cards/wild-v2.6ac89fce2e47.webp","four":"assets/cards/four-v2.c2d036cd7c35.webp"};
 const specialPeople={skip:'elijah',reverse:'vincent',two:'daniel',wild:'scarlett',four:'nathaniel'};
 const effects={skip:['STŮJ!','Další hráč vynechá tah.'],reverse:['OBRAT','Otočí směr hry. Ve dvou hráčích vynechá soupeře.'],two:['BER DVĚ','Další hráč dobere dvě karty a vynechá tah.'],wild:['ZMĚNA BARVY','Vybereš novou barvu, ve které hra pokračuje.'],four:['BER ČTYŘI','Další hráč dobere čtyři a vynechá. Použij jen bez aktuální barvy v ruce.']};
 function cardDescription(c){return effects[c.value]?.[1]||'Zahraj stejnou barvu nebo číslo jako na stole.';}
 function showCardDetail(c){const box=root?.querySelector('.cards-card-detail');if(!box)return;box.innerHTML='<b>'+esc(effects[c.value]?.[0]||names[c.color]+' '+c.value)+'</b><span>'+esc(cardDescription(c))+'</span>';}
 let volume=.35;
 try{volume=Number(localStorage.getItem('ud-volume')??.35);if(!Number.isFinite(volume))volume=.35;volume=Math.max(0,Math.min(1,volume));}catch{}
 function sound(kind){if(!volume||document.hidden)return;const src='sounds/cards/'+({deal:'deal',join:'tap',ready:'tap',draw:'draw',two:'two',four:'four',reverse:'reverse',skip:'skip',wild:'color',win:'win',last:'bell',catch:'catch',turn:'turn',tick:'tick'}[kind]||'play')+'.wav';const a=new Audio(src);a.volume=volume;a.play().catch(()=>{});}
 const esc=x=>escapeHTML(x),me=()=>identity?.user.id;
 const flights=new Set();
 function stop(){for(const flight of flights){flight.animation.cancel();flight.element.remove();}flights.clear();SeasonAtmosphere.suspend(false);version++;clearTimeout(timer);clearInterval(clock);timer=clock=null;controller?.abort();controller=null;root?.querySelectorAll('dialog').forEach(d=>d.remove());root=null;state=null;pendingCard=null;selected=null;announce=false;busy=false;lastSeq=null;}
 function status(msg){const e=root?.querySelector('.cards-status');if(e)e.textContent=msg;}
 function button(label,fn,cls=''){const b=document.createElement('button');b.type='button';b.className='web-button '+cls;b.textContent=label;b.onclick=fn;return b;}
 function frame(){clock=setInterval(tick,250);root.innerHTML='<div class="cards-toolbar"><a href="#games">← Hry</a><span class="cards-preview">ZKUŠEBNÍ STŮL · 2–7 HRÁČŮ</span><button type="button" data-rules>Jak hrát</button><details class="cards-settings"><summary>Zvuk</summary><div><label>Zvuky <input aria-label="Hlasitost herních zvuků" type="range" min="0" max="100" value="'+Math.round(volume*100)+'"></label></div></details></div><p class="cards-status" role="status" aria-live="polite"></p><div class="cards-view"></div>';
 root.querySelector('[data-rules]').onclick=rules;root.querySelector('input[type=range]').oninput=e=>{volume=+e.target.value/100;try{localStorage.setItem('ud-volume',volume);}catch{}};
 }
 function rules(){const d=document.createElement('dialog');d.className='cards-dialog';d.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít pravidla">×</button><span class="eyebrow">ÚSTAV ROZDÁVÁ</span><h2>Jak přežít léčbu kartami</h2><p>2–7 hráčů. Každý dostane 7 karet. Vyhrává první, kdo nemá žádnou. Karty soupeřů zůstávají skryté. Mluvte spolu přes Discord.</p><h3>Tvůj tah</h3><p>Zahraj stejnou barvu, číslo nebo symbol jako na stole. Divoká karta změní barvu. Můžeš místo hraní dobrat jednu kartu; pokud ji lze zahrát, rozhodni se mezi jejím zahráním a koncem tahu. Ostatní karty po dobrání už zahrát nelze.</p><ul><li><b>Stůj!</b> Další hráč vynechá.</li><li><b>Obrat</b> Otočí směr. Ve dvou hráčích vynechá soupeře.</li><li><b>+2 / +4</b> Další dobere a vynechá. Tresty se neskládají.</li><li><b>+4</b> Jen když nemáš aktuální barvu. Kontroluje server.</li><li><b>Změna barvy</b> Zvolíš jednu ze čtyř barev.</li></ul><h3>Poslední, pacienti!</h3><p>Před zahráním předposlední karty stiskni Poslední, pacienti! Hlášení se odešle se zahranou kartou. Pokud zapomeneš, můžeš ho stisknout i hned po zahrání, dokud tě někdo nenachytá nebo neskončí prostor pro nachytání. Když zapomeneš, někdo jiný tě může nachytat tlačítkem Napráskat do dalšího zahrání, dobrání nebo vypršení tahu. Dobereš dvě.</p><h3>Čas a návrat</h3><p>30 nebo 60 sekund na tah. Při vypršení dobereš jednu a tah končí; po vlastním dobrání jen končí. Obnovením stránky se vrátíš. Přechod jinam tě ze stolu neodhlásí, ale čas běží dál. Tlačítko Opustit stůl tě vyřadí. Při jediném zbývajícím hráči partie skončí.</p><p>Zakladatel spouští hru i odvetu. V čekárně musí být všichni připravení. Stůl automaticky vyprší po 24 hodinách. Bez sázek, žetonů a placených výhod.</p>';root.append(d);d.querySelector('button').onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();}
 async function call(path,options={}){return api('/cards'+path,options);}
 async function open(host){stop();root=host;root.classList.add('cards-root');SeasonAtmosphere.suspend(true);frame();const v=version;const match=/^#games\/ustav\/(UD-[A-Z2-9]{8})$/.exec(location.hash);
 if(match){await load(match[1],v,true);return;}
 root.querySelector('.cards-view').innerHTML='<section class="cards-landing"><div><span class="eyebrow">NOVÁ HRA ÚSTAVU</span><h2>Ústav<br><em>rozdává.</em></h2><p>Sedm postav. Jeden stůl.<br>Léčba dobráním.</p><div class="cards-portrait-line">'+CARD_CAST.map(k=>'<img alt="'+esc(catalog[k].name)+'" src="'+mediaURL('icon-'+k+'.png',320)+'">').join('')+'</div><p class="cards-access">Soukromé stoly pro přátele. Tvůj nick a profilku převezmeme z Discordu.</p></div><div class="cards-entry"><h3>Přisedneš?</h3><div class="cards-resume"></div><form class="cards-join"><label>Kód stolu<input name="code" placeholder="UD-XXXXXXXX" maxlength="100" required autocomplete="off"></label><button class="web-button primary">Připojit se</button></form><form class="cards-create" hidden><h3>Založit nový stůl</h3><label>Název<input name="name" value="Ústav má službu" required maxlength="60"></label><div class="cards-form-row"><label>Místa<select name="capacity">'+[2,3,4,5,6,7].map(n=>'<option '+(n===7?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Čas na tah<select name="seconds"><option value="60">60 sekund</option><option value="30">30 sekund</option></select></label></div><label><input name="uncensored" type="checkbox"> Ústav bez filtru · ostřejší hlášky</label><button class="web-button primary">Vytvořit stůl</button></form></div></section>';
 const join=root.querySelector('.cards-join');join.onsubmit=async e=>{e.preventDefault();const code=join.elements.code.value.trim().toUpperCase().match(/UD-[A-Z2-9]{8}/)?.[0];if(!code){status('Kód má podobu UD-XXXXXXXX. Můžeš vložit i celou pozvánku.');return;}location.hash='#games/ustav/'+code;};
 const create=root.querySelector('.cards-create');create.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;create.querySelector('button').disabled=true;try{const s=await call('/rooms',{method:'POST',body:JSON.stringify({name:create.elements.name.value,seconds:+create.elements.seconds.value,capacity:+create.elements.capacity.value,uncensored:create.elements.uncensored.checked})});if(version===v)location.hash='#games/ustav/'+s.code;}catch(error){if(v===version){status(error.message);try{const c=await call('/current');if(c.code){const a=document.createElement('a');a.href='#games/ustav/'+c.code;a.textContent='Vrátit se k vytvořenému stolu';root.querySelector('.cards-resume').replaceChildren(a);}}catch{}}}finally{if(v===version){busy=false;create.querySelector('button').disabled=false;}}};
 try{const current=await call('/current');if(v!==version)return;create.hidden=!current.canCreate;if(current.code){const a=document.createElement('a');a.href='#games/ustav/'+current.code;a.className='web-button';a.textContent='Pokračovat u mého stolu ↗';root.querySelector('.cards-resume').append(a);}if(!current.canCreate)status('Zkušební stoly zakládá kubiasofficial. Vyžádej si pozvánku a můžeš hrát také.');}catch(e){if(v===version)status(e.message);}
 }
 const CARD_CAST=['daniel','nathaniel','vincent','elijah','katie','scarlett','sophie'];
 async function load(code,v=version,initial=false){if(v!==version||!root||document.hidden)return;try{const s=await call('/rooms/'+code);if(v!==version)return;accept(s);errors=0;}catch(e){if(v!==version)return;if(e.status===403&&initial){root.querySelector('.cards-view').innerHTML='<section class="cards-invite"><span class="eyebrow">MÁŠ POZVÁNKU</span><h2>U stolu je místo i pro tebe.</h2><p>Stůl '+esc(code)+'. Přisedni a potvrď připravenost.</p></section>';root.querySelector('.cards-invite').append(button('Přisednout',()=>join(code)));return;}errors++;status(e.message+' '+(state?'Spojení zkusím obnovit.':''));if(e.status===401||e.status===403||e.status===404)return;}schedule(code,v);}
 async function join(code){if(busy)return;busy=true;const v=version;try{const s=await call('/rooms/'+code+'/join',{method:'POST',body:JSON.stringify({requestId:crypto.randomUUID()})});if(v===version){busy=false;accept(s);schedule(code,v);}}catch(e){if(v===version)status(e.message);}finally{if(v===version)busy=false;}}
 function schedule(code,v){clearTimeout(timer);if(root&&!document.hidden)timer=setTimeout(()=>load(code,v),errors?Math.min(15000,3000*errors):state?.status==='playing'?1800:4000);}
 function accept(s){if(state?.code===s.code&&s.revision<state.revision)return;if(s.viewer!==me()){refreshSession(true);return;}offset=s.serverTime*1000-Date.now();const changed=state?.revision!==s.revision||state?.code!==s.code;const prior=state;state=s;if(changed){root.querySelector('.cards-colors')?.close();if(prior&&s.event?.seq!==lastSeq){sound(s.event?.kind);if(s.turn===me()&&s.turn!==prior.turn&&s.status==='playing')sound('turn');}lastSeq=s.event?.seq;const sameHand=prior?.turn===me()&&s.turn===me()&&JSON.stringify(prior.hand.map(c=>c.id))===JSON.stringify(s.hand.map(c=>c.id));if(!sameHand){selected=null;announce=false;}pendingCard=null;render(prior);}tick();}
 async function act(action,extra={}){if(busy||!state)return;const v=version,code=state.code;busy=true;const requestId=crypto.randomUUID(),payload={action,revision:state.revision,requestId,...extra};root.querySelectorAll('[data-action],.ud-hand button').forEach(b=>b.disabled=true);try{const s=await call('/rooms/'+code+'/action',{method:'POST',body:JSON.stringify(payload)});if(v!==version)return;if(s.left){location.hash='#games';return;}status('');busy=false;accept(s);}catch(e){if(v!==version)return;status(e.message);busy=false;await load(code,v);if(v===version&&state)render();}finally{if(v===version)busy=false;}}
 function card(c,interactive=false){
  const b=document.createElement(interactive?'button':'div');if(interactive)b.type='button';
  const special=!!specialArt[c.value],person=specialPeople[c.value]||c.person;
  b.className='ud-card ud-'+c.color+(special?' ud-special ud-special-'+c.value:'');b.dataset.card=c.id;b.dataset.value=c.value;
  const label=({skip:'⊘',reverse:'↶',wild:'✧'}[c.value]||labels[c.value]||c.value),name=catalog[person]?.name||person;
  b.setAttribute('aria-label',names[c.color]+' · '+(labels[c.value]||c.value)+' · '+name);b.title=(effects[c.value]?.[0]||names[c.color]+' '+c.value)+' — '+cardDescription(c);
  const src=special?specialArt[c.value]:mediaURL(portraits[person]||person+'.png',480);
  b.innerHTML='<span class="ud-corner">'+esc(label)+'<small>'+symbols[c.color]+'</small></span><img draggable="false" decoding="async" alt="" src="'+src+'">'+(special?'<span class="ud-effect-mark" aria-hidden="true">'+esc(label)+'</span>':'')+'<span class="ud-card-name">'+esc(name.split(' ').at(-1))+'</span>'+(special?'<span class="ud-type-name">'+effects[c.value][0]+'</span>':'')+'<span class="ud-corner ud-bottom">'+esc(label)+'<small>'+symbols[c.color]+'</small></span>';return b;
 }
 function render(prior){if(!root||!state)return;const s=state,my=s.players.find(p=>p.id===me()),isTurn=s.turn===me(),opponents=s.players.filter(p=>p.id!==me());
 const view=root.querySelector('.cards-view');view.innerHTML='<div class="cards-room-bar"><div><span class="eyebrow">SOUKROMÝ STŮL · KOLO '+s.round+'</span><h2>'+esc(s.name)+'</h2><span class="cards-room-code">'+esc(s.code)+'</span></div><div class="cards-room-actions"></div></div><div class="cards-table"><div class="cards-action-flash" aria-hidden="true"></div><div class="cards-opponents"></div><div class="cards-center"></div><p class="cards-event" role="status" aria-live="polite">'+esc(s.event?.text||'Připravte se. Ústav čeká.')+'</p><div class="cards-own"></div></div><details class="cards-log"><summary>Průběh partie</summary><ol>'+s.log.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></details>';
 const actions=view.querySelector('.cards-room-actions');actions.append(button('Kopírovat pozvánku',async()=>{const link=location.origin+location.pathname+'#games/ustav/'+s.code;try{await navigator.clipboard.writeText(link);status('Pozvánka zkopírována.');}catch{status('Pozvánka: '+link);}}),button('Opustit stůl',async()=>{if(await PortalPolish.confirm('Opustit herní stůl?','Ve hře tě vyřadíme. Přechod do jiné části webu tě pouze dočasně vzdálí.','Opustit stůl'))act('leave');}));
 const opp=view.querySelector('.cards-opponents');opp.style.setProperty('--seats',opponents.length);for(const [seat,p] of opponents.entries()){const e=document.createElement('div');e.dataset.player=p.id;e.style.setProperty('--seat-y',(Math.pow((seat-(opponents.length-1)/2)/Math.max(1,(opponents.length-1)/2),2)*20)+'px');e.className='cards-player'+(s.turn===p.id?' is-turn':'')+(p.left?' has-left':'');e.innerHTML='<img alt="" src="'+esc(p.avatar||mediaURL('icon-'+p.person+'.png',320))+'"><strong>'+esc(p.name)+'</strong><span>'+(p.left?'Odešel':s.status==='lobby'?(p.ready?'✓ Připraven':'Čeká…'):p.count+' karet')+'</span><span class="cards-seat-status"'+(s.turn===p.id?'':' aria-hidden="true"')+'>'+(s.turn===p.id?'▶ NA TAHU':'Čeká')+'</span><div class="ud-mini-backs" aria-hidden="true">▥ ▥ ▥</div>';opp.append(e);}
 view.querySelector('.cards-table').dataset.myTurn=String(isTurn);view.querySelector('.cards-table').dataset.phase=s.status;view.querySelector('.cards-table').dataset.direction=String(s.direction);const center=view.querySelector('.cards-center'),own=view.querySelector('.cards-own');
 if(s.status==='lobby'){
  center.innerHTML='<div class="cards-lobby-mark">✦</div><h3>Ústav má službu.</h3><p>'+s.players.length+' / '+s.capacity+' hráčů · '+s.seconds+' s na tah<br>'+(s.uncensored?'Ústav bez filtru':'Decentní hlášky')+'</p><p>Všichni potvrďte připravenost.<br>Domluva probíhá přes Discord.</p>';
  own.innerHTML='<strong>'+esc(my.name)+'</strong>';own.append(button(my.ready?'✓ Připraven · zrušit':'Jsem připraven',()=>act('ready'),'primary'));
  if(s.host===me()){const b=button('Rozdat karty',()=>act('start'),'primary');b.disabled=s.players.length<2||!s.players.every(p=>p.ready)||busy;own.append(b);}
 }else if(s.status==='finished'){
  const winner=s.players.find(p=>p.id===s.winner);center.innerHTML='<div class="cards-victory"><span>✦</span><span class="eyebrow">ÚSTAV MÁ VÍTĚZE</span><h3>'+esc(winner?.name||'Partie skončila')+'</h3><p>Zbytek ústavu může dál míchat.</p></div>';
  if(s.host===me())own.append(button('Odveta · zpět do čekárny',()=>act('rematch'),'primary'));
 }else{
  const turn=s.players.find(p=>p.id===s.turn);center.innerHTML='<div class="cards-turn-label '+(isTurn?'is-mine':'')+'" role="status" aria-live="polite"><img class="cards-turn-avatar" alt="" src="'+esc(turn?.avatar||mediaURL('icon-'+(turn?.person||'nathaniel')+'.png',320))+'"><div class="cards-turn-identity"><span>'+(isTurn?'TEĎ HRAJEŠ TY':'PRÁVĚ HRAJE')+'</span><strong>'+(isTurn?'Jsi na tahu':esc(turn?.name))+'</strong></div><div class="cards-turn-time"><span class="cards-clock" role="timer" aria-live="off"></span><small>DO KONCE TAHU</small></div><span class="cards-turn-progress" aria-hidden="true"></span></div><div class="cards-piles"><button type="button" class="ud-back" data-action="draw" aria-label="Dobrat jednu kartu"><span>ÚSTAV<br><b>ROZDÁVÁ</b><small>✦ NEW HORIZON ✦</small></span></button><div class="cards-discard"></div></div><div class="cards-color ud-'+s.color+'">'+symbols[s.color]+' '+names[s.color]+' <span aria-label="Směr hraní">'+(s.direction===1?'↻':'↺')+'</span></div>';
  const top=card(s.top);if(prior?.top?.id!==s.top.id&&prior)top.classList.add('ud-play-flight');center.querySelector('.cards-discard').append(top);center.querySelector('[data-action=draw]').disabled=!isTurn||!!s.drawn||busy;center.querySelector('[data-action=draw]').onclick=()=>act('draw');
  own.innerHTML='<div class="cards-own-heading">'+(isTurn?'<b class="cards-your-turn">▶ TVŮJ TAH</b>':'')+'<strong>'+esc(my.name)+' · '+s.hand.length+' karet</strong><span>'+(isTurn?'Vyber kartu nebo dober.':'Teď hraje: '+esc(turn?.name))+'</span></div><div class="cards-card-detail" aria-live="polite"><b>TVOJE RUKA</b><span>Vyber kartu. Tady uvidíš její účinek.</span></div><div class="ud-hand" aria-label="Tvoje karty"></div><div class="cards-hand-actions"></div>';
  const hand=own.querySelector('.ud-hand');hand.classList.toggle('is-dense',s.hand.length>10);for(const [index,c] of s.hand.entries()){const b=card(c,true),playable=s.playable.includes(c.id);const middle=(s.hand.length-1)/2,spread=s.hand.length<=10?1.8:.55;b.style.setProperty('--fan-angle',(Math.max(-8,Math.min(8,(index-middle)*spread)))+'deg');b.style.setProperty('--fan-y',(Math.pow((index-middle)/Math.max(1,middle),2)*12)+'px');b.style.setProperty('--card-order',index);b.classList.toggle('is-playable',playable);b.disabled=!playable||busy;b.onclick=()=>{selected=c.id;showCardDetail(c);hand.querySelectorAll('button').forEach(x=>x.classList.toggle('is-selected',x.dataset.card===c.id));const play=own.querySelector('[data-play]');play.disabled=false;play.textContent='Zahrát '+(labels[c.value]||c.value);sound('tap');};if(prior&&!prior.hand.some(x=>x.id===c.id))b.classList.add('ud-draw-flight');if(!prior||prior.status==='lobby'){b.classList.add('ud-draw-flight');b.style.animationDelay=(hand.children.length*.035)+'s';}hand.append(b);}
  const controls=own.querySelector('.cards-hand-actions');const last=button('Poslední, pacienti!',()=>{
   if(s.hand.length===1){act('announce');return;}
   announce=!announce;last.setAttribute('aria-pressed',String(announce));last.classList.toggle('is-announced',announce);last.textContent=announce?'✓ Poslední ohlásím při zahrání':'Poslední, pacienti!';status(announce?'Hlášení je připravené. Teď zahraj předposlední kartu.':'Hlášení poslední karty bylo zrušené.');
  },'cards-last');
  const preparing=isTurn&&s.hand.length===2,canCall=s.hand.length===1&&s.catchTarget===me();last.disabled=busy||(!preparing&&!canCall);last.dataset.last='';
  if(preparing){last.setAttribute('aria-pressed',String(announce));last.classList.toggle('is-announced',announce);if(announce)last.textContent='✓ Poslední ohlásím při zahrání';}
  else if(s.hand.length===1&&!canCall)last.textContent='Jedna karta · hlášení uzavřeno';
  last.title=preparing?'Připrav hlášení a pak zahraj kartu.':canCall?'Ohlas poslední kartu, než tě někdo nachytá.':'Hlášení je dostupné při dvou kartách na tvém tahu nebo ihned po odhození předposlední.';
  controls.append(last);
  const play=button('Vyber kartu',()=>{const c=s.hand.find(c=>c.id===selected);if(!c)return;if(c.color==='wild')chooseColor(c);else act('play',{cardId:c.id,announce});},'primary');play.dataset.play='';play.disabled=!selected||!s.playable.includes(selected);if(!play.disabled){const c=s.hand.find(c=>c.id===selected);play.textContent='Zahrát '+(labels[c.value]||c.value);own.querySelector('[data-card="'+selected+'"]')?.classList.add('is-selected');}controls.append(play);if(selected){const active=s.hand.find(c=>c.id===selected);if(active)showCardDetail(active);}hand.onpointerover=e=>{const c=s.hand.find(c=>c.id===e.target.closest('[data-card]')?.dataset.card);if(c&&!selected)showCardDetail(c);};hand.onfocusin=e=>{const c=s.hand.find(c=>c.id===e.target.closest('[data-card]')?.dataset.card);if(c)showCardDetail(c);};
  if(s.drawn&&isTurn)controls.append(button('Konec tahu',()=>act('pass')));
  if(s.catchTarget&&s.catchTarget!==me()){const b=button('Napráskat! +2',()=>act('catch'),'cards-catch');controls.append(b);}
 }
 if(prior)requestAnimationFrame(()=>animateTurn(prior,s));tick();
 }

 function fly(from,to,face=false,delay=0){
  if(!from||!to||!root||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();if(!a.width||!b.width)return;
  const element=face?card(state.top):document.createElement('div');if(!face){element.className='ud-back';element.innerHTML='<span>ÚSTAV<br>ROZDÁVÁ</span>';}
  element.setAttribute('aria-hidden','true');Object.assign(element.style,{position:'fixed',left:'0',top:'0',width:'65px',height:'95px',zIndex:'95',pointerEvents:'none'});document.body.append(element);
  const animation=element.animate([{transform:'translate('+(a.x+a.width/2-32)+'px,'+(a.y+a.height/2-47)+'px) rotate(-12deg)',opacity:.9},{transform:'translate('+(b.x+b.width/2-32)+'px,'+(b.y+b.height/2-47)+'px) rotate(8deg)',opacity:0}],{duration:360,delay,easing:'ease-in-out',fill:'both'}),item={animation,element};flights.add(item);animation.finished.catch(()=>{}).finally(()=>{element.remove();flights.delete(item);});
 }
 function animateTurn(prior,next){
  if(!root||state!==next||document.hidden)return;
  const deck=root.querySelector('.ud-back'),discard=root.querySelector('.cards-discard');
  for(const p of next.players){if(p.id===me()||p.left)continue;const old=prior.players.find(x=>x.id===p.id),target=root.querySelector('[data-player="'+p.id+'"]');const count=Math.min(4,Math.max(0,p.count-(old?.count||0)));for(let i=0;i<count;i++)fly(deck,target,false,i*65);}
  if(prior.status==='playing'&&prior.top?.id!==next.top?.id){if(prior.turn!==me())fly(root.querySelector('[data-player="'+prior.turn+'"]'),discard,true);specialMoment(next.top.value,prior,next);}
 }

 function specialMoment(kind,prior,next){
  const flash=root?.querySelector('.cards-action-flash');if(!flash||!effects[kind])return;
  const target=next.players.find(p=>p.count>(prior.players.find(x=>x.id===p.id)?.count??p.count));
  const copy={two:['+2','ZÁSILKA NAVÍC'],four:['+4','NÁKLAD DORUČEN'],reverse:['↶','ZMĚNA SMĚRU'],skip:['⊘','TAH ZASTAVEN'],wild:['✧','NOVÁ BARVA']};
  const [mark,title]=copy[kind];flash.innerHTML='<strong>'+mark+'</strong><div><b>'+title+'</b><span>'+esc(target?.name||names[next.color])+'</span></div>';flash.dataset.kind=kind;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const animation=flash.animate([{opacity:0,transform:'translate(-50%,-8px) scale(.9)'},{opacity:1,transform:'translate(-50%,0) scale(1)',offset:.16},{opacity:1,transform:'translate(-50%,0) scale(1)',offset:.7},{opacity:0,transform:'translate(-50%,-8px) scale(.97)'}],{duration:1300,easing:'ease-out'});
  const item={animation,element:flash};flights.add(item);animation.finished.catch(()=>{}).finally(()=>{flights.delete(item);});
  if(kind==='reverse'){const arrows=root.querySelector('.cards-piles');arrows?.classList.add('is-reversing');setTimeout(()=>arrows?.classList.remove('is-reversing'),500);}
 }
 function chooseColor(c){if(pendingCard)return;pendingCard=c.id;const d=document.createElement('dialog');d.className='cards-dialog cards-colors';d.innerHTML='<h2>Vyber barvu</h2><div></div>';root.append(d);for(const color of Object.keys(names).filter(c=>c!=='wild')){const b=button(symbols[color]+' '+names[color],()=>{d.close();act('play',{cardId:c.id,color,announce});},'ud-'+color);d.querySelector('div').append(b);}d.append(button('Zrušit',()=>d.close()));d.onclose=()=>{pendingCard=null;d.remove();};d.showModal();}
 let lastTick=-1;
 function tick(){if(!root||!state)return;const e=root.querySelector('.cards-clock');if(!e)return;const left=Math.max(0,Math.ceil((state.deadline*1000-Date.now()-offset)/1000));e.textContent=left+' s';e.classList.toggle('is-urgent',left<=5);const panel=root.querySelector('.cards-turn-label');panel?.classList.toggle('is-urgent',left<=5);panel?.style.setProperty('--turn-left',Math.min(1,left/state.seconds));if(state.turn===me()&&left>0&&left<=5&&lastTick!==left){sound('tick');}lastTick=left;}
 return{open,dispose:stop};
})();

const Community=(()=>{
 let page,nav,generation=0,loadedHash='',view='',editorState=null,suspended=null,mailRequest=null,mailDraft=null;
 const labels={given:'Jméno',surname:'Příjmení',nickname:'Přezdívka',age:'Věk v lore',birth:'Datum narození',occupation:'Povolání',relatives:'Rodina a blízcí',kicker:'Motto',description:'Úvodní charakteristika',quote:'Osobní citát',closing:'Závěrečná slova',origin:'Původ',familyTitle:'Nadpis vztahů',familyDescription:'Úvod ke vztahům',chapters:'Kapitoly lore',family:'Vztahy'};
 const permissionLabels={review:'Schvalování změn',activity:'Přehled přihlášení',official:'Telegramy za správu',blacklist:'Správa blacklistu'};
 const icons={edit:'M5 19l4-1L20 7l-3-3L6 15zM14 7l3 3',mail:'M3 6h18v13H3zM3 6l9 7 9-7',admin:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',home:'M3 11l9-8 9 8M6 9v12h12V9',users:'M15 21v-3c0-5-12-5-12 0v3M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 5c5 0 5 7 0 7M18 15c3 0 3 3 3 6',clock:'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',check:'M4 12l5 5L20 6'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[name]+'"/></svg>';
 const stamp=state=>({pending:'Čeká na schválení',approved:'Schváleno',rejected:'Zamítnuto'}[state]||state);
 const date=t=>t?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(new Date(t*1000)):'Zatím nezaznamenáno';
 const routeMatch=()=>/^#(?:manage|edit|telegrams|gramophone|seasons|atlas|games)(?:\/|$)/.test(location.hash);
 const has=permission=>identity?.admin?.permissions.includes(permission);
 const text=data=>escapeHTML(data);
 function setStatus(message){page.querySelector('.community-status').textContent=message;}
 function button(label,handler,style=''){const b=document.createElement('button');b.type='button';b.className='web-button '+style;b.textContent=label;b.onclick=handler;return b;}
 function init(){
  page=document.createElement('main');page.id='community-page';page.hidden=true;portal.after(page);
  nav=document.querySelector('.portal-navigation');
  nav.querySelector('.portal-home').innerHTML=icon('home')+'Můj archiv';
  const edit=document.createElement('a');edit.href='#edit';edit.className='nav-edit';edit.innerHTML=icon('edit')+'Upravit postavu';nav.append(edit);
  const mail=document.createElement('a');mail.href='#telegrams';mail.className='nav-mail';mail.innerHTML=icon('mail')+'Telegramy <span class="web-badge" hidden></span>';nav.append(mail);
  const music=document.createElement('a');music.href='#gramophone';music.className='nav-gramophone';music.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v3H4zM7 19v-4h10v4M12 15V7l8-4v9l-8-5M7 15a3 3 0 1 1 0-6"/></svg>Gramofon';nav.append(music);
  const seasons=document.createElement('a');seasons.href='#seasons';seasons.className='nav-seasons';seasons.innerHTML=icon('clock')+'Roční období';nav.append(seasons);
  const atlas=document.createElement('a');atlas.href='#atlas';atlas.className='nav-atlas';atlas.innerHTML=AtlasIcons.svg('pin')+'Atlas';nav.append(atlas);
  const games=document.createElement('a');games.href='#games';games.className='nav-games';games.innerHTML=icon('users')+'Hry';nav.append(games);
  const admin=document.createElement('a');admin.href='#manage';admin.className='nav-manage';admin.innerHTML=icon('admin')+'Pro správu webu <span class="web-badge review-badge" hidden></span>';nav.append(admin);
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
 }
 function sync(){
  if(!nav)return;
  nav.querySelector('.nav-edit').hidden=!identity?.owned.length;
  nav.querySelector('.nav-manage').hidden=!identity?.admin?.owner&&!identity?.admin?.permissions.length;
  nav.querySelector('.nav-mail').hidden=!!identity?.restricted;
  nav.querySelector('.nav-gramophone').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-seasons').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-atlas').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-games').hidden=!identity||!!identity.restricted;
  for(const [selector,count]of [['.nav-mail',identity?.unread||0],['.nav-manage',identity?.pending||0]]){const badge=nav.querySelector(selector+' .web-badge');badge.hidden=!count;badge.textContent=String(count);}
 }
 function values(){
  const form=page.querySelector('.character-form');if(!form||!editorState)return null;
  const data={};for(const key of Object.keys(labels))if(!['chapters','family'].includes(key))data[key]=form.elements[key].value;
  data.chapters=[...form.querySelectorAll('.edit-chapter')].map(row=>({title:row.querySelector('[data-title]').value,text:row.querySelector('textarea').value}));
  data.family=[...form.querySelectorAll('.edit-relation')].map(row=>Object.fromEntries(['label','name','text','status'].map(key=>[key,row.querySelector('[data-relation='+key+']').value])));
  return data;
 }
 function mailValues(){const f=page.querySelector('.telegram-compose');return f?{recipient:f.elements.recipient.value,subject:f.elements.subject.value,body:f.elements.body.value}:null;}
 function dirty(){if(Atlas.dirty())return true;if(view==='mail'){const v=mailValues();return !!v&&(!!v.subject||!!v.body);}return view==='edit'&&editorState&&JSON.stringify(values())!==editorState.baseline;}
 async function beforeLogout(){return !dirty()||await PortalPolish.confirm('Odhlásit a zahodit rozepsané změny?',view==='mail'?'Rozepsaný telegram nebyl odeslán.':'Neuložené změny postavy se zahodí. Uložený koncept zůstane zachovaný.','Odhlásit');}
 async function beforeRoute(){
  if(loadedHash!==location.hash&&Atlas.dirty()){if(!await PortalPolish.confirm('Opustit rozepsané místo?','Neuložené úpravy místa v atlasu se zahodí.','Opustit atlas')){history.replaceState(null,'',loadedHash);return false;}Atlas.dispose();}
  if(loadedHash!==location.hash&&dirty()&&!await PortalPolish.confirm(view==='mail'?'Zahodit rozepsaný telegram?':'Opustit rozepsanou postavu?',view==='mail'?'Neodeslaný text telegramu se zahodí.':'Neuložené změny se zahodí. Koncept uložený na serveru zůstane zachovaný.',view==='mail'?'Zahodit telegram':'Opustit editor')){history.replaceState(null,'',loadedHash);return false;}return true;
 }
 function purge({preserveDraft=false}={}){
  Cards.dispose();Atlas.dispose({preserveDraft});SeasonLab.dispose();Gramophone.detach();
  if(preserveDraft&&view==='mail'&&mailValues())mailDraft={user:identity?.user.id,hash:loadedHash,data:mailValues(),requestId:mailRequest};else if(!preserveDraft)mailDraft=null;
  if(preserveDraft&&view==='edit'&&editorState)suspended={user:identity?.user.id,data:values(),state:editorState};else if(!preserveDraft)suspended=null;
  generation++;page.hidden=true;page.replaceChildren();document.body.classList.remove('community-view');view='';editorState=null;loadedHash='';mailRequest=null;
 }
 function shell(title,subtitle,type='archive'){
  document.body.classList.add('community-view');
  page.hidden=false;page.className='community-'+type;page.innerHTML='<section class="community-hero"><div><span class="eyebrow">NEW HORIZON · SOUKROMÁ KRONIKA</span><h1>'+text(title)+'</h1><p>'+text(subtitle)+'</p></div><span class="community-hero-mark" aria-hidden="true">✦</span></section><div class="community-workspace"><aside class="community-menu"></aside><section class="community-main"><p class="community-status" role="status" aria-live="polite"></p><div class="community-content"></div></section></div>';
 }
 function content(){return page.querySelector('.community-content');}
 function menu(items){page.querySelector('.community-menu').innerHTML=items.map(([hash,label,kind])=>'<a href="'+hash+'"'+(location.hash===hash?' aria-current="page"':'')+'>'+icon(kind)+'<span>'+text(label)+'</span></a>').join('');}
 async function open(){
  purge({preserveDraft:!!suspended||!!mailDraft||Atlas.pendingDraft});const version=++generation,user=identity?.user.id;loadedHash=location.hash;
  if(!identity){shell('Vstup do svého archivu','Pro správu postavy a telegramy se přihlas přes Discord.');content().innerHTML='<a class="web-button" href="'+loginHref+'">Přihlásit přes Discord</a>';return;}
  try{
   if(loadedHash.startsWith('#games')){view='games';shell('Hry','Společný stůl pro naši partu.','games');await Cards.open(content());}
   else if(loadedHash.startsWith('#edit')){view='edit';shell('Tvůj příběh. Tvými slovy.','Uprav svou postavu. Zveřejní se až po schválení správou.','editor');menu([['#','Můj archiv','home'],['#edit','Upravit postavu','edit'],['#telegrams','Telegramy','mail']]);await editor(version,user);}
   else if(loadedHash.startsWith('#gramophone')){view='gramophone';shell('Gramofon','Desky, které dávají příběhům vlastní hlas.','gramophone');menu([['#','Můj archiv','home'],['#gramophone','Gramofon','home'],['#seasons','Roční období','clock']]);await Gramophone.open(content());}
   else if(loadedHash.startsWith('#seasons')){view='seasons';shell('Roční období','Atmosféra kroniky podle tebe.','seasons');menu([['#','Můj archiv','home'],['#gramophone','Gramofon','home'],['#seasons','Roční období','clock']]);await SeasonLab.open(content());}
   else if(loadedHash.startsWith('#atlas')){view='atlas';shell('Atlas pohraničí','Vlastní místa. Vlastní cesty. Stejný horizont.','atlas');menu([['#','Můj archiv','home'],['#atlas','Atlas','home'],['#telegrams','Telegramy','mail']]);await Atlas.open(content());}
   else if(loadedHash.startsWith('#manage')){view='manage';const atlas=loadedHash==='#manage/atlas';shell(atlas?'Atlas pohraničí':'Správa kroniky',atlas?'Vlastní místa. Vlastní cesty. Stejný horizont.':'Pracovna pro lidi, kteří drží příběhy pohromadě.',atlas?'atlas':'manage');await manage(version,user);}
   else{view='mail';shell('Telegrafní kancelář','Slova, která mají svého adresáta. Soukromá pošta mezi hráči.','mail');await telegrams(version,user);}
   if(version!==generation||user!==identity?.user.id||document.hidden)return;
   window.scrollTo({top:0,behavior:'instant'});document.title=page.querySelector('h1').textContent+' · New Horizon';
  }catch(error){if(version===generation)setStatus(error.message);}
 }
 function valid(version,user){return version===generation&&user===identity?.user.id&&!document.hidden;}
 function field(key,value,area=false){return '<label>'+text(labels[key])+(area?'<textarea name="'+key+'" rows="4" maxlength="'+({description:1500,quote:1500,closing:1500,familyDescription:2000}[key]||500)+'">'+text(value)+'</textarea>':'<input name="'+key+'" value="'+text(value)+'" maxlength="'+({given:100,surname:100,nickname:100,age:80,birth:100,occupation:250,relatives:500,kicker:500,origin:200,familyTitle:150}[key]||200)+'"'+(['given','surname','age'].includes(key)?' required':'')+'>')+'</label>';}
 function chapterRow(chapter){const row=document.createElement('div');row.className='edit-chapter';row.innerHTML='<label>Název kapitoly<input data-title maxlength="160" required value="'+text(chapter.title)+'"></label><label>Text kapitoly<textarea rows="7" maxlength="16000" required>'+text(chapter.text)+'</textarea></label>';row.append(button('Odstranit kapitolu',async()=>{if(await PortalPolish.confirm('Odstranit kapitolu?','Odstraní se z tohoto návrhu. Schválený příběh se zatím nezmění.','Odstranit')){row.remove();paintPreview();}},'subtle'));return row;}
 function relationRow(relation){const row=document.createElement('div');row.className='edit-relation';row.innerHTML=['label','name','text','status'].map(key=>'<label>'+({label:'Role / označení',name:'Jméno',text:'Popis vztahu',status:'Poznámka'}[key])+(key==='text'?'<textarea data-relation="text" maxlength="2000">'+text(relation[key])+'</textarea>':'<input data-relation="'+key+'" maxlength="160" value="'+text(relation[key])+'">')+'</label>').join('');row.append(button('Odstranit vztah',()=>{row.remove();paintPreview();},'subtle'));return row;}
 async function editor(version,user){
  const key=identity.owned[0];if(!key)throw Error('K tvému účtu není přiřazená vlastní postava.');
  const result=await api('/editor/'+key);if(!valid(version,user))return;
  const recovered=suspended?.user===user&&suspended.state.baseRevision===result.revision?suspended:null;suspended=null;
  const initial=result.pending?.data||recovered?.data||result.draft?.data||result.data;
  editorState={key,baseRevision:result.revision,draftRevision:result.draft?.revision||0,baseline:JSON.stringify(initial),pending:!!result.pending};
  if(recovered)editorState.baseline=recovered.state.baseline;
  content().innerHTML=(result.pending?'<div class="web-callout">'+icon('clock')+'<div><strong>Změny čekají na schválení.</strong><p>Žádost odeslána '+date(result.pending.created_at)+'. Rozhodnutí najdeš v telegramech.</p></div></div>':'')+'<div class="editor-layout"><form class="character-form"><fieldset'+(result.pending?' disabled':'')+'><h2>Osobní údaje</h2><div class="web-form-grid">'+['given','surname','nickname','age','birth','occupation','origin','relatives'].map(key=>field(key,initial[key])).join('')+'</div><h2>Hlas tvé postavy</h2>'+['kicker','description','quote','closing'].map(key=>field(key,initial[key],true)).join('')+'<div class="section-heading"><h2>Kapitoly lore</h2><button class="add-chapter web-button subtle" type="button">+ Přidat kapitolu</button></div><p class="field-help">Odděluj odstavce prázdným řádkem. Můžeš použít **tučné písmo** a *kurzívu*.</p><div class="edit-chapters"></div><h2>Vztahy a blízcí</h2>'+field('familyTitle',initial.familyTitle)+field('familyDescription',initial.familyDescription,true)+'<div class="edit-relations"></div><button class="add-relation web-button subtle" type="button">+ Přidat vztah</button><div class="editor-save-bar"><button type="button" class="save-character-draft web-button">Uložit koncept</button><button type="submit" class="submit-character web-button primary">Odeslat ke schválení ↗</button></div></fieldset></form><aside class="character-preview"><span class="eyebrow">NÁHLED NÁVRHU · ZATÍM NEZVEŘEJNĚNO</span><div></div></aside></div><h2>Moje žádosti</h2><div class="my-requests"></div>';
  const form=page.querySelector('.character-form');
  initial.chapters.forEach(c=>form.querySelector('.edit-chapters').append(chapterRow(c)));initial.family.forEach(c=>form.querySelector('.edit-relations').append(relationRow(c)));
  page.querySelector('.add-chapter').onclick=()=>{if(form.querySelectorAll('.edit-chapter').length<40){form.querySelector('.edit-chapters').append(chapterRow({title:'Nová kapitola',text:''}));paintPreview();}};
  page.querySelector('.add-relation').onclick=()=>{if(form.querySelectorAll('.edit-relation').length<20){form.querySelector('.edit-relations').append(relationRow({label:'',name:'',text:'',status:''}));paintPreview();}};
  form.oninput=paintPreview;page.querySelector('.save-character-draft').onclick=()=>saveCharacter(false);form.onsubmit=e=>{e.preventDefault();saveCharacter(true);};
  page.querySelector('.my-requests').innerHTML=result.history.length?result.history.map(r=>'<div class="web-list-row"><span class="status-pill '+r.status+'">'+stamp(r.status)+'</span><span>'+date(r.created_at)+'</span><p>'+text(r.reason||'')+'</p></div>').join(''):'<p class="web-muted">Zatím jsi neposlal žádnou žádost.</p>';
  if(result.draft&&result.draft.baseRevision!==result.revision){editorState.baseRevision=result.revision;setStatus('Koncept vychází ze starší verze. Porovnej ho se schválenou postavou, než jej odešleš.');}
  paintPreview();
 }
 function paintPreview(){
  const data=values();if(!data)return;const preview=page.querySelector('.character-preview>div');
  preview.innerHTML='<img src="'+mediaURL('icon-'+editorState.key+'.png',320)+'" alt="" width="90" height="90"><h2>'+text(data.given)+'<strong>'+text(data.surname)+'</strong></h2><p class="preview-nickname">'+text(data.nickname)+'</p><p>'+text(data.age)+' · '+text(data.occupation)+'</p><blockquote>'+text(data.kicker)+'</blockquote><p>'+text(data.description).replace(/\n/g,'<br>')+'</p>'+data.chapters.map(c=>'<h3>'+text(c.title)+'</h3>'+blocks(c.text||' ')).join('');
 }
 async function saveCharacter(submit){
  if(!editorState||editorState.pending)return;const form=page.querySelector('.character-form');if(!form.reportValidity())return;
  if(submit&&!await PortalPolish.confirm('Odeslat postavu ke schválení?','Schválený příběh zůstane beze změny, dokud správa tento návrh nepřijme.','Odeslat návrh'))return;
  const version=generation,payload={data:values(),baseRevision:editorState.baseRevision,draftRevision:editorState.draftRevision};form.querySelector('fieldset').disabled=true;setStatus(submit?'Odesílám návrh…':'Ukládám koncept…');
  try{const result=await api('/editor/'+editorState.key,{method:submit?'POST':'PUT',body:JSON.stringify(payload)});if(version!==generation)return;editorState.baseline=JSON.stringify(payload.data);
   if(submit){editorState.pending=true;content().prepend(Object.assign(document.createElement('p'),{className:'web-callout submission-success',textContent:result.message}));setStatus('Žádost byla odeslána. Rozhodnutí dorazí do Telegramů.');await refreshSession();}
   else{editorState.draftRevision=result.revision;setStatus('Soukromý koncept je uložený. Ještě nebyl odeslán ke schválení.');form.querySelector('fieldset').disabled=false;}
  }catch(error){if(version===generation){setStatus(error.message);form.querySelector('fieldset').disabled=false;}}
 }
 async function manage(version,user){
  const overview=await api('/manage/overview');if(!valid(version,user))return;
  const own=overview.admin.owner,permissions=overview.admin.permissions;
  const items=[['#manage','Přehled','admin']];if(permissions.includes('review'))items.push(['#manage/requests','Změny','edit']);if(permissions.includes('activity'))items.push(['#manage/users','Uživatelé a přihlášení','users']);if(own)items.push(['#manage/admins','Správci a oprávnění','admin']);if(permissions.includes('blacklist'))items.push(['#manage/blacklist','Blacklist','admin']);if(permissions.includes('official'))items.push(['#manage/mail','Telegramy správy','mail']);if(permissions.includes('review'))items.push(['#manage/audit','Historie rozhodnutí','clock']);menu(items);
  if(own){items.push(['#manage/atlas','Atlas · náhled','home'],['#seasons','Roční období','clock'],['#gramophone','Gramofon','home']);menu(items);}
  const changes=page.querySelector('.community-menu a[href="#manage/requests"]');if(changes&&overview.pending){changes.classList.add('has-pending');changes.dataset.count=overview.pending;}
  const path=loadedHash.split('/');
  if(path[1]==='requests'){
   if(path[2]){await review(path[2],version,user);return;}
   const result=await api('/manage/requests?status='+(path[2]||'pending'));if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><h2>Změny ke schválení</h2><span class="status-pill pending">'+result.requests.length+' čeká</span></div><p class="web-muted">Před rozhodnutím porovnej návrh se schválenou verzí.</p><div class="request-list">'+(result.requests.length?result.requests.map(r=>'<a class="request-card" href="#manage/requests/'+r.id+'"><img src="'+mediaURL('icon-'+r.character_key+'.png',320)+'" width="64" height="64" alt=""><div><h3>'+text(catalog[r.character_key].name)+'</h3><p>'+date(r.created_at)+'</p></div><span>Porovnat změny ↗</span></a>').join(''):'<div class="web-empty">'+icon('check')+'<h3>Všechny spisy jsou vyřízené.</h3><p>Nové žádosti se objeví tady.</p></div>')+'</div>';
  }else if(path[1]==='users'){
   const result=await api('/manage/users');if(!valid(version,user))return;
   content().innerHTML='<h2>Uživatelé a poslední přihlášení</h2><p class="web-muted">Čas posledního úspěšného přihlášení přes Discord. Obnovení stránky jej nemění.</p><div class="user-list">'+result.users.map(r=>'<article class="web-list-row">'+(r.avatar?'<img src="'+text(r.avatar)+'" width="44" height="44" alt="">':'')+'<div><strong>'+text(r.display_name)+'</strong><p>'+text(r.characters.map(k=>catalog[k].name).join(', ')||'Bez přiřazené postavy')+'</p></div><time>'+date(r.last_login)+'</time></article>').join('')+'</div>';
  }else if(path[1]==='atlas'){if(!own)throw Error('Atlas je zatím pouze pro vlastníka webu.');await Atlas.open(content());}
  else if(path[1]==='seasons'){await SeasonLab.open(content());}
  else if(path[1]==='admins'){await administrators(version,user);}
  else if(path[1]==='blacklist'){await blacklist(version,user);}
  else if(path[1]==='audit'){
   const result=await api('/manage/audit');if(!valid(version,user))return;
   const actionLabels={'character.approved':'Schválení postavy','character.rejected':'Zamítnutí návrhu','admin.updated':'Úprava oprávnění správce','admin.removed':'Odebrání správce','blacklist.added':'Omezení přístupu k webu','blacklist.removed':'Obnovení přístupu k webu'};
   content().innerHTML='<h2>Historie rozhodnutí</h2>'+result.events.map(r=>'<article class="web-list-row"><div><strong>'+text(actionLabels[r.action]||'Rozhodnutí správy')+'</strong><p>'+text(r.character_key?catalog[r.character_key].name:r.target)+'</p><p>'+text(r.action.startsWith('admin.')?'Změna přístupu ke správě webu.':r.detail)+'</p><small>Provedl: '+text(r.actor_name||(r.actor_id===identity.user.id?identity.user.name:r.actor_id))+'</small>'+(r.character_key?'<p><a class="web-back" href="#manage/requests/'+r.target+'">Otevřít rozhodnutí ↗</a></p>':'')+'</div><time>'+date(r.created_at)+'</time></article>').join('');
  }else if(path[1]==='mail'){
   if(!permissions.includes('official'))throw Error('Nemáš oprávnění odesílat za správu.');
   content().innerHTML='<h2>Telegramy správy</h2><p>Odešli konkrétnímu hráči zprávu s ověřenou pečetí Správy kroniky.</p><a class="web-button primary" href="#telegrams/compose-official">Napsat úřední telegram ↗</a>';
  }else{
   content().innerHTML='<div class="manage-stats">'+(permissions.includes('review')?'<a href="#manage/requests" class="manage-stat"><span class="signal '+(overview.pending?'signal-pending':'')+'"></span><strong>'+overview.pending+'</strong><h2>Změny ke schválení</h2><p>'+ (overview.pending?'Spisy čekají na tvoje rozhodnutí.':'V tuto chvíli nic nečeká.')+'</p></a>':'')+'<a href="#telegrams" class="manage-stat">'+icon('mail')+'<strong>'+overview.unread+'</strong><h2>Nepřečtené telegramy</h2><p>Tvoje soukromá poštovní schránka.</p></a></div><div class="web-callout"><div><h2>Pracovna správce</h2><p>Každé rozhodnutí má svou stopu. Spravuj pouze údaje, ke kterým máš oprávnění. Soukromé deníky a cizí telegramy zůstávají pod vlastními přístupy.</p></div></div>';
  }
 }
 async function blacklist(version,user){
  const result=await api('/manage/blacklist');if(!valid(version,user))return;
  content().innerHTML='<div class="section-heading"><h2>Blacklist webu</h2><span class="status-pill pending">'+result.users.length+' omezených účtů</span></div><p class="web-muted">Přihlášení zůstane dostupné. Omezený uživatel uvidí pouze oznámení a kontakt na vedení Ústavu. Po obnovení přístupu se vrátí jeho původní oprávnění.</p><form class="blacklist-form"><label>Discord ID hráče<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" maxlength="20" required placeholder="Např. 642857462982115357"></label><label>Interní poznámka pro správu (nepovinná)<textarea name="reason" maxlength="500" rows="3"></textarea></label><p class="field-help">Poznámku vidí pouze oprávněná správa. Hlavního vlastníka webu nelze zablokovat.</p><button class="web-button primary">Odebrat přístup k webu</button></form><h2>Účty s omezeným přístupem</h2><div class="blacklist-list"></div>';
  const list=page.querySelector('.blacklist-list');if(!result.users.length)list.innerHTML='<div class="web-empty">'+icon('check')+'<h3>Žádné omezené účty.</h3></div>';
  for(const row of result.users){const item=document.createElement('article');item.className='web-list-row blacklist-entry';item.dataset.userId=row.user_id;item.innerHTML='<div><strong>'+text(row.display_name)+'</strong><small>'+text(row.user_id)+'</small><p>'+text(row.reason||'Bez interní poznámky.')+'</p><small>Zařazeno: '+date(row.created_at)+' · Správce: '+text(row.created_by)+'</small></div>';item.append(button('Obnovit přístup',async()=>{
   if(!await PortalPolish.confirm('Obnovit přístup k webu?',row.display_name+' bude znovu moci používat web v rozsahu svých oprávnění.','Obnovit přístup'))return;
   const b=item.querySelector('button');b.disabled=true;try{await api('/manage/blacklist/'+row.user_id,{method:'DELETE'});if(valid(version,user))await open();}catch(error){if(valid(version,user)){setStatus(error.message);b.disabled=false;}}
  },'subtle'));list.append(item);}
  page.querySelector('.blacklist-form').onsubmit=async event=>{event.preventDefault();const f=event.target,id=f.elements.userId.value.trim(),reason=f.elements.reason.value;
   if(!await PortalPolish.confirm('Odebrat přístup k webu?',id+' se bude moci přihlásit, ale webové funkce pro něj budou uzamčené.','Odebrat přístup'))return;
   if(!valid(version,user))return;f.querySelector('button').disabled=true;try{await api('/manage/blacklist/'+id,{method:'PUT',body:JSON.stringify({reason})});if(valid(version,user))await open();}catch(error){if(valid(version,user)){setStatus(error.message);f.querySelector('button').disabled=false;}}
  };
 }
 function printable(value){return Array.isArray(value)?value.map(r=>Object.entries(r).map(([k,v])=>k+': '+v).join('\n')).join('\n\n'):String(value||'');}
 async function review(id,version,user){
  const {request:r}=await api('/manage/requests/'+id);if(!valid(version,user))return;
  const changed=Object.keys(labels).filter(key=>JSON.stringify(r.data[key])!==JSON.stringify(r.before[key]));
  content().innerHTML='<a class="web-back" href="#manage/requests">← Zpět na žádosti</a><div class="section-heading"><h2>'+text(catalog[r.character_key].name)+'</h2><span class="status-pill '+r.status+'">'+stamp(r.status)+'</span></div><p class="web-muted">Odesláno '+date(r.created_at)+' · '+changed.length+' upravených oblastí</p><div class="review-diff">'+changed.map(key=>'<section><h3>'+text(labels[key])+'</h3><div class="diff-columns"><div><span>PŮVODNÍ VERZE</span><pre>'+text(printable(r.before[key]))+'</pre></div><div><span>NÁVRH HRÁČE</span><pre>'+text(printable(r.data[key]))+'</pre></div></div></section>').join('')+'</div>'+(r.status==='pending'?'<form class="review-form"><label>Vyjádření správy (povinné při zamítnutí)<textarea name="reason" maxlength="1500" rows="4"></textarea></label><div class="web-actions"><button type="button" class="web-button reject-change">Zamítnout</button><button type="button" class="web-button primary approve-change">Schválit a zveřejnit</button></div></form>':'<p>'+text(r.reason||'')+'</p>');
  if(r.status!=='pending')return;
  const decide=async action=>{
   const reason=page.querySelector('[name=reason]').value;if(action==='reject'&&!reason.trim()){setStatus('Při zamítnutí napiš důvod pro hráče.');return;}
   if(!await PortalPolish.confirm(action==='approve'?'Schválit a zveřejnit změny?':'Zamítnout tento návrh?','Hráč dostane rozhodnutí do Telegramů. Akce se zapíše do historie.',action==='approve'?'Schválit':'Zamítnout'))return;
   page.querySelectorAll('.review-form button').forEach(b=>b.disabled=true);
   try{await api('/manage/requests/'+id,{method:'POST',body:JSON.stringify({action,reason})});if(!valid(version,user))return;await refreshSession();location.hash='#manage/requests';}catch(error){if(version===generation){setStatus(error.message);page.querySelectorAll('.review-form button').forEach(b=>b.disabled=false);}}
  };page.querySelector('.approve-change').onclick=()=>decide('approve');page.querySelector('.reject-change').onclick=()=>decide('reject');
 }
 async function administrators(version,user){
  const result=await api('/manage/admins');if(!valid(version,user))return;
  content().innerHTML='<h2>Správci a oprávnění</h2><div class="web-callout">'+icon('admin')+'<div><strong>Hlavní vlastník: kubiasofficial</strong><p>'+text(result.owner)+' · chráněný přístup</p></div></div><form class="admin-form"><label>Discord ID nového nebo stávajícího správce<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" required></label><div class="permission-options">'+Object.entries(permissionLabels).map(([key,label])=>'<label><input type="checkbox" name="'+key+'">'+text(label)+'</label>').join('')+'</div><button class="web-button primary">Uložit oprávnění</button></form><h2>Pověření správci</h2><div class="admin-list"></div>';
  for(const row of result.admins){const card=document.createElement('article');card.className='web-list-row';card.innerHTML='<div><strong>'+text(row.display_name||row.user_id)+'</strong><p>'+text(row.permissions.map(p=>permissionLabels[p]).join(' · '))+'</p><small>'+text(row.user_id)+'</small></div>';card.append(button('Upravit',()=>{const f=page.querySelector('.admin-form');f.elements.userId.value=row.user_id;for(const key of Object.keys(permissionLabels))f.elements[key].checked=row.permissions.includes(key);f.scrollIntoView({behavior:'smooth',block:'center'});}));card.append(button('Odebrat',async()=>{if(!await PortalPolish.confirm('Odebrat přístup správci?','Jeho správcovská oprávnění přestanou platit. Vlastnictví postavy tím nezměníš.','Odebrat'))return;try{await api('/manage/admins/'+row.user_id,{method:'DELETE'});if(valid(version,user))open();}catch(e){setStatus(e.message);}},'subtle'));page.querySelector('.admin-list').append(card);}
  page.querySelector('.admin-form').onsubmit=async event=>{event.preventDefault();const f=event.target,permissions=Object.keys(permissionLabels).filter(key=>f.elements[key].checked);if(!permissions.length){setStatus('Vyber alespoň jedno oprávnění.');return;}f.querySelector('button').disabled=true;try{await api('/manage/admins/'+f.elements.userId.value,{method:'PUT',body:JSON.stringify({permissions})});if(valid(version,user))open();}catch(e){if(valid(version,user)){setStatus(e.message);f.querySelector('button').disabled=false;}}};
 }
 async function telegrams(version,user){
  menu([['#telegrams','Doručené','mail'],['#telegrams/sent','Odeslané','clock'],['#telegrams/compose','Napsat telegram','edit'],['#','Můj archiv','home']]);
  const path=loadedHash.split('/');
  if(path[1]?.startsWith('compose')){
   const result=await api('/telegrams/contacts');if(!valid(version,user))return;const official=path[1]==='compose-official';
   if(official&&!has('official'))throw Error('Nemáš oprávnění odesílat za správu.');mailRequest=crypto.randomUUID();
   content().innerHTML='<h2>'+(official?'Telegram s pečetí správy':'Napsat soukromý telegram')+'</h2><form class="telegram-compose"><label>Adresát<select name="recipient" required><option value="">Vyber hráče</option>'+result.users.map(r=>'<option value="'+r.id+'">'+text(r.name)+'</option>').join('')+'</select></label><label>Předmět<input name="subject" maxlength="120" required></label><label>Zpráva<textarea name="body" maxlength="5000" rows="12" required></textarea></label><p class="field-help">Telegram uvidíš pouze ty a příjemce. Po odeslání jej nelze upravit.</p><button class="web-button primary">Odeslat telegram ↗</button></form>';
   if(path[2])page.querySelector('[name=recipient]').value=path[2];
   if(mailDraft?.user===user&&mailDraft.hash===loadedHash){const f=page.querySelector('form');for(const [name,value]of Object.entries(mailDraft.data))f.elements[name].value=value;mailRequest=mailDraft.requestId;}else mailDraft=null;
   page.querySelector('form').onsubmit=async event=>{event.preventDefault();const f=event.target;f.querySelector('button').disabled=true;try{const r=await api('/telegrams',{method:'POST',body:JSON.stringify({recipient:f.elements.recipient.value,subject:f.elements.subject.value,text:f.elements.body.value,official,requestId:mailRequest})});if(valid(version,user)){mailDraft=null;f.reset();await refreshSession();location.hash='#telegrams/message/'+r.id;}}catch(e){if(valid(version,user)){setStatus(e.message);f.querySelector('button').disabled=false;}}};
  }else if(path[1]==='message'){
   const {message:r}=await api('/telegrams/'+path[2]);if(!valid(version,user))return;
   content().innerHTML='<a class="web-back" href="#telegrams">← Do schránky</a><article class="telegram-paper">'+(r.official?'<span class="official-seal">'+icon('admin')+' OVĚŘENÁ SPRÁVA KRONIKY</span>':'<span class="eyebrow">SOUKROMÝ TELEGRAM</span>')+'<h2>'+text(r.subject)+'</h2><div class="telegram-address"><p>Od: <strong>'+text(r.sender_name)+'</strong></p><p>Komu: '+text(r.recipient_name)+'</p><time>'+date(r.created_at)+'</time></div><div class="telegram-text">'+text(r.body).replace(/\n/g,'<br>')+'</div></article>';
   if(r.sender_id!==user)content().append(button('Odpovědět',()=>location.hash='#telegrams/compose/'+r.sender_id));
   if(r.recipient_id===user)content().append(button('Smazat z mé schránky',()=>removeTelegrams([r.id]),'subtle telegram-delete'));
   if(r.recipient_id===user&&!r.read_at){await api('/telegrams/'+r.id,{method:'POST',body:'{}'});if(valid(version,user))await refreshSession();}
  }else{
   const sent=path[1]==='sent',n=Number(path[sent?2:1]||0),result=await api('/telegrams?box='+(sent?'sent':'inbox')+'&page='+n);if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><h2>'+(sent?'Odeslané telegramy':'Doručené telegramy')+'</h2><a class="web-button" href="#telegrams/compose">Napsat telegram ↗</a></div><div class="telegram-list">'+(result.messages.length?result.messages.map(r=>'<a href="#telegrams/message/'+r.id+'" class="telegram-row '+(!r.read_at&&!sent?'is-unread':'')+'">'+icon(r.official?'admin':'mail')+'<div><span>'+text(sent?r.recipient_name:r.sender_name)+(r.official?' · SPRÁVA':'')+'</span><h3>'+text(r.subject)+'</h3></div><time>'+date(r.created_at)+'</time></a>').join(''):'<div class="web-empty">'+icon('mail')+'<h3>Ve schránce je zatím klid.</h3><p>Až ti někdo napíše, telegram najdeš tady.</p></div>')+'</div><div class="web-actions">'+(n>0?'<a class="web-button" href="#telegrams/'+(sent?'sent/':'')+(n-1)+'">← Novější</a>':'')+(result.hasMore?'<a class="web-button" href="#telegrams/'+(sent?'sent/':'')+(n+1)+'">Starší →</a>':'')+'</div>';
   if(!sent&&result.messages.length){
    const controls=document.createElement('div');controls.className='telegram-cleanup';const select=document.createElement('label');select.innerHTML='<input type="checkbox"> Vybrat celou stránku';const remove=button('Smazat vybrané',()=>removeTelegrams([...page.querySelectorAll('.telegram-select:checked')].map(c=>c.value)),'subtle');remove.disabled=true;const update=()=>{const boxes=[...page.querySelectorAll('.telegram-select')],checked=boxes.filter(c=>c.checked).length;remove.disabled=!checked;remove.textContent=checked?'Smazat vybrané ('+checked+')':'Smazat vybrané';select.querySelector('input').checked=checked===boxes.length;select.querySelector('input').indeterminate=checked>0&&checked<boxes.length;};
    for(const row of page.querySelectorAll('.telegram-row')){const wrap=document.createElement('div');wrap.className='telegram-select-row';const check=document.createElement('input');check.type='checkbox';check.className='telegram-select';check.value=row.hash.split('/').at(-1);check.setAttribute('aria-label','Vybrat telegram: '+row.querySelector('h3').textContent);check.onchange=update;row.replaceWith(wrap);wrap.append(check,row);}
    select.querySelector('input').onchange=event=>{page.querySelectorAll('.telegram-select').forEach(c=>c.checked=event.target.checked);update();};controls.append(select,remove);page.querySelector('.telegram-list').before(controls);
   }
  }
 }
 async function removeTelegrams(ids){
  if(!ids.length||!await PortalPolish.confirm(ids.length===1?'Smazat tento telegram?':'Smazat vybrané telegramy?','Zmizí pouze z tvé příchozí schránky. Odesílateli zůstane jeho kopie. Smazání nelze vrátit.','Smazat'))return;
  const user=identity?.user.id,version=generation;try{await api('/telegrams',{method:'DELETE',body:JSON.stringify({ids})});if(!valid(version,user))return;await refreshSession();if(location.hash==='#telegrams')await open();else location.hash='#telegrams';}catch(error){if(valid(version,user))setStatus(error.message);}
 }
 function allowed(){if(/^#(?:gramophone|seasons|atlas|games)(?:\/|$)/.test(location.hash))return !!identity&&!identity.restricted;const path=location.hash.split('/')[1];if(path==='admins'||path==='seasons')return !!identity?.admin?.owner;const permission={requests:'review',audit:'review',users:'activity',mail:'official',blacklist:'blacklist'}[path];return permission?has(permission):!!identity?.admin?.owner||!!identity?.admin?.permissions.length;}
 return {init,sync,open,purge,beforeRoute,beforeLogout,get matches(){return routeMatch();},get active(){return view;},allowed};
})();

const UserChrome=(()=>{
 let host,nav,trigger,birthday,settings,birthdayKey=null,birthdayVersion=0,settingsVersion=0,restoreBirthdayFocus=null;
 const cake='<svg class="cake-icon" viewBox="0 0 48 48" aria-hidden="true"><path class="cake-flame" d="M24 3c-5 6-4 9 0 9s5-3 0-9Z"/><path d="M24 13v7M12 29v-7h24v7M8 29h32v14H8zM5 43h38M13 23c0 5 5 5 5 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 5 5 5 0M9 33c0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0"/></svg>';
 const bell='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5zM10 20h4M12 3v2"/></svg>';
 function closeMenu(focus=false){if(!host)return;host.classList.remove('user-menu-open');nav.inert=true;nav.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');if(focus)trigger?.focus({preventScroll:true});}
 function openMenu(focus=false){if(!identity||!trigger)return;host.classList.add('user-menu-open');nav.inert=false;nav.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');if(focus)nav.querySelector('a:not([hidden]),button:not([hidden])')?.focus();}
 function closeBirthday(){birthdayVersion++;birthdayKey=null;if(birthday?.open)birthday.close();birthday?.querySelector('.birthday-content').replaceChildren();restoreBirthdayFocus?.focus({preventScroll:true});restoreBirthdayFocus=null;}
 function clearPrivate(){closeBirthday();settingsVersion++;if(settings?.open)settings.close();settings?.querySelector('form').reset();}
 function init(){
  nav=document.querySelector('.portal-navigation');nav.id='user-navigation';nav.classList.add('profile-navigation');nav.inert=true;nav.setAttribute('aria-hidden','true');
  host=document.createElement('div');host.className='user-chrome';document.querySelector('.masthead').append(host);host.append(accountControls,nav);
  const preferenceButton=document.createElement('button');preferenceButton.type='button';preferenceButton.className='notification-settings';preferenceButton.innerHTML=bell+'Upozornění';preferenceButton.onclick=openSettings;nav.append(preferenceButton);
  nav.addEventListener('click',event=>{if(event.target.closest('a,button'))closeMenu(true);});
  host.addEventListener('keydown',event=>{if(event.key==='Escape'&&host.classList.contains('user-menu-open')){event.preventDefault();event.stopPropagation();closeMenu(true);}else if(event.target===trigger&&event.key==='ArrowDown'){event.preventDefault();openMenu(true);}});
  document.addEventListener('pointerdown',event=>{if(!host.contains(event.target))closeMenu();});
  host.addEventListener('focusout',event=>{
   // During native mouse focus changes activeElement is briefly the body.
   // Keep the menu interactive until its destination receives focus/click.
   if(event.relatedTarget){if(!host.contains(event.relatedTarget))closeMenu();}
   else setTimeout(()=>{if(!host.contains(document.activeElement))closeMenu();},0);
  });
  window.addEventListener('hashchange',()=>{closeMenu();closeBirthday();refresh();});
  birthday=document.createElement('dialog');birthday.className='birthday-dialog';birthday.setAttribute('aria-labelledby','birthday-title');birthday.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít narozeniny">×</button><div class="birthday-content"></div>';document.body.append(birthday);birthday.querySelector('button').onclick=closeBirthday;
  birthday.addEventListener('cancel',event=>{event.preventDefault();closeBirthday();});birthday.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeBirthday();}});
  settings=document.createElement('dialog');settings.className='notification-dialog';settings.setAttribute('aria-labelledby','notification-title');settings.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít nastavení">×</button><span class="notification-emblem">'+bell+'</span><span class="eyebrow">SOUKROMÉ ZPRÁVY OD UBD</span><h2 id="notification-title">Když kronika zavolá.</h2><p>Vyber, na co tě má bot upozornit soukromou zprávou na Discordu. Obsah zpráv a lore zůstává na webu.</p><form><fieldset><label><input type="checkbox" name="telegrams">Nové telegramy</label><label><input type="checkbox" name="decisions">Rozhodnutí o úpravách mé postavy</label><label class="review-preference"><input type="checkbox" name="reviews">Nové návrhy ke schválení</label><button class="web-button primary">Uložit nastavení</button></fieldset></form><p class="notification-status" role="status" aria-live="polite"></p>';document.body.append(settings);settings.querySelector('.dialog-close').onclick=()=>{settingsVersion++;settings.close();};
  settings.addEventListener('cancel',()=>settingsVersion++);settings.querySelector('form').onsubmit=saveSettings;
  for(const dialog of [settings,birthday])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){if(dialog===birthday)closeBirthday();else{settingsVersion++;settings.close();}}});
 }
 function account(){
  closeMenu();nav.querySelector('.menu-logout')?.remove();clearPrivate();
  for(const selector of ['.portal-home','.cast-toggle','.notification-settings'])nav.querySelector(selector).hidden=!!identity?.restricted;
  if(!identity){trigger=null;return;}
  const avatar=accountControls.querySelector('img'),name=accountControls.querySelector('span'),logout=accountControls.querySelector('button');
  trigger=document.createElement('button');trigger.type='button';trigger.className='user-trigger';trigger.setAttribute('aria-controls',nav.id);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','Otevřít nabídku účtu '+identity.user.name);
  const portrait=document.createElement('span');portrait.className='user-trigger-portrait';portrait.append(avatar);trigger.append(portrait,name);const arrow=document.createElement('span');arrow.className='user-chevron';arrow.setAttribute('aria-hidden','true');arrow.textContent='⌄';trigger.append(arrow);
  const counters=document.createElement('span');counters.className='user-counters';counters.innerHTML='<span class="user-unread" hidden></span><span class="user-pending" hidden></span>';trigger.append(counters);accountControls.replaceChildren(trigger);
  logout.classList.add('menu-logout');nav.append(logout);trigger.onclick=()=>host.classList.contains('user-menu-open')?closeMenu():openMenu();refresh();
 }
 function refresh(){
  if(birthdayKey&&(!identity||!identity.access.includes(birthdayKey)))closeBirthday();
  if(!identity){closeMenu();return;}
  if(!trigger)return;
  for(const [selector,count,label]of [['.user-unread',identity.unread||0,'nepřečtených telegramů'],['.user-pending',identity.pending||0,'změn ke schválení']]){const counter=trigger.querySelector(selector);counter.hidden=!count;counter.textContent=String(count);counter.setAttribute('aria-label',count+' '+label);}
  for(const link of nav.querySelectorAll('a')){const hash=link.hash,active=hash===''||hash==='#'?!location.hash||location.hash==='#':location.hash.startsWith(hash);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 }
 function birthdayButton(key,large=false){const b=document.createElement('button');b.type='button';b.className='birthday-open'+(large?' birthday-large':'');b.dataset.birthday=key;b.setAttribute('aria-label','Narozeniny: '+catalog[key].name);b.setAttribute('aria-haspopup','dialog');b.innerHTML=cake+(large?'<span>Narozeniny</span>':'');b.onclick=()=>openBirthday(key,b);return b;}
 function decorateBirthdays(){
  const own=identity?.owned[0],book=portal.querySelector('.journal-open');
  if(own&&book&&!book.closest('.personal-keepsakes')){const group=document.createElement('div');group.className='personal-keepsakes';book.replaceWith(group);group.append(book,birthdayButton(own,true));}
  for(const member of rail.querySelectorAll('[data-character]')){const key=member.dataset.character,diary=member.querySelector('.rail-journal');if(diary&&!diary.closest('.cast-diary-row')){const row=document.createElement('div');row.className='cast-diary-row';diary.replaceWith(row);row.append(diary,birthdayButton(key));}}
  const link=profile.querySelector('.profile-journal-link');if(link&&activePerson&&!link.parentElement.querySelector('.birthday-open'))link.after(birthdayButton(activePerson));
 }
 async function openBirthday(key,origin){
  if(!identity?.access.includes(key)){PortalPolish.closeCast();deny(key);return;}
  const version=++birthdayVersion,user=identity.user.id;birthdayKey=key;restoreBirthdayFocus=origin;birthday.style.setProperty('--aura',catalog[key].color);
  const content=birthday.querySelector('.birthday-content');content.innerHTML='<span class="birthday-emblem">'+cake+'</span><h2 id="birthday-title">List z rodné kroniky</h2><p role="status">Otevírám záznam…</p>';birthday.showModal();
  try{const result=await api('/archive/birthday/'+key);if(version!==birthdayVersion||identity?.user.id!==user||document.hidden)return;
   content.innerHTML='<img class="birthday-medallion" width="130" height="130" alt="" src="'+mediaURL('icon-'+key+'.png',320)+'"><span class="eyebrow">ZAPSÁNO V KRONICE · NAROZENÍ</span><h2 id="birthday-title"></h2><span class="birthday-emblem">'+cake+'</span><time class="birthday-date"></time><p class="birthday-place"></p><span class="birthday-ornament" aria-hidden="true">— ✦ —</span><blockquote></blockquote><p class="birthday-footnote">Ze schváleného osobního spisu</p>';
   content.querySelector('h2').textContent=result.name;content.querySelector('time').textContent=result.birth||'V kronice zatím neuvedeno';content.querySelector('.birthday-place').textContent=result.birthplace||'Místo narození zatím neuvedeno';content.querySelector('blockquote').textContent=result.motto;
  }catch(error){if(version!==birthdayVersion)return;closeBirthday();if([401,403].includes(error.status)){PortalPolish.closeCast();deny(key);}else setNotice(error.message);}
 }
 async function openSettings(){
  if(!identity)return;const version=++settingsVersion,user=identity.user.id,form=settings.querySelector('form');settings.querySelector('.notification-status').textContent='Načítám nastavení…';form.querySelector('fieldset').disabled=true;settings.querySelector('.review-preference').hidden=!identity.admin?.permissions.includes('review');settings.showModal();
  try{const data=await api('/notifications/settings');if(version!==settingsVersion||user!==identity?.user.id)return;for(const key of ['telegrams','decisions','reviews'])form.elements[key].checked=data[key];form.querySelector('fieldset').disabled=false;settings.querySelector('.notification-status').textContent=data.lastDelivery?.reason==='dm_unavailable'?'Poslední zprávu Discord nepovolil doručit. Pokud upozornění chceš dostávat, povol soukromé zprávy od členů serveru. Na webu máš zprávy dostupné dál.':'';}
  catch(error){if(version===settingsVersion)settings.querySelector('.notification-status').textContent=error.message;}
 }
 async function saveSettings(event){event.preventDefault();const version=settingsVersion,user=identity?.user.id,form=event.target;form.querySelector('fieldset').disabled=true;
  try{await api('/notifications/settings',{method:'PUT',body:JSON.stringify(Object.fromEntries(['telegrams','decisions','reviews'].map(key=>[key,form.elements[key].checked])))});if(version===settingsVersion&&user===identity?.user.id)settings.querySelector('.notification-status').textContent='Nastavení upozornění je uložené.';}
  catch(error){if(version===settingsVersion)settings.querySelector('.notification-status').textContent=error.message;}
  finally{if(version===settingsVersion)form.querySelector('fieldset').disabled=false;}
 }
 return {init,account,refresh,clearPrivate,closeMenu,decorateBirthdays};
})();

const RestrictedAccess=(()=>{
 let page;
 function show(){
  Gramophone.dispose();SeasonAtmosphere.syncSession();
  PortalPolish.closeCast();PortalPolish.cancelConfirmation();PortalPolish.loading('',false);purgeProfile();Journal.purge();Community.purge();UserChrome.clearPrivate();resetTrust();if(denial.open)denial.close();
  selection.hidden=true;portal.hidden=true;welcome.hidden=true;rail.hidden=true;rail.replaceChildren();portal.replaceChildren();setNotice('');
  if(!page){page=document.createElement('main');page.id='restricted-page';page.setAttribute('aria-labelledby','restricted-title');page.innerHTML='<section class="restricted-card"><div class="restricted-orbit" aria-hidden="true"><span></span><svg viewBox="0 0 100 100"><path d="M50 10 80 23v24c0 23-30 39-30 39S20 70 20 47V23Z"/><rect x="35" y="42" width="30" height="25" rx="4"/><path d="M40 42v-7a10 10 0 0 1 20 0v7M50 52v6"/></svg></div><span class="eyebrow">ÚSTAV BEZ DOZORU · SPRÁVA KRONIKY</span><h1 id="restricted-title">Tato kapitola je<br>pro tebe uzavřená.</h1><div class="restricted-divider" aria-hidden="true">✦</div><p class="restricted-message">Byl ti odebrán přístup k webovým funkcím. Pro jeho obnovení kontaktuj vedení Ústavu.</p><p class="restricted-account"></p><div class="restricted-actions"><a class="web-button primary" href="https://discord.com/channels/1561680787676467230" target="_blank" rel="noopener noreferrer">Kontaktovat vedení ↗</a><button type="button" class="web-button restricted-recheck">Zkontrolovat přístup</button></div><p class="restricted-status" role="status" aria-live="polite"></p><footer>NEW HORIZON · SOUKROMÁ KRONIKA</footer></section>';document.body.append(page);
   page.querySelector('button').onclick=async event=>{const b=event.currentTarget;b.disabled=true;await refreshSession(true);if(identity?.restricted)page.querySelector('.restricted-status').textContent='Přístup je stále omezený. Kontaktuj vedení Ústavu.';b.disabled=false;};
  }
  page.hidden=false;page.querySelector('.restricted-account').textContent='Přihlášen jako '+identity.user.name;document.title='Přístup k webu byl odebrán · New Horizon';
 }
 function hide(){if(page){page.hidden=true;page.querySelector('.restricted-status').textContent='';page.querySelector('.restricted-account').textContent='';}}
 return {show,hide};
})();

// Browser receives private profile data only after server authorization.
const catalog = window.PUBLIC_PEOPLE;
let identity = null, csrf = '', ready = false, routeVersion = 0, refreshVersion = 0, loggingOut = false, accountFingerprint='',directoryFingerprint='';
const apiRoot = '/api/ubd';
const deniedText = 'Děláš si prdel? Takto se informace nezískávají. Nejsi hoden znát toto info, takže si naser :D';
const denialLines = [deniedText,
 'Zvědavost ti nechybí. Povolení ale jo. Takže zase hezky zpátky, kovboji.',
 'Tady nejsi ve vlastním deníčku. Nejdřív si vyžádej důvěru, pak strkej nos do cizích příběhů.',
 'Ani páčidlo, ani hezkej úsměv. Bez svolení majitele se dovnitř nedostaneš.',
 'Tenhle spis není veřejnej saloon. Dneska tě dovnitř nepustíme.',
 'Hezkej pokus, šerife. Ale odznak na cizí tajemství nestačí.',
 'Klika cvakla, dveře drží. Někdo ti očividně ještě nevěří.',
 'Cizí minulost není samoobsluha. Zkus nejdřív poprosit majitele.',
 'Čumět můžeš. Číst nemůžeš. Tak si ten rozdíl laskavě zapamatuj.',
 'Tady máš prd co slídit. Nejdřív povolení, potom tajemství.',
 'No jasně, rovnou do cizího spisu. A klíče od baráku bys taky nechtěl?',
 'Zamčeno. To znamená zamčeno. Ne „zkusím do toho ještě pětkrát kopnout“.',
 'Tenhle příběh má majitele. A ten tě zatím neposlal dál než do prdele.',
 'Drzej jsi dost. Důvěryhodnej zatím míň. Vrať se s povolením.',
 'Kdyby se důvěra získávala klikáním, byl bys dávno šerif. Smůla.',
 'Pracky pryč od cizích tajemství. Tohle není výprodej drbů.',
 'Vypadá to jako kniha. Ale pro tebe je to zatím jen drahá dekorace.',
 'Tudy cesta nevede, do prdele. Zkus tu přes souhlas majitele.',
 'Přišel, kliknul, dostal hovno. Bez povolení to dneska líp nedopadne.',
 'Dveře jsou zavřený. Tvoje sebevědomí bohužel není univerzální klíč.',
 'Tvoje zvědavost právě narazila čumákem do zamčených dveří.',
 'Tady se špinavý prádlo cizím lidem neukazuje. Najdi si vlastní skandál.',
 'Pěknej medailon, co? Tak si ho prohlídni. Dál tě nikdo nezval.',
 'Tohle není hospodskej drb za jedno pivo. Nejdřív si zasluž důvěru.',
 'Kovboji, otoč koně. Na tuhle cestu nemáš povolení.',
 'Můžeš klikat až do Vánoc. Zámek má tvoje nadšení úplně na háku.',
 'Cizí životopis ti nepatří. Dej tomu majiteli aspoň šanci říct ne.',
 'Tak určitě. Ještě ti k tomu uvaříme kafe a přečteme to nahlas. Nejdřív povolení.'
];
let denialBag=[],lastDenial='';
function nextDenial(){
 if(!denialBag.length){denialBag=[...denialLines];for(let i=denialBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[denialBag[i],denialBag[j]]=[denialBag[j],denialBag[i]];}if(denialBag.at(-1)===lastDenial)[denialBag[0],denialBag[denialBag.length-1]]=[denialBag.at(-1),denialBag[0]];}
 return lastDenial=denialBag.pop();
}
const api = async (path, options = {}) => {
 const response = await fetch(apiRoot + path, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(7000),
  ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.method && options.method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}), ...options.headers } });
 let data;try{data=await response.json();}catch{throw Object.assign(Error('Archiv je dočasně nedostupný.'),{status:503});}
 if(!response.ok){if(data.restricted&&identity){identity={authenticated:true,restricted:true,user:identity.user,csrf,owned:[],access:[],journalAccess:[],directory:{},admin:{owner:false,permissions:[]},unread:0,pending:0};routeVersion++;renderAccount();}throw Object.assign(Error(data.error || 'Archiv není dostupný.'),{status:response.status,restricted:!!data.restricted});}
 return data;
};
const escape = escapeHTML;
const motionAllowed = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
const loginHref = apiRoot + '/auth/login';
const accountControls = document.createElement('div'); accountControls.className='account-controls';
document.querySelector('.masthead').append(accountControls);
document.querySelector('.edition').hidden=true;
const welcome=document.createElement('section');welcome.className='account-welcome';welcome.hidden=true;
welcome.innerHTML='<div><span class="eyebrow">TVŮJ SOUKROMÝ ARCHIV</span><h2></h2><p></p></div><button type="button" class="trust-open">Komu důvěřuji <span>↗</span></button>';
selection.before(welcome);
const rail=document.createElement('nav');rail.className='private-cast';rail.hidden=true;rail.setAttribute('aria-label','Ostatní postavy');welcome.after(rail);
const portal=document.createElement('main');portal.id='portal';portal.hidden=true;selection.before(portal);
const notice=document.createElement('p');notice.className='archive-notice';notice.setAttribute('role','status');notice.hidden=true;welcome.before(notice);
const denial=document.createElement('dialog');denial.className='archive-denial';denial.setAttribute('aria-labelledby','denial-title');
denial.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít">×</button><img width="180" height="180" alt=""><p class="eyebrow">SOUKROMÝ ARCHIV</p><h2 id="denial-title"></h2><p class="denial-motto"></p><p class="denial-copy"></p><a class="discord-login" href="'+loginHref+'">Přihlásit přes Discord</a><a class="denial-journal" hidden></a><p class="denial-hint"></p><button class="denial-back" type="button">Zpět k postavám</button>';
document.body.append(denial);
function purgeProfile(){
 profile.hidden=true;profile.innerHTML=profileTemplate;activePerson=null;
 for(const key of Object.keys(people))delete people[key];
 window.VisualReading?.syncVisibility(null);
}
function currentKey(){const hash=location.hash;return Object.keys(catalog).find(key=>hash==='#'+key||hash.startsWith('#'+key+'-'))||((hash==='#pribeh'||/^#kapitola-\d+$/.test(hash))?'nathaniel':null);}
function setNotice(text){notice.textContent=text;notice.hidden=!text;}
function deny(key,message=deniedText,scope='lore'){
 if(identity?.restricted){RestrictedAccess.show();return;}
 purgeProfile();Journal.purge();PortalPolish.loading(key,false);selection.hidden=!!identity;portal.hidden=!identity;
 const person=catalog[key];denial.style.setProperty('--aura',person.color);
 mediaImage(denial.querySelector('img'),'icon-'+key+'.png','180px',320);
 denial.querySelector('h2').textContent=person.name;denial.querySelector('.denial-motto').textContent=person.motto;
 denial.querySelector('.denial-copy').textContent=message===deniedText?nextDenial():message;
 denial.querySelector('.discord-login').hidden=!!identity;
 denial.querySelector('.denial-hint').textContent=identity?'O nahlédnutí '+(scope==='journal'?'do deníku ':'')+'požádej přímo hráče této postavy. Povolení může udělit ve svém archivu.':'Přihlas se a vstup do svého příběhu. Cizí archiv otevře jen jeho majitel.';
 const diaryLink=denial.querySelector('.denial-journal');diaryLink.hidden=scope==='journal'||!identity?.journalAccess?.includes(key);diaryLink.href='#journal-'+key;diaryLink.textContent='Máš přístup k deníku této postavy ↗';
 if(!denial.open)denial.showModal();document.title='Soukromý archiv · New Horizon RP';
}
function closeDenial(){denial.close();location.hash='';}
denial.querySelector('.dialog-close').onclick=closeDenial;denial.querySelector('.denial-back').onclick=closeDenial;
denial.addEventListener('cancel',event=>{event.preventDefault();closeDenial();});
function renderAccount(){
 Gramophone.syncSession();SeasonAtmosphere.syncSession();
 Community.sync();
 UserChrome.refresh();
 const fingerprint=identity?JSON.stringify([identity.user,identity.restricted,identity.owned,identity.access,identity.journalAccess,identity.directory,new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague'}).format(new Date())]):'guest';
 if(fingerprint===accountFingerprint)return;accountFingerprint=fingerprint;
 document.body.classList.toggle('signed-in',!!identity);welcome.hidden=!identity;rail.hidden=!identity;
 document.body.classList.toggle('restricted-user',!!identity?.restricted);if(!identity?.restricted)RestrictedAccess.hide();
 accountControls.replaceChildren();
 if(!identity){Community.purge();PortalPolish.closeCast();rail.replaceChildren();portal.replaceChildren();const login=document.createElement('a');login.href=loginHref;login.className='discord-login';login.textContent='Přihlásit přes Discord';accountControls.append(login);UserChrome.account();return;}
 const photo=new Image(34,34);photo.src=identity.user.avatar;photo.alt='';accountControls.append(photo);
 const name=document.createElement('span');name.textContent=identity.user.name;accountControls.append(name);
 const logout=document.createElement('button');logout.type='button';logout.textContent='Odhlásit';logout.onclick=async()=>{
  if(!await Community.beforeLogout())return;
  logout.disabled=true;loggingOut=true;refreshVersion++;try{await api('/auth/logout',{method:'POST'});identity=null;csrf='';purgeProfile();Journal.purge();resetTrust();renderAccount();location.hash='';await route();}catch(error){setNotice(error.message);logout.disabled=false;}finally{loggingOut=false;}
 };accountControls.append(logout);
 if(identity.restricted){UserChrome.account();RestrictedAccess.show();return;}
 const day=new Intl.DateTimeFormat('cs-CZ',{weekday:'long',timeZone:'Europe/Prague'}).format(new Date());
 const greeting={pondělí:'Krásné pondělí',úterý:'Krásné úterý',středa:'Krásnou středu',čtvrtek:'Krásný čtvrtek',pátek:'Krásný pátek',sobota:'Krásnou sobotu',neděle:'Krásnou neděli'};
 welcome.querySelector('h2').textContent=(greeting[day]||'Krásný den')+', '+identity.user.name+'.';
 const own=identity.owned[0],person=catalog[own];
 document.body.style.setProperty('--account-aura',person?.color||'#c88e4a');
 welcome.querySelector('p').textContent=person?'Tvůj příběh čeká, '+person.nickname+'.':'Vítej mezi příběhy, do kterých ti jejich hráči dovolí nahlédnout.';
 welcome.querySelector('.trust-open').hidden=!own;
 rail.innerHTML='<header class="cast-heading"><div><span class="eyebrow">SEDM OSUDŮ. JEDEN HORIZONT.</span><h2>Příběhy kolem tebe<span aria-hidden="true">✦</span></h2><p>Známé tváře. Vlastní tajemství. Každý příběh otevírá důvěra.</p></div><span class="cast-count">'+String(Object.keys(catalog).length-(own?1:0)).padStart(2,'0')+'<small>DALŠÍCH PŘÍBĚHŮ</small></span></header><div class="cast-grid">'+Object.entries(catalog).filter(([key])=>key!==own).map(([key,p])=>'<a href="#'+key+'" class="private-medallion" style="--aura:'+p.color+'"><img src="'+mediaURL('icon-'+key+'.png',320)+'" alt="" width="180" height="180" loading="lazy" decoding="async"><span>'+escape(p.nickname)+'</span></a>').join('')+'</div><p class="cast-footnote">Příběh a deník mají vlastní povolení. O přístup můžeš požádat přímo hráče.</p>';
 portal.innerHTML='<section class="personal-scene" style="--aura:'+(person?.color||'#c88e4a')+'">'+(person?'<img class="personal-portrait" src="'+mediaURL(person.image,960)+'" sizes="(max-width:700px) 90vw, 52vw" srcset="'+mediaSrcset(person.image)+'" alt="'+escape(person.name)+'" width="1024" height="1536">':'<img class="personal-emblem" src="'+mediaURL('NH.png',320)+'" alt="New Horizon RP">')+'<div class="personal-copy"><span class="eyebrow">'+(person?'PŘÍBĚH, O KTERÉM ROZHODUJEŠ TY':'KAŽDÁ DŮVĚRA MÁ SVŮJ PŘÍBĚH')+'</span><h1>'+(person?escape(person.given)+'<strong>'+escape(person.surname)+'</strong>':'Vítej v archivu')+'</h1>'+(person?'<p class="personal-signature">'+escape(person.nickname)+'</p><p>'+escape(person.motto)+'</p><a class="story-button" href="#'+own+'">Otevřít můj příběh <span>↗</span></a>':'<p>Po straně najdeš všechny postavy. Jejich příběhy si přečteš, pokud ti je hráči zpřístupní.</p>')+'<p class="personal-privacy">'+(person?'Tvůj archiv je soukromý. Ostatní do něj vstoupí pouze s tvým svolením.':'Přihlášení samo o sobě cizí příběhy neodemyká.')+'</p></div></section>';
 PortalPolish.account(person,own);PortalPolish.active(Journal.key||activePerson,Journal.key?'journal':'lore');
 UserChrome.account();UserChrome.decorateBirthdays();
}
async function refreshSession(initial=false){
 if(loggingOut)return;const version=++refreshVersion;
 try{
  const data=await api('/auth/session');if(version!==refreshVersion)return;const next=data.authenticated?data:null,changed=identity?.user.id!==next?.user.id||!!identity?.restricted!==!!next?.restricted;
  if(changed){purgeProfile();Journal.purge();Community.purge();resetTrust();}
  const freshDirectory=JSON.stringify(data.directory||{}),directoryChanged=directoryFingerprint!==freshDirectory;directoryFingerprint=freshDirectory;
  for(const [key,patch]of Object.entries(data.directory||{}))if(catalog[key])Object.assign(catalog[key],patch);
  if(directoryChanged&&activePerson)purgeProfile();
  identity=next;csrf=data.csrf||'';ready=true;renderAccount();
  if(identity?.restricted){RestrictedAccess.show();return;}
  if(!identity||activePerson&&!identity.access.includes(activePerson)||Journal.key&&!identity.journalAccess?.includes(Journal.key)){purgeProfile();Journal.purge();await route();}
  else if(initial||changed||Community.matches&&!Community.active||Community.active==='manage'&&!Community.allowed()||directoryChanged&&currentKey()||currentKey()&&activePerson!==currentKey()&&identity.access.includes(currentKey())||Journal.route&&!Journal.key)await route();
 }catch(error){if(version!==refreshVersion)return;ready=true;Gramophone.dispose();purgeProfile();Journal.purge({preserveDraft:true});Community.purge({preserveDraft:true});UserChrome.clearPrivate();if(initial){identity=null;renderAccount();selection.hidden=false;}setNotice(error.message);}
}
async function route(){
 const version=++routeVersion,journalMatch=Journal.route,key=journalMatch?.[1]||currentKey(),previous=activePerson;
 if(!ready)return;
 if(identity?.restricted){RestrictedAccess.show();return;}
 if(!await Community.beforeRoute())return;
 if(denial.open)denial.close();
 if(Community.matches){purgeProfile();Journal.purge();PortalPolish.closeCast();selection.hidden=true;portal.hidden=true;await Community.open();return;}
 Community.purge();
 if(!key){purgeProfile();Journal.purge();PortalPolish.loading('',false);PortalPolish.active(null);selection.hidden=!!identity;portal.hidden=!identity;document.title='New Horizon RP · Sedm osudů, jeden horizont';window.scrollTo({top:0,behavior:'instant'});return;}
 if(!Object.hasOwn(catalog,key)){location.hash='';return;}
 if(!identity){deny(key);return;}
 if(journalMatch){if(!identity.journalAccess?.includes(key)){deny(key,deniedText,'journal');return;}purgeProfile();selection.hidden=true;portal.hidden=true;await Journal.open(key,journalMatch[2]);return;}
 Journal.purge();PortalPolish.active(key);
 if(!identity.access.includes(key)){deny(key);return;}
 if(activePerson!==key){
  purgeProfile();setNotice('');PortalPolish.loading(key);
  try{
   const data=await api('/archive/lore/'+key);if(version!==routeVersion||document.hidden)return;
   people[key]=data.person;renderProfile(key);setNotice('');
  }catch(error){if(version!==routeVersion)return;if([401,403].includes(error.status))deny(key);else{setNotice(error.message);portal.hidden=false;}return;}
  finally{if(version===routeVersion)PortalPolish.loading(key,false);}
 }
 selection.hidden=true;portal.hidden=true;profile.hidden=false;window.VisualReading?.syncVisibility(key);document.title=catalog[key].name+' · New Horizon RP';
 if(previous!==key&&motionAllowed())profile.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
 if(previous!==key)PortalPolish.revealProfile(key);
 requestAnimationFrame(()=>{if(location.hash==='#'+key)window.scrollTo({top:0,behavior:'instant'});else document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});});
}
const trust=document.createElement('dialog');trust.className='trust-dialog';trust.setAttribute('aria-labelledby','trust-title');
trust.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít">×</button><div class="trust-identity"><img width="76" height="76" alt=""><div><span class="eyebrow">TVŮJ PŘÍBĚH. TVÁ DŮVĚRA.</span><h2 id="trust-title">Komu důvěřuji</h2><span class="trust-owner-name"></span></div></div><p>Vyber, komu otevřeš svůj příběh nebo deník. Každé povolení platí jen pro čtení a můžeš ho kdykoliv odebrat.</p><form class="trust-form"><label>Vyber hráče<select name="known"><option value="">Jiný člen Discordu — zadat ID</option></select></label><label>Discord ID<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" maxlength="20" required placeholder="ID hráče z vašeho serveru"></label><button type="submit">Najít hráče</button></form><div class="trust-candidate" hidden></div><p class="trust-status" role="status" aria-live="polite"></p><div class="trust-list"></div>';
document.body.append(trust);trust.querySelector('.dialog-close').onclick=()=>trust.close();
let trustKey=null,trustGeneration=0;
function resetTrust(){trustGeneration++;trust.close();trust.querySelector('.trust-list').replaceChildren();trust.querySelector('.trust-candidate').replaceChildren();trust.querySelector('form').reset();}
function trustStatus(text){trust.querySelector('.trust-status').textContent=text;}
async function loadGrants(){
 const journalKey=trustKey,generation=trustGeneration;
 const [lore,diary]=await Promise.all([api('/archive/grants/'+journalKey),api('/journal/grants/'+journalKey)]);if(generation!==trustGeneration||journalKey!==trustKey)return;
 const combined=new Map();for(const[scope,data]of[['archive',lore],['journal',diary]])for(const grant of data.grants){const person=combined.get(grant.grantee_id)||{...grant,archive:false,journal:false};person[scope]=true;combined.set(grant.grantee_id,person);}
 const list=trust.querySelector('.trust-list');list.replaceChildren();if(!combined.size){const empty=document.createElement('p');empty.className='trust-empty';empty.textContent='Důvěra začíná u tebe. Zatím nemá přístup nikdo další.';list.append(empty);}
 for(const grant of combined.values()){
  const row=document.createElement('article');row.className='trust-person';const heading=document.createElement('div');heading.className='trust-person-heading';const img=new Image(44,44);img.src=grant.avatar;img.alt='';
  const label=document.createElement('span');label.textContent=grant.display_name;const button=document.createElement('button');button.type='button';button.className='trust-remove';button.textContent='Odebrat přístup';
  button.onclick=async()=>{if(!await PortalPolish.confirm('Ukončit sdílení?',grant.display_name+' už nebude moct číst tvé lore ani deník.','Odebrat přístup'))return;button.disabled=true;try{await Promise.all(['archive','journal'].map(scope=>api('/'+scope+'/grants/'+journalKey+'/'+grant.grantee_id,{method:'DELETE'})));trustStatus('Přístup byl odebrán.');await loadGrants();}catch(error){trustStatus(error.message);await loadGrants().catch(()=>{});button.disabled=false;}};
  heading.append(img,label,button);const permissions=document.createElement('div');permissions.className='trust-permissions';
  for(const[scope,text]of[['archive','Čtení lore'],['journal','Čtení deníku']]){
   const wrapper=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=grant[scope];checkbox.dataset.scope=scope;
   checkbox.onchange=async()=>{const enabled=checkbox.checked;if(!enabled&&!await PortalPolish.confirm('Odebrat '+text.toLowerCase()+'?',grant.display_name+' ztratí toto oprávnění. Druhé povolení zůstane podle tvého nastavení.','Odebrat povolení')){checkbox.checked=true;return;}checkbox.disabled=true;try{await api('/'+scope+'/grants/'+journalKey+(enabled?'':'/'+grant.grantee_id),{method:enabled?'POST':'DELETE',...(enabled?{body:JSON.stringify({userId:grant.grantee_id})}:{})});trustStatus(enabled?'Povolení bylo přidáno.':'Povolení bylo odebráno.');await loadGrants();}catch(error){checkbox.checked=!enabled;checkbox.disabled=false;trustStatus(error.message);}};
   wrapper.append(checkbox,document.createTextNode(text));permissions.append(wrapper);
  }
  row.append(heading,permissions);list.append(row);
 }
}
welcome.querySelector('.trust-open').onclick=async()=>{
 trustKey=identity?.owned[0];if(!trustKey)return;trustGeneration++;trustStatus('Načítám přístupy…');trust.querySelector('.trust-candidate').hidden=true;
 mediaImage(trust.querySelector('.trust-identity img'),'icon-'+trustKey+'.png','76px',160);trust.querySelector('.trust-owner-name').textContent='Přístupy k postavě '+catalog[trustKey].name;
 trust.showModal();try{
  const data=await api('/archive/candidates');const select=trust.querySelector('select');select.replaceChildren(new Option('Jiný člen Discordu — zadat ID',''));
  for(const user of data.users)select.append(new Option(user.name,user.id));
  await loadGrants();trustStatus('');
 }catch(error){trustStatus(error.message);}
};
trust.querySelector('select').onchange=event=>{trust.querySelector('input').value=event.target.value;trustGeneration++;trust.querySelector('.trust-candidate').hidden=true;};
trust.querySelector('input').oninput=()=>{trustGeneration++;trust.querySelector('.trust-candidate').hidden=true;};
trust.querySelector('form').onsubmit=async event=>{
 event.preventDefault();const generation=++trustGeneration,id=trust.querySelector('input').value;trustStatus('Hledám hráče na Discordu…');
 try{
  const data=await api('/archive/member/'+id);if(generation!==trustGeneration)return;
  const box=trust.querySelector('.trust-candidate');box.replaceChildren();const img=new Image(48,48);img.src=data.user.avatar;img.alt='';
  const name=document.createElement('span');name.textContent=data.user.name;const button=document.createElement('button');button.type='button';button.textContent='Povolit nahlížení';
  const permissions=document.createElement('div');permissions.className='trust-candidate-permissions';permissions.innerHTML='<label><input class="candidate-lore" type="checkbox" checked> Čtení lore</label><label><input class="candidate-journal" type="checkbox"> Čtení deníku</label>';
  button.onclick=async()=>{const scopes=[];if(permissions.querySelector('.candidate-lore').checked)scopes.push('archive');if(permissions.querySelector('.candidate-journal').checked)scopes.push('journal');if(!scopes.length){trustStatus('Vyber alespoň jedno povolení.');return;}button.disabled=true;const results=await Promise.allSettled(scopes.map(scope=>api('/'+scope+'/grants/'+trustKey,{method:'POST',body:JSON.stringify({userId:data.user.id})})));const failure=results.find(result=>result.status==='rejected');trustStatus(failure?'Některé povolení se nepodařilo změnit. Zkontroluj aktuální seznam níže.':'Vybrané nahlížení bylo povoleno.');if(!failure)box.hidden=true;button.disabled=false;await loadGrants().catch(error=>trustStatus(error.message));};
  const summary=document.createElement('div');summary.className='trust-candidate-summary';summary.append(img,name,button);box.append(summary,permissions);box.hidden=false;trustStatus('Je to správný člověk? Vyber, co smí číst, a potvrď povolení.');
 }catch(error){trustStatus(error.message);}
};
window.addEventListener('hashchange',route);
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&!document.querySelector('dialog[open]')&&!profile.hidden)location.hash='';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){routeVersion++;purgeProfile();Journal.purge({preserveDraft:true});Community.purge({preserveDraft:true});UserChrome.clearPrivate();UserChrome.closeMenu();PortalPolish.loading('',false);}else refreshSession(true);});
window.addEventListener('pageshow',event=>{if(event.persisted){routeVersion++;purgeProfile();Journal.purge();refreshSession(true);}});
setInterval(()=>{if(!document.hidden&&identity)refreshSession();},15000);
PortalPolish.init();Journal.init();Community.init();UserChrome.init();SeasonAtmosphere.init();renderAccount();
const loginResult=new URLSearchParams(location.search).get('login');
if(loginResult){setNotice(loginResult==='failed'?'Přihlášení se nepodařilo. Ověř, že jsi členem vašeho Discord serveru, a zkus to znovu.':'Přihlášení bylo zrušeno.');history.replaceState(null,'',location.pathname+location.hash);}
refreshSession(true);
api('/directory').then(data=>{for(const [key,patch]of Object.entries(data.people||{})){if(!catalog[key])continue;Object.assign(catalog[key],patch);const card=selection.querySelector('.cast-link[href="#'+key+'"]');if(card){card.querySelector('.medallion-name').innerHTML=escapeHTML(catalog[key].given)+'<strong>'+escapeHTML(catalog[key].surname)+'</strong>';card.querySelector('.medallion-nickname').textContent=catalog[key].nickname;card.setAttribute('aria-label','Otevřít příběh: '+catalog[key].name);}}}).catch(()=>{});
