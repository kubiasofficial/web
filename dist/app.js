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
  return '<svg class="journal-icon'+(small?' journal-icon-small':'')+'" viewBox="0 0 120 140" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" x2="1" y2="1"><stop stop-color="#63402a"/><stop offset=".45" stop-color="#291d19"/><stop offset="1" stop-color="#150f11"/></linearGradient><linearGradient id="'+id+'-metal"><stop stop-color="#755130"/><stop offset=".5" stop-color="#e6c58b"/><stop offset="1" stop-color="#937045"/></linearGradient></defs><g class="journal-pages"><path d="M20 18h82v111H20z" fill="#cbb890"/><path d="M24 23h75M24 27h75M24 121h75M24 125h75" stroke="#746447" stroke-width="1"/></g><g class="journal-cover"><path d="M19 10h82v116H19Q10 126 10 117V20q0-10 9-10Z" fill="url(#'+id+')" stroke="#a98150" stroke-width="1.5"/><path d="M24 11v114M29 19h63v97H29z" fill="none" stroke="#9b744653"/><path d="M28 17h17l-17 17Zm65 0H76l17 17Zm0 101H76l17-17Zm-65 0h17l-17-17Z" fill="url(#'+id+'-metal)"/><path d="M15 26h12M15 42h12M15 98h12M15 113h12" stroke="#b7915f" stroke-width="3"/><circle cx="61" cy="62" r="23" fill="#100d0c" stroke="currentColor" stroke-width="1.5"/><image href="assets/icon-'+key+'.png" x="38" y="39" width="46" height="46"/><path d="M43 95h35M50 100h21" stroke="#b68a52"/><path d="M98 62h10v16H98q-6-8 0-16Z" fill="#38281c" stroke="#bb965e"/><circle cx="101" cy="70" r="2" fill="#d8b87c"/></g></svg>';
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
  if(own)scene.style.setProperty('--personal-world','url("assets/'+own+'-scenes.png")');
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
 function loading(key,on=true){loader.hidden=!on;if(on){loader.style.setProperty('--aura',catalog[key]?.color||'#bd965b');loader.querySelector('img').src='assets/icon-'+key+'.png';}}
 function active(key,kind='lore'){
  closeCast();rail.querySelectorAll('.private-member').forEach(member=>member.classList.toggle('member-current',member.querySelector('[data-player-key]')?.dataset.playerKey===key));
  rail.querySelectorAll('.private-medallion,.rail-journal').forEach(link=>{const match=kind==='journal'?link.hash==='#journal-'+key:link.hash==='#'+key;link.classList.toggle('is-current',match);if(match)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 }
 function revealProfile(key){
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

const Community=(()=>{
 let page,nav,generation=0,loadedHash='',view='',editorState=null,suspended=null,mailRequest=null;
 const labels={given:'Jméno',surname:'Příjmení',nickname:'Přezdívka',age:'Věk v lore',birth:'Datum narození',occupation:'Povolání',relatives:'Rodina a blízcí',kicker:'Motto',description:'Úvodní charakteristika',quote:'Osobní citát',closing:'Závěrečná slova',origin:'Původ',familyTitle:'Nadpis vztahů',familyDescription:'Úvod ke vztahům',chapters:'Kapitoly lore',family:'Vztahy'};
 const permissionLabels={review:'Schvalování změn',activity:'Přehled přihlášení',official:'Telegramy za správu'};
 const icons={edit:'M5 19l4-1L20 7l-3-3L6 15zM14 7l3 3',mail:'M3 6h18v13H3zM3 6l9 7 9-7',admin:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',home:'M3 11l9-8 9 8M6 9v12h12V9',users:'M15 21v-3c0-5-12-5-12 0v3M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 5c5 0 5 7 0 7M18 15c3 0 3 3 3 6',clock:'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',check:'M4 12l5 5L20 6'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[name]+'"/></svg>';
 const stamp=state=>({pending:'Čeká na schválení',approved:'Schváleno',rejected:'Zamítnuto'}[state]||state);
 const date=t=>t?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(new Date(t*1000)):'Zatím nezaznamenáno';
 const routeMatch=()=>/^#(?:manage|edit|telegrams)(?:\/|$)/.test(location.hash);
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
  const admin=document.createElement('a');admin.href='#manage';admin.className='nav-manage';admin.innerHTML=icon('admin')+'Pro správu webu <span class="web-badge review-badge" hidden></span>';nav.append(admin);
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
 }
 function sync(){
  if(!nav)return;
  nav.querySelector('.nav-edit').hidden=!identity?.owned.length;
  nav.querySelector('.nav-manage').hidden=!identity?.admin?.owner&&!identity?.admin?.permissions.length;
  for(const [selector,count]of [['.nav-mail',identity?.unread||0],['.nav-manage',identity?.pending||0]]){const badge=nav.querySelector(selector+' .web-badge');badge.hidden=!count;badge.textContent=String(count);}
 }
 function values(){
  const form=page.querySelector('.character-form');if(!form||!editorState)return null;
  const data={};for(const key of Object.keys(labels))if(!['chapters','family'].includes(key))data[key]=form.elements[key].value;
  data.chapters=[...form.querySelectorAll('.edit-chapter')].map(row=>({title:row.querySelector('[data-title]').value,text:row.querySelector('textarea').value}));
  data.family=[...form.querySelectorAll('.edit-relation')].map(row=>Object.fromEntries(['label','name','text','status'].map(key=>[key,row.querySelector('[data-relation='+key+']').value])));
  return data;
 }
 function dirty(){return view==='edit'&&editorState&&JSON.stringify(values())!==editorState.baseline;}
 async function beforeRoute(){
  if(loadedHash!==location.hash&&dirty()&&!await PortalPolish.confirm('Opustit rozepsanou postavu?','Neuložené změny se zahodí. Koncept uložený na serveru zůstane zachovaný.','Opustit editor')){history.replaceState(null,'',loadedHash);return false;}return true;
 }
 function purge({preserveDraft=false}={}){
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
  purge({preserveDraft:!!suspended});const version=++generation,user=identity?.user.id;loadedHash=location.hash;
  if(!identity){shell('Vstup do svého archivu','Pro správu postavy a telegramy se přihlas přes Discord.');content().innerHTML='<a class="web-button" href="'+loginHref+'">Přihlásit přes Discord</a>';return;}
  try{
   if(loadedHash.startsWith('#edit')){view='edit';shell('Tvůj příběh. Tvými slovy.','Uprav svou postavu. Zveřejní se až po schválení správou.','editor');menu([['#','Můj archiv','home'],['#edit','Upravit postavu','edit'],['#telegrams','Telegramy','mail']]);await editor(version,user);}
   else if(loadedHash.startsWith('#manage')){view='manage';shell('Správa kroniky','Pracovna pro lidi, kteří drží příběhy pohromadě.','manage');await manage(version,user);}
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
  preview.innerHTML='<img src="assets/icon-'+editorState.key+'.png" alt="" width="90" height="90"><h2>'+text(data.given)+'<strong>'+text(data.surname)+'</strong></h2><p class="preview-nickname">'+text(data.nickname)+'</p><p>'+text(data.age)+' · '+text(data.occupation)+'</p><blockquote>'+text(data.kicker)+'</blockquote><p>'+text(data.description).replace(/\n/g,'<br>')+'</p>'+data.chapters.map(c=>'<h3>'+text(c.title)+'</h3>'+blocks(c.text||' ')).join('');
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
  const items=[['#manage','Přehled','admin']];if(permissions.includes('review'))items.push(['#manage/requests','Změny','edit']);if(permissions.includes('activity'))items.push(['#manage/users','Uživatelé a přihlášení','users']);if(own)items.push(['#manage/admins','Správci a oprávnění','admin']);if(permissions.includes('official'))items.push(['#manage/mail','Telegramy správy','mail']);if(permissions.includes('review'))items.push(['#manage/audit','Historie rozhodnutí','clock']);menu(items);
  const changes=page.querySelector('.community-menu a[href="#manage/requests"]');if(changes&&overview.pending){changes.classList.add('has-pending');changes.dataset.count=overview.pending;}
  const path=loadedHash.split('/');
  if(path[1]==='requests'){
   if(path[2]){await review(path[2],version,user);return;}
   const result=await api('/manage/requests?status='+(path[2]||'pending'));if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><h2>Změny ke schválení</h2><span class="status-pill pending">'+result.requests.length+' čeká</span></div><p class="web-muted">Před rozhodnutím porovnej návrh se schválenou verzí.</p><div class="request-list">'+(result.requests.length?result.requests.map(r=>'<a class="request-card" href="#manage/requests/'+r.id+'"><img src="assets/icon-'+r.character_key+'.png" width="64" height="64" alt=""><div><h3>'+text(catalog[r.character_key].name)+'</h3><p>'+date(r.created_at)+'</p></div><span>Porovnat změny ↗</span></a>').join(''):'<div class="web-empty">'+icon('check')+'<h3>Všechny spisy jsou vyřízené.</h3><p>Nové žádosti se objeví tady.</p></div>')+'</div>';
  }else if(path[1]==='users'){
   const result=await api('/manage/users');if(!valid(version,user))return;
   content().innerHTML='<h2>Uživatelé a poslední přihlášení</h2><p class="web-muted">Čas posledního úspěšného přihlášení přes Discord. Obnovení stránky jej nemění.</p><div class="user-list">'+result.users.map(r=>'<article class="web-list-row">'+(r.avatar?'<img src="'+text(r.avatar)+'" width="44" height="44" alt="">':'')+'<div><strong>'+text(r.display_name)+'</strong><p>'+text(r.characters.map(k=>catalog[k].name).join(', ')||'Bez přiřazené postavy')+'</p></div><time>'+date(r.last_login)+'</time></article>').join('')+'</div>';
  }else if(path[1]==='admins'){await administrators(version,user);}
  else if(path[1]==='audit'){
   const result=await api('/manage/audit');if(!valid(version,user))return;
   const actionLabels={'character.approved':'Schválení postavy','character.rejected':'Zamítnutí návrhu','admin.updated':'Úprava oprávnění správce','admin.removed':'Odebrání správce'};
   content().innerHTML='<h2>Historie rozhodnutí</h2>'+result.events.map(r=>'<article class="web-list-row"><div><strong>'+text(actionLabels[r.action]||'Rozhodnutí správy')+'</strong><p>'+text(r.character_key?catalog[r.character_key].name:r.target)+'</p><p>'+text(r.action.startsWith('admin.')?'Změna přístupu ke správě webu.':r.detail)+'</p><small>Provedl: '+text(r.actor_name||(r.actor_id===identity.user.id?identity.user.name:r.actor_id))+'</small>'+(r.character_key?'<p><a class="web-back" href="#manage/requests/'+r.target+'">Otevřít rozhodnutí ↗</a></p>':'')+'</div><time>'+date(r.created_at)+'</time></article>').join('');
  }else if(path[1]==='mail'){
   if(!permissions.includes('official'))throw Error('Nemáš oprávnění odesílat za správu.');
   content().innerHTML='<h2>Telegramy správy</h2><p>Odešli konkrétnímu hráči zprávu s ověřenou pečetí Správy kroniky.</p><a class="web-button primary" href="#telegrams/compose-official">Napsat úřední telegram ↗</a>';
  }else{
   content().innerHTML='<div class="manage-stats">'+(permissions.includes('review')?'<a href="#manage/requests" class="manage-stat"><span class="signal '+(overview.pending?'signal-pending':'')+'"></span><strong>'+overview.pending+'</strong><h2>Změny ke schválení</h2><p>'+ (overview.pending?'Spisy čekají na tvoje rozhodnutí.':'V tuto chvíli nic nečeká.')+'</p></a>':'')+'<a href="#telegrams" class="manage-stat">'+icon('mail')+'<strong>'+overview.unread+'</strong><h2>Nepřečtené telegramy</h2><p>Tvoje soukromá poštovní schránka.</p></a></div><div class="web-callout"><div><h2>Pracovna správce</h2><p>Každé rozhodnutí má svou stopu. Spravuj pouze údaje, ke kterým máš oprávnění. Soukromé deníky a cizí telegramy zůstávají pod vlastními přístupy.</p></div></div>';
  }
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
   page.querySelector('form').onsubmit=async event=>{event.preventDefault();const f=event.target;f.querySelector('button').disabled=true;try{const r=await api('/telegrams',{method:'POST',body:JSON.stringify({recipient:f.elements.recipient.value,subject:f.elements.subject.value,text:f.elements.body.value,official,requestId:mailRequest})});if(valid(version,user)){await refreshSession();location.hash='#telegrams/message/'+r.id;}}catch(e){if(valid(version,user)){setStatus(e.message);f.querySelector('button').disabled=false;}}};
  }else if(path[1]==='message'){
   const {message:r}=await api('/telegrams/'+path[2]);if(!valid(version,user))return;
   content().innerHTML='<a class="web-back" href="#telegrams">← Do schránky</a><article class="telegram-paper">'+(r.official?'<span class="official-seal">'+icon('admin')+' OVĚŘENÁ SPRÁVA KRONIKY</span>':'<span class="eyebrow">SOUKROMÝ TELEGRAM</span>')+'<h2>'+text(r.subject)+'</h2><div class="telegram-address"><p>Od: <strong>'+text(r.sender_name)+'</strong></p><p>Komu: '+text(r.recipient_name)+'</p><time>'+date(r.created_at)+'</time></div><div class="telegram-text">'+text(r.body).replace(/\n/g,'<br>')+'</div></article>';
   if(r.sender_id!==user)content().append(button('Odpovědět',()=>location.hash='#telegrams/compose/'+r.sender_id));
   if(r.recipient_id===user&&!r.read_at){await api('/telegrams/'+r.id,{method:'POST',body:'{}'});if(valid(version,user))await refreshSession();}
  }else{
   const sent=path[1]==='sent',n=Number(path[sent?2:1]||0),result=await api('/telegrams?box='+(sent?'sent':'inbox')+'&page='+n);if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><h2>'+(sent?'Odeslané telegramy':'Doručené telegramy')+'</h2><a class="web-button" href="#telegrams/compose">Napsat telegram ↗</a></div><div class="telegram-list">'+(result.messages.length?result.messages.map(r=>'<a href="#telegrams/message/'+r.id+'" class="telegram-row '+(!r.read_at&&!sent?'is-unread':'')+'">'+icon(r.official?'admin':'mail')+'<div><span>'+text(sent?r.recipient_name:r.sender_name)+(r.official?' · SPRÁVA':'')+'</span><h3>'+text(r.subject)+'</h3></div><time>'+date(r.created_at)+'</time></a>').join(''):'<div class="web-empty">'+icon('mail')+'<h3>Ve schránce je zatím klid.</h3><p>Až ti někdo napíše, telegram najdeš tady.</p></div>')+'</div><div class="web-actions">'+(n>0?'<a class="web-button" href="#telegrams/'+(sent?'sent/':'')+(n-1)+'">← Novější</a>':'')+(result.hasMore?'<a class="web-button" href="#telegrams/'+(sent?'sent/':'')+(n+1)+'">Starší →</a>':'')+'</div>';
  }
 }
 function allowed(){const path=location.hash.split('/')[1];if(path==='admins')return !!identity?.admin?.owner;const permission={requests:'review',audit:'review',users:'activity',mail:'official'}[path];return permission?has(permission):!!identity?.admin?.owner||!!identity?.admin?.permissions.length;}
 return {init,sync,open,purge,beforeRoute,get matches(){return routeMatch();},get active(){return view;},allowed};
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
  host.addEventListener('focusout',()=>queueMicrotask(()=>{if(!host.contains(document.activeElement))closeMenu();}));
  window.addEventListener('hashchange',()=>{closeMenu();closeBirthday();refresh();});
  birthday=document.createElement('dialog');birthday.className='birthday-dialog';birthday.setAttribute('aria-labelledby','birthday-title');birthday.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít narozeniny">×</button><div class="birthday-content"></div>';document.body.append(birthday);birthday.querySelector('button').onclick=closeBirthday;
  birthday.addEventListener('cancel',event=>{event.preventDefault();closeBirthday();});birthday.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeBirthday();}});
  settings=document.createElement('dialog');settings.className='notification-dialog';settings.setAttribute('aria-labelledby','notification-title');settings.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít nastavení">×</button><span class="notification-emblem">'+bell+'</span><span class="eyebrow">SOUKROMÉ ZPRÁVY OD UBD</span><h2 id="notification-title">Když kronika zavolá.</h2><p>Vyber, na co tě má bot upozornit soukromou zprávou na Discordu. Obsah zpráv a lore zůstává na webu.</p><form><fieldset><label><input type="checkbox" name="telegrams">Nové telegramy</label><label><input type="checkbox" name="decisions">Rozhodnutí o úpravách mé postavy</label><label class="review-preference"><input type="checkbox" name="reviews">Nové návrhy ke schválení</label><button class="web-button primary">Uložit nastavení</button></fieldset></form><p class="notification-status" role="status" aria-live="polite"></p>';document.body.append(settings);settings.querySelector('.dialog-close').onclick=()=>{settingsVersion++;settings.close();};
  settings.addEventListener('cancel',()=>settingsVersion++);settings.querySelector('form').onsubmit=saveSettings;
  for(const dialog of [settings,birthday])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){if(dialog===birthday)closeBirthday();else{settingsVersion++;settings.close();}}});
 }
 function account(){
  closeMenu();nav.querySelector('.menu-logout')?.remove();clearPrivate();
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
   content.innerHTML='<img class="birthday-medallion" width="130" height="130" alt="" src="assets/icon-'+key+'.png"><span class="eyebrow">ZAPSÁNO V KRONICE · NAROZENÍ</span><h2 id="birthday-title"></h2><span class="birthday-emblem">'+cake+'</span><time class="birthday-date"></time><p class="birthday-place"></p><span class="birthday-ornament" aria-hidden="true">— ✦ —</span><blockquote></blockquote><p class="birthday-footnote">Ze schváleného osobního spisu</p>';
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
 if(!response.ok)throw Object.assign(Error(data.error || 'Archiv není dostupný.'),{status:response.status});
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
 purgeProfile();Journal.purge();PortalPolish.loading(key,false);selection.hidden=!!identity;portal.hidden=!identity;
 const person=catalog[key];denial.style.setProperty('--aura',person.color);
 denial.querySelector('img').src='assets/icon-'+key+'.png';
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
 Community.sync();
 UserChrome.refresh();
 const fingerprint=identity?JSON.stringify([identity.user,identity.owned,identity.access,identity.journalAccess,identity.directory,new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague'}).format(new Date())]):'guest';
 if(fingerprint===accountFingerprint)return;accountFingerprint=fingerprint;
 document.body.classList.toggle('signed-in',!!identity);welcome.hidden=!identity;rail.hidden=!identity;
 accountControls.replaceChildren();
 if(!identity){Community.purge();PortalPolish.closeCast();rail.replaceChildren();portal.replaceChildren();const login=document.createElement('a');login.href=loginHref;login.className='discord-login';login.textContent='Přihlásit přes Discord';accountControls.append(login);UserChrome.account();return;}
 const photo=new Image(34,34);photo.src=identity.user.avatar;photo.alt='';accountControls.append(photo);
 const name=document.createElement('span');name.textContent=identity.user.name;accountControls.append(name);
 const logout=document.createElement('button');logout.type='button';logout.textContent='Odhlásit';logout.onclick=async()=>{
  logout.disabled=true;loggingOut=true;refreshVersion++;try{await api('/auth/logout',{method:'POST'});identity=null;csrf='';purgeProfile();Journal.purge();resetTrust();renderAccount();location.hash='';await route();}catch(error){setNotice(error.message);logout.disabled=false;}finally{loggingOut=false;}
 };accountControls.append(logout);
 const day=new Intl.DateTimeFormat('cs-CZ',{weekday:'long',timeZone:'Europe/Prague'}).format(new Date());
 const greeting={pondělí:'Krásné pondělí',úterý:'Krásné úterý',středa:'Krásnou středu',čtvrtek:'Krásný čtvrtek',pátek:'Krásný pátek',sobota:'Krásnou sobotu',neděle:'Krásnou neděli'};
 welcome.querySelector('h2').textContent=(greeting[day]||'Krásný den')+', '+identity.user.name+'.';
 const own=identity.owned[0],person=catalog[own];
 document.body.style.setProperty('--account-aura',person?.color||'#c88e4a');
 welcome.querySelector('p').textContent=person?'Tvůj příběh čeká, '+person.nickname+'.':'Vítej mezi příběhy, do kterých ti jejich hráči dovolí nahlédnout.';
 welcome.querySelector('.trust-open').hidden=!own;
 rail.innerHTML='<header class="cast-heading"><div><span class="eyebrow">SEDM OSUDŮ. JEDEN HORIZONT.</span><h2>Příběhy kolem tebe<span aria-hidden="true">✦</span></h2><p>Známé tváře. Vlastní tajemství. Každý příběh otevírá důvěra.</p></div><span class="cast-count">'+String(Object.keys(catalog).length-(own?1:0)).padStart(2,'0')+'<small>DALŠÍCH PŘÍBĚHŮ</small></span></header><div class="cast-grid">'+Object.entries(catalog).filter(([key])=>key!==own).map(([key,p])=>'<a href="#'+key+'" class="private-medallion" style="--aura:'+p.color+'"><img src="assets/icon-'+key+'.png" alt="" width="180" height="180"><span>'+escape(p.nickname)+'</span></a>').join('')+'</div><p class="cast-footnote">Příběh a deník mají vlastní povolení. O přístup můžeš požádat přímo hráče.</p>';
 portal.innerHTML='<section class="personal-scene" style="--aura:'+(person?.color||'#c88e4a')+'">'+(person?'<img class="personal-portrait" src="assets/'+person.image+'" alt="'+escape(person.name)+'" width="1024" height="1536">':'<img class="personal-emblem" src="assets/NH.png" alt="New Horizon RP">')+'<div class="personal-copy"><span class="eyebrow">'+(person?'PŘÍBĚH, O KTERÉM ROZHODUJEŠ TY':'KAŽDÁ DŮVĚRA MÁ SVŮJ PŘÍBĚH')+'</span><h1>'+(person?escape(person.given)+'<strong>'+escape(person.surname)+'</strong>':'Vítej v archivu')+'</h1>'+(person?'<p class="personal-signature">'+escape(person.nickname)+'</p><p>'+escape(person.motto)+'</p><a class="story-button" href="#'+own+'">Otevřít můj příběh <span>↗</span></a>':'<p>Po straně najdeš všechny postavy. Jejich příběhy si přečteš, pokud ti je hráči zpřístupní.</p>')+'<p class="personal-privacy">'+(person?'Tvůj archiv je soukromý. Ostatní do něj vstoupí pouze s tvým svolením.':'Přihlášení samo o sobě cizí příběhy neodemyká.')+'</p></div></section>';
 PortalPolish.account(person,own);PortalPolish.active(Journal.key||activePerson,Journal.key?'journal':'lore');
 UserChrome.account();UserChrome.decorateBirthdays();
}
async function refreshSession(initial=false){
 if(loggingOut)return;const version=++refreshVersion;
 try{
  const data=await api('/auth/session');if(version!==refreshVersion)return;const next=data.authenticated?data:null,changed=identity?.user.id!==next?.user.id;
  if(changed){purgeProfile();Journal.purge();Community.purge();resetTrust();}
  const freshDirectory=JSON.stringify(data.directory||{}),directoryChanged=directoryFingerprint!==freshDirectory;directoryFingerprint=freshDirectory;
  for(const [key,patch]of Object.entries(data.directory||{}))if(catalog[key])Object.assign(catalog[key],patch);
  if(directoryChanged&&activePerson)purgeProfile();
  identity=next;csrf=data.csrf||'';ready=true;renderAccount();
  if(!identity||activePerson&&!identity.access.includes(activePerson)||Journal.key&&!identity.journalAccess?.includes(Journal.key)){purgeProfile();Journal.purge();await route();}
  else if(initial||changed||Community.matches&&!Community.active||Community.active==='manage'&&!Community.allowed()||directoryChanged&&currentKey()||currentKey()&&activePerson!==currentKey()&&identity.access.includes(currentKey())||Journal.route&&!Journal.key)await route();
 }catch(error){if(version!==refreshVersion)return;ready=true;purgeProfile();Journal.purge({preserveDraft:true});Community.purge({preserveDraft:true});UserChrome.clearPrivate();if(initial){identity=null;renderAccount();selection.hidden=false;}setNotice(error.message);}
}
async function route(){
 const version=++routeVersion,journalMatch=Journal.route,key=journalMatch?.[1]||currentKey(),previous=activePerson;
 if(!ready)return;
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
 trust.querySelector('.trust-identity img').src='assets/icon-'+trustKey+'.png';trust.querySelector('.trust-owner-name').textContent='Přístupy k postavě '+catalog[trustKey].name;
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
PortalPolish.init();Journal.init();Community.init();UserChrome.init();renderAccount();
const loginResult=new URLSearchParams(location.search).get('login');
if(loginResult){setNotice(loginResult==='failed'?'Přihlášení se nepodařilo. Ověř, že jsi členem vašeho Discord serveru, a zkus to znovu.':'Přihlášení bylo zrušeno.');history.replaceState(null,'',location.pathname+location.hash);}
refreshSession(true);
api('/directory').then(data=>{for(const [key,patch]of Object.entries(data.people||{})){if(!catalog[key])continue;Object.assign(catalog[key],patch);const card=selection.querySelector('.cast-link[href="#'+key+'"]');if(card){card.querySelector('.medallion-name').innerHTML=escapeHTML(catalog[key].given)+'<strong>'+escapeHTML(catalog[key].surname)+'</strong>';card.querySelector('.medallion-nickname').textContent=catalog[key].nickname;card.setAttribute('aria-label','Otevřít příběh: '+catalog[key].name);}}}).catch(()=>{});
