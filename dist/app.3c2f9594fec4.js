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
  target.querySelector('.rail-player').textContent=names.get(key)||catalog[key]?.player||'Hráč';
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
  container.innerHTML='<div class="section-heading"><h2>Sezónní laboratoř</h2><span class="status-pill">JEN TVŮJ NÁHLED</span></div><p class="web-muted">Zkoušej atmosféru přímo na skle kroniky. Ostatním hráčům se vzhled nemění.</p><div class="season-controls"><label>Roční období<select class="season-choice"><option value="off">Bez efektu</option><option value="auto">Podle aktuálního období</option><option value="spring">Jaro</option><option value="summer">Léto</option><option value="autumn">Podzim</option><option value="winter">Zima · zamrzlé sklo</option></select></label><label>Síla efektu <output class="season-level">65 %</output><input class="season-strength" type="range" min="10" max="100" value="65"></label><button class="web-button frost-reset" type="button">Obnovit námrazu</button><button class="web-button season-off" type="button">Vypnout náhled</button></div><section class="season-stage" data-season="off" aria-label="Náhled sezónní atmosféry"><div class="season-landscape" aria-hidden="true"></div><div class="season-sunlight" aria-hidden="true"></div><div class="season-preview-copy"><span class="eyebrow">ŠEST OSUDŮ · JEDEN HORIZONT</span><h3>Příběhy pod<br>stejným nebem.</h3><p class="season-greeting">Tvoje kronika. Tvoje atmosféra.</p><button type="button" class="web-button season-click-test">Zkusit tlačítko ↗</button><span class="season-click-result" role="status"></span></div><canvas class="season-canvas" aria-hidden="true"></canvas></section><p class="season-feedback" role="status"></p>';
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
 return{open:async(container)=>{await open(container);Holiday.controls(container);},dispose};
})();

// Public, viewport-sized atmosphere. It contains no account data and never
// intercepts input. Only this browser's preference is saved, not other players'.
const SeasonAtmosphere=(()=>{
 const modes=['auto','off','spring','summer','autumn','winter'];
 let suspended=false,festive=false;
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
 function apply(){if(!host)return;season=(suspended||festive||!identity||identity.restricted||/^#manage(?:\/|$)/.test(location.hash))?'off':mode==='auto'?current():mode;host.dataset.season=season;document.documentElement.dataset.season=season;holes=[];frost();paint(performance.now());}
 function configure(next,level){mode=modes.includes(next)?next:'auto';strength=Math.min(100,Math.max(10,Number(level)||45));try{localStorage.setItem('nh-season',JSON.stringify({mode,strength}));}catch{}apply();Holiday.update();}
 function init(){
  if(host)return;try{const saved=JSON.parse(localStorage.getItem('nh-season'));if(saved&&modes.includes(saved.mode)){mode=saved.mode;strength=Math.min(100,Math.max(10,Number(saved.strength)||45));}}catch{}
  reduced=matchMedia('(prefers-reduced-motion: reduce)');host=document.createElement('div');host.className='season-global';host.setAttribute('aria-hidden','true');host.innerHTML='<span class="season-global-light"></span><canvas></canvas>';document.body.append(host);canvas=host.querySelector('canvas');ctx=canvas.getContext('2d');
  const melt=event=>{if(season!=='winter'||document.hidden)return;const p={x:event.clientX/innerWidth,y:event.clientY/innerHeight,t:performance.now()},last=holes.at(-1);if(last&&Math.hypot((last.x-p.x)*innerWidth,(last.y-p.y)*innerHeight)<10)return;holes.push(p);if(holes.length>70)holes.shift();if(reduced.matches)paint(p.t);else schedule();};
  window.addEventListener('pointermove',melt,{passive:true});window.addEventListener('pointerdown',melt,{passive:true});window.addEventListener('resize',fit,{passive:true});
  window.addEventListener('hashchange',apply);document.addEventListener('visibilitychange',()=>document.hidden?stop():apply());reduced.addEventListener('change',()=>paint(performance.now()));fit();apply();
 }
 function syncSession(){const next=(suspended||festive||!identity||identity.restricted||/^#manage(?:\/|$)/.test(location.hash))?'off':mode==='auto'?current():mode;if(host&&season!==next)apply();}
 return{init,configure,syncSession,festive(value){if(festive===!!value)return;festive=!!value;apply();},suspend(value){suspended=!!value;apply();},get mode(){return mode;},get strength(){return strength;}};
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

const MemberProfile=(()=>{
 let generation=0,host=null;
 function dispose(){generation++;host=null;}
 async function open(container,route){
  dispose();host=container;const version=generation,user=identity.user.id,id=route.split('/')[1]||user;
  host.innerHTML='<p role="status">Načítám vizitku…</p>';
  try{
   const member=await api('/archive/player/'+encodeURIComponent(id));if(version!==generation||identity?.user.id!==user||!host?.isConnected)return;
   host.innerHTML='<article class="member-visiting-card"><span class="eyebrow">OBYVATEL ÚSTAVU</span><img class="member-avatar" src="'+escapeHTML(member.avatar||mediaURL('NH.png',160))+'" width="96" height="96" alt=""><h2>'+escapeHTML(member.name)+'</h2>'+(member.character?'<div class="member-character"><img src="'+mediaURL('icon-'+member.character+'.png',320)+'" width="112" height="112" alt=""><span>POSTAVA</span><h3>'+escapeHTML(member.characterName)+'</h3><a class="web-button" href="#'+member.character+'">Otevřít příběh ↗</a></div>':'<p>K tomuto účtu není přiřazená postava.</p>')+'<p class="web-muted">Soukromý příběh se otevírá pouze se souhlasem jeho vlastníka.</p></article>';
  }catch(error){if(version===generation&&identity?.user.id===user&&host?.isConnected){host.replaceChildren();const p=document.createElement('p');p.setAttribute('role','status');p.textContent=error.message;host.append(p);}}
 }
 return{open,dispose};
})();

const Holiday=(()=>{
 let root=null,enabled=true,previewing=false,active=false;
 function update(){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{month:'numeric',day:'numeric',timeZone:'Europe/Prague'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  if(!identity?.admin?.owner)previewing=false;
  active=!!identity&&!/^#manage(?:\/|$)/.test(location.hash)&&enabled&&SeasonAtmosphere.mode!=='off'&&!identity?.restricted&&(previewing||(Number(parts.month)===12&&Number(parts.day)>=20&&Number(parts.day)<=26));
  document.body.classList.toggle('christmas-week',active);if(root){root.hidden=!active;root.classList.toggle('holiday-paused',document.hidden);}
  SeasonAtmosphere.festive(active);
 }
 function init(){
  if(root)return;try{enabled=localStorage.getItem('nh-holiday')!=='off';}catch{}
  root=document.createElement('div');root.className='holiday-decoration';root.setAttribute('aria-hidden','true');root.innerHTML='<div class="holiday-garland">'+Array.from({length:12},(_,i)=>'<i class="holiday-bulb" style="--n:'+i+'"></i>').join('')+'</div>'+[0,1,2].map(i=>'<span class="holiday-bauble bauble-'+i+'"><b>✦</b></span>').join('')+'<div class="holiday-flakes">'+Array.from({length:14},(_,i)=>'<i style="--n:'+i+'">✧</i>').join('')+'</div><span class="holiday-frost"></span>';document.body.append(root);document.addEventListener('visibilitychange',update);window.addEventListener('hashchange',update);setInterval(update,60000);update();
 }
 function controls(host){
  const section=document.createElement('section');section.className='holiday-settings';section.innerHTML='<span class="eyebrow">20.–26. PROSINCE · EVROPA / PRAHA</span><h2>Vánoce na horizontu</h2><p>Jehličí, teplá světýlka, ozdoby a jemný sníh. Výzdoba se objeví automaticky na vánoční týden.</p><label><input type="checkbox" '+(enabled?'checked':'')+'> Povolit vánoční výzdobu</label><div class="holiday-preview-actions"></div>';
  section.querySelector('input').onchange=e=>{enabled=e.target.checked;try{localStorage.setItem('nh-holiday',enabled?'on':'off');}catch{}update();};
  if(identity?.admin?.owner){const b=document.createElement('button');b.type='button';b.className='web-button';b.textContent='Přepnout správcovský náhled Vánoc';b.onclick=()=>preview(!previewing);section.querySelector('.holiday-preview-actions').append(b);const hint=document.createElement('p');hint.className='web-muted';hint.textContent='Náhled mění vzhled pouze tobě. Neposouvá skutečné datum.';section.append(hint);}host.append(section);
 }
 function preview(value){if(!identity?.admin?.owner)return;previewing=!!value;if(value)enabled=true;update();}
 return{init,update,controls,preview,get active(){return active;}};
})();

const Atelier=(()=>{
 const camera='<svg viewBox="0 0 80 64" aria-hidden="true"><path d="M8 19h64v37H8zM23 19l5-10h24l5 10M12 25h9M59 25h8"/><circle cx="40" cy="37" r="16"/><circle cx="40" cy="37" r="11"/><path d="M40 22v4m15 11h-4M40 52v-4M25 37h4M30 26l3 3m17-3-3 3"/></svg>';
 const presets={sepia:['Vzpomínka 1897','Teplá sépie a starý papír'],portrait:['Rodinný portrét','Černobílá, měkké rohy'],pocket:['Z kapsy kabátu','Přeložení, škrábance, patina'],postcard:['Pohlednice','Světlý papír a místo pro vzkaz'],clean:['Čistá fotografie','Původní barvy a jemný rámeček']};
 let host=null,bitmap=null,preview=null,photos=[],version=0,uploadVersion=0,renderFrame=0,dirty=false,busy=false,draftId=null,currentPhoto=null,dialog=null,drawError=false;
 const esc=s=>escapeHTML(s),active=(v,user)=>host?.isConnected&&v===version&&identity?.user.id===user&&!identity?.restricted;
 function status(message){host?.querySelector('.atelier-status')?.replaceChildren(document.createTextNode(message));}
 function controls(){return host?.querySelector('.atelier-form');}
 function settings(){const form=controls();return Object.fromEntries(new FormData(form));}
 function button(label,fn,cls=''){const b=document.createElement('button');b.type='button';b.className='web-button '+cls;b.textContent=label;b.onclick=fn;return b;}
 function dispose(){version++;cancelAnimationFrame(renderFrame);renderFrame=0;bitmap?.close?.();bitmap=null;host=null;preview=null;photos=[];dirty=false;busy=false;draftId=null;currentPhoto=null;dialog?.close();dialog?.remove();dialog=null;}
 function setEnabled(){if(!host)return;host.querySelectorAll('.atelier-save,.atelier-download').forEach(b=>b.disabled=!bitmap||busy);host.querySelector('.atelier-form fieldset').disabled=busy;host.querySelector('.atelier-file').disabled=busy;}
 function changed(){if(!bitmap)return;dirty=true;draftId=null;currentPhoto=null;host.querySelector('.atelier-discord').hidden=true;status('Náhled je upravený. Vyvolej fotografii nebo si ji stáhni.');schedule();}
 function schedule(){cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(()=>{renderFrame=0;if(!bitmap||!preview)return;try{draw(preview,800,settings());drawError=false;}catch{drawError=true;status('Náhled se nepodařilo vykreslit. Zkus jiný snímek.');}});}
 const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function paperPath(ctx,w,h,torn){
  ctx.beginPath();if(!torn){ctx.rect(0,0,w,h);return;}
  const r=rng(1897),step=18;
  ctx.moveTo(7,7);for(let x=7;x<w-7;x+=step)ctx.lineTo(x,3+r()*7);
  for(let y=7;y<h-7;y+=step)ctx.lineTo(w-3-r()*7,y);
  for(let x=w-7;x>7;x-=step)ctx.lineTo(x,h-3-r()*7);
  for(let y=h-7;y>7;y-=step)ctx.lineTo(3+r()*7,y);ctx.closePath();
 }
 function draw(canvas,longEdge,s){
  const ratio={wide:1.5,portrait:.75,square:1}[s.format]||1.5;
  const iw=ratio>=1?longEdge:Math.round(longEdge*ratio),ih=Math.round(iw/ratio),edge=Math.round(longEdge*.035),bottom=Math.round(longEdge*.18);
  canvas.width=iw+edge*2;canvas.height=ih+edge+bottom;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,strength=Number(s.strength)/100;
  ctx.save();paperPath(ctx,w,h,s.edge==='torn');ctx.clip();ctx.fillStyle={ivory:'#e8dbc0',warm:'#cdb58b',pale:'#f1eadb'}[s.paper]||'#e8dbc0';ctx.fillRect(0,0,w,h);
  const zoom=Number(s.zoom),cover=Math.max(iw/bitmap.width,ih/bitmap.height)*zoom,sw=iw/cover,sh=ih/cover;
  const sx=(bitmap.width-sw)*(Number(s.panX)+100)/200,sy=(bitmap.height-sh)*(Number(s.panY)+100)/200;
  ctx.drawImage(bitmap,sx,sy,sw,sh,edge,edge,iw,ih);
  ctx.save();ctx.beginPath();ctx.rect(edge,edge,iw,ih);ctx.clip();
  if(typeof ctx.filter==='string'){
   ctx.globalAlpha=strength;ctx.filter={sepia:'sepia(.88) saturate(.65) contrast(.95) brightness(1.06)',portrait:'grayscale(1) contrast(.9) brightness(1.08)',pocket:'sepia(.8) saturate(.55) contrast(.86)',postcard:'sepia(.28) saturate(.82) contrast(.95)',clean:'none'}[s.preset];
   ctx.drawImage(bitmap,sx,sy,sw,sh,edge,edge,iw,ih);ctx.filter='none';ctx.globalAlpha=1;
  }else if(s.preset!=='clean'){
   // Pixel fallback keeps the five treatments available without native canvas filters.
   const pixels=ctx.getImageData(edge,edge,iw,ih),data=pixels.data,config={sepia:[.88,.65,.95,1.06],portrait:[0,0,.9,1.08],pocket:[.8,.55,.86,1],postcard:[.28,.82,.95,1]}[s.preset], [sepia,sat,contrast,brightness]=config;
   for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];let nr=r*(1-sepia)+(r*.393+g*.769+b*.189)*sepia,ng=g*(1-sepia)+(r*.349+g*.686+b*.168)*sepia,nb=b*(1-sepia)+(r*.272+g*.534+b*.131)*sepia;const gray=nr*.2126+ng*.7152+nb*.0722;nr=((gray+(nr-gray)*sat-128)*contrast+128)*brightness;ng=((gray+(ng-gray)*sat-128)*contrast+128)*brightness;nb=((gray+(nb-gray)*sat-128)*contrast+128)*brightness;data[i]=r+(nr-r)*strength;data[i+1]=g+(ng-g)*strength;data[i+2]=b+(nb-b)*strength;}
   ctx.putImageData(pixels,edge,edge);
  }
  if(s.preset!=='clean'){
   const v=ctx.createRadialGradient(w/2,edge+ih/2,iw*.15,w/2,edge+ih/2,Math.max(iw,ih)*.7);v.addColorStop(0,'#29180400');v.addColorStop(1,'#29180488');ctx.globalAlpha=strength*.55;ctx.fillStyle=v;ctx.fillRect(edge,edge,iw,ih);
   const r=rng(1879);ctx.globalAlpha=strength*.13;
   for(let i=0;i<2200;i++){ctx.fillStyle=i%2?'#fff2cb':'#26190f';ctx.fillRect(edge+r()*iw,edge+r()*ih,1+r()*2,1+r()*2);}
   if(s.preset==='pocket'){
    ctx.strokeStyle='#fff0ce';ctx.lineWidth=Math.max(1,longEdge/1000);ctx.globalAlpha=strength*.18;
    for(let i=0;i<24;i++){const x=edge+r()*iw,y=edge+r()*ih;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(r()-.5)*40,y+20+r()*100);ctx.stroke();}
    const fold=ctx.createLinearGradient(w/2-8,0,w/2+8,0);fold.addColorStop(0,'#fff0');fold.addColorStop(.45,'#38280b55');fold.addColorStop(.5,'#fff1c999');fold.addColorStop(1,'#fff0');ctx.globalAlpha=strength*.7;ctx.fillStyle=fold;ctx.fillRect(w/2-8,edge,16,ih);
   }
  }
  ctx.restore();
  // Ink is drawn as text, never interpreted as HTML or remote content.
  ctx.fillStyle='#3d2b1d';ctx.textAlign='center';ctx.textBaseline='middle';
  const font=s.font==='hand'?'"Mrs Saint Delafield", cursive':s.font==='type'?'"Courier New", monospace':'"IM Fell English", Georgia';
  function line(value,y,size,max=iw){if(s.font==='hand')size*=1.35;ctx.font=size+'px '+font;while(ctx.measureText(value).width>max&&size>10){size-=1;ctx.font=size+'px '+font;}ctx.fillText(value,w/2,y);}
  line(s.title||'Vzpomínka z pohraničí',edge+ih+bottom*.23,longEdge*.032);
  line([s.place,s.date].filter(Boolean).join(' · '),edge+ih+bottom*.46,longEdge*.021);
  line(s.dedication||'',edge+ih+bottom*.68,longEdge*.026);
  line(s.signature||'',edge+ih+bottom*.88,longEdge*.028);
  if(s.ornament==='tape'){ctx.save();ctx.translate(w*.16,edge*.9);ctx.rotate(-.16);ctx.fillStyle='#ceb98ab0';ctx.fillRect(-edge*1.1,-edge*.55,edge*3.5,edge*1.1);ctx.restore();}
  if(s.ornament==='pin'){ctx.save();ctx.shadowColor='#0007';ctx.shadowBlur=4;ctx.shadowOffsetY=3;const pin=ctx.createRadialGradient(w/2-2,edge*.5-2,1,w/2,edge*.5,edge*.22);pin.addColorStop(0,'#f6e2b4');pin.addColorStop(1,'#796044');ctx.fillStyle=pin;ctx.beginPath();ctx.arc(w/2,edge*.5,edge*.22,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(s.ornament==='stamp'){ctx.save();ctx.translate(w-edge*2,h-edge*1.4);ctx.rotate(-.15);ctx.strokeStyle='#94472d99';ctx.fillStyle='#94472d99';ctx.lineWidth=2;ctx.strokeRect(-longEdge*.16,-longEdge*.035,longEdge*.16,longEdge*.05);ctx.textAlign='center';ctx.font=longEdge*.015+'px Georgia';ctx.fillText('NEW HORIZON',-longEdge*.08,-longEdge*.008);ctx.restore();}
  ctx.restore();
 }
 async function upload(file){
  if(!file||busy)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){status('Vyber JPG, PNG nebo WebP do 15 MB.');return;}
  const v=version,uploadId=++uploadVersion,user=identity.user.id;status('Připravuji snímek…');
  try{
   let image=await createImageBitmap(file,{imageOrientation:'from-image'});if(!active(v,user)||uploadId!==uploadVersion){image.close();return;}
   if(image.width>12000||image.height>12000||image.width*image.height>40000000){image.close();throw Error('Snímek má příliš velké rozlišení. Použij menší kopii.');}
   if(Math.max(image.width,image.height)>2200){const scale=2200/Math.max(image.width,image.height),small=await createImageBitmap(image,{resizeWidth:Math.round(image.width*scale),resizeHeight:Math.round(image.height*scale),resizeQuality:'high'});image.close();image=small;}
   if(!active(v,user)||uploadId!==uploadVersion){image.close();return;}bitmap?.close?.();bitmap=image;controls().elements.zoom.value=1;controls().elements.panX.value=0;controls().elements.panY.value=0;
   host.querySelector('.atelier-empty').hidden=true;preview.hidden=false;setEnabled();changed();
  }catch(error){if(active(v,user)&&uploadId===uploadVersion)status(error.message||'Fotografii nelze otevřít.');}
 }
 async function blob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Snímek nelze vytvořit.')),type,quality));}
 async function encoded(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});}
 function downloadBlob(data,name){const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 async function download(){if(!bitmap||busy||drawError)return;try{const c=document.createElement('canvas');draw(c,1600,settings());downloadBlob(await blob(c,'image/png'),'new-horizon-fotografie.png');status('Fotografie je připravená ke stažení.');}catch(error){status(error.message);}}
 async function save(){
  if(!bitmap||busy||drawError)return;const s=settings();busy=true;setEnabled();const v=version,user=identity.user.id;
  host.querySelector('.atelier-stage').classList.remove('is-developed');void preview.offsetWidth;host.querySelector('.atelier-stage').classList.add('is-developed');status('Vyvolávám a ukládám fotografii…');
  try{
   const c=document.createElement('canvas');draw(c,1280,s);let photo;
   // Flatten transparency onto warm paper for the bounded JPEG exhibition copy.
   const jpg=document.createElement('canvas');jpg.width=c.width;jpg.height=c.height;const context=jpg.getContext('2d');context.fillStyle='#e8dbc0';context.fillRect(0,0,jpg.width,jpg.height);context.drawImage(c,0,0);
   for(const quality of [.9,.8,.68,.55]){photo=await blob(jpg,'image/jpeg',quality);if(photo.size<=700000)break;}
   if(photo.size>700000)throw Error('Tento snímek je pro výstavku příliš velký. Zkus menší ořez.');
   draftId ||= crypto.randomUUID();const data=await api('/atelier/photos',{method:'POST',signal:AbortSignal.timeout(15000),body:JSON.stringify({id:draftId,title:s.title.trim()||'Vzpomínka z pohraničí',preset:s.preset,image:await encoded(photo)})});
   if(!active(v,user))return;currentPhoto=data.photo;dirty=false;host.querySelector('.atelier-discord').hidden=false;status('Fotografie visí na tvé šňůře. Můžeš ji poslat na Discord.');await loadPhotos(v,user);
  }catch(error){if(active(v,user))status(error.message+' PNG si můžeš stáhnout i bez uložení.');}
  finally{if(active(v,user)){busy=false;setEnabled();}}
 }
 function closeDialog(){dialog?.close();dialog?.remove();dialog=null;}
 function makeDialog(title){closeDialog();dialog=document.createElement('dialog');dialog.className='atelier-dialog';dialog.setAttribute('aria-labelledby','atelier-dialog-title');dialog.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít">×</button><h2 id="atelier-dialog-title"></h2><div class="atelier-dialog-body"></div><p class="atelier-dialog-status" role="status"></p>';dialog.querySelector('h2').textContent=title;dialog.querySelector('.dialog-close').onclick=closeDialog;dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});document.body.append(dialog);dialog.showModal();return dialog;}
 async function share(photo){
  if(!photo)return;const v=version,user=identity.user.id,d=makeDialog('Odeslat fotografii na Discord'),body=d.querySelector('.atelier-dialog-body'),message=d.querySelector('.atelier-dialog-status');
  body.innerHTML='<img class="atelier-share-preview" alt=""><p>Vyber kanál. Snímek odešle UBD s tvým jménem. Uvidí ho lidé, kteří mají do kanálu přístup.</p><label>Kanál<select class="atelier-channel" disabled><option>Načítám dostupné kanály…</option></select></label>';
  body.querySelector('img').src=photo.url;const send=button('Odeslat fotografii',async()=>{
   if(send.disabled)return;send.disabled=true;select.disabled=true;message.textContent='Odesílám…';
   try{const result=await api('/atelier/publish',{method:'POST',signal:AbortSignal.timeout(20000),body:JSON.stringify({photoId:photo.id,channelId:select.value})});if(!active(v,user)||dialog!==d)return;message.replaceChildren(document.createTextNode(result.existing?'Tato fotka už v kanálu je. ':'Fotografie byla odeslána. '));const link=document.createElement('a');link.href=result.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Otevřít na Discordu ↗';message.append(link);send.textContent='Odesláno';}
   catch(error){if(active(v,user)&&dialog===d){message.textContent=error.message;send.disabled=!!error.uncertain;select.disabled=false;}}
  },'primary');send.disabled=true;body.append(send);const select=body.querySelector('select');
  try{const data=await api('/atelier/channels',{signal:AbortSignal.timeout(12000)});if(!active(v,user)||dialog!==d)return;select.replaceChildren();for(const channel of data.channels){const option=document.createElement('option');option.value=channel.id;option.textContent='# '+channel.name;select.append(option);}select.disabled=!data.channels.length;send.disabled=!data.channels.length;if(!data.channels.length)message.textContent='Nemáš dostupný kanál pro fotografie. Zkontroluj s vedením práva Odesílat zprávy a Přiložit soubory.';}
  catch(error){if(dialog===d)message.textContent=error.message;}
 }
 function inspect(photo){
  const d=makeDialog(photo.title),body=d.querySelector('.atelier-dialog-body');body.innerHTML='<img class="atelier-full-photo" alt=""><div class="atelier-photo-actions"></div>';body.querySelector('img').src=photo.url;
  const actions=body.querySelector('.atelier-photo-actions'),link=document.createElement('a');link.className='web-button';link.href=photo.url;link.download='new-horizon-fotografie.jpg';link.textContent='Stáhnout JPG';actions.append(link,button('Poslat na Discord',()=>share(photo),'primary'),button('Sundat ze šňůry',async()=>{
   if(!await PortalPolish.confirm('Sundat fotografii?','Odstraní se pouze z tvého ateliéru. Případná zpráva na Discordu zůstane.','Odstranit fotografii'))return;
   const v=version,user=identity.user.id;try{await api('/atelier/photos/'+photo.id,{method:'DELETE'});closeDialog();if(currentPhoto?.id===photo.id){currentPhoto=null;host.querySelector('.atelier-discord').hidden=true;}if(active(v,user))await loadPhotos(v,user);}catch(error){d.querySelector('.atelier-dialog-status').textContent=error.message;}
  },'subtle'));
 }
 function paintPhotos(){
  const rack=host.querySelector('.atelier-clothesline');rack.replaceChildren();rack.style.setProperty('--prints',Math.max(1,photos.length));host.querySelector('.atelier-count').textContent=photos.length+' / 5';
  if(!photos.length){rack.innerHTML='<p class="atelier-rack-empty">První vzpomínka zatím čeká na vyvolání.<br><span>Na šňůře zůstane tvých pět nejnovějších fotografií.</span></p>';return;}
  for(const [index,photo]of photos.entries()){const card=document.createElement('button');card.type='button';card.className='atelier-hanging-photo';card.style.setProperty('--tilt',[-4,3,-2,4,-3][index]+'deg');card.style.setProperty('--delay',index*70+'ms');card.innerHTML='<span class="atelier-pin" aria-hidden="true"></span><img loading="lazy" alt=""><span class="atelier-photo-title"></span><small></small>';card.querySelector('img').src=photo.url;card.querySelector('img').alt=photo.title;card.querySelector('.atelier-photo-title').textContent=photo.title;card.querySelector('small').textContent=new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'long',timeZone:'Europe/Prague'}).format(new Date(photo.createdAt*1000));card.onclick=()=>inspect(photo);rack.append(card);}
 }
 async function loadPhotos(v,user){try{const data=await api('/atelier/photos');if(!active(v,user))return;photos=data.photos;paintPhotos();}catch(error){if(active(v,user))host.querySelector('.atelier-clothesline').textContent=error.message;}}
 async function open(container){
  dispose();host=container;const v=version,user=identity.user.id;
  host.innerHTML='<div class="atelier-intro"><span class="atelier-camera">'+camera+'</span><div><span class="eyebrow">FOTOGRAFICKÝ ATELIÉR · 1897</span><h2>Okamžik, který zůstane.</h2><p>Z vlastního snímku udělej fotografii s příběhem.</p></div><span class="atelier-studio-stamp">VYVOLÁNO<br>V POHRANIČÍ</span></div><div class="atelier-workbench"><section class="atelier-preview-panel"><label class="atelier-upload"><input type="file" class="atelier-file" accept="image/jpeg,image/png,image/webp">Vybrat fotografii <span>JPG · PNG · WebP</span></label><div class="atelier-stage"><div class="atelier-empty">'+camera+'<h3>Tvá vzpomínka začíná tady.</h3><p>Přetáhni sem screenshot z hraní<br>nebo vyber fotografii nahoře.</p><small>Původní snímek se při úpravách neodesílá.</small></div><canvas class="atelier-preview" hidden aria-label="Náhled fotografie. Přetažením upravíš ořez."></canvas></div><p class="atelier-status" role="status" aria-live="polite">Vyber snímek. Potom mu dej vlastní podobu.</p><div class="atelier-actions"><button class="web-button primary atelier-save" disabled>Vyvolat a pověsit</button><button class="web-button atelier-download" disabled>Stáhnout PNG</button><button class="web-button atelier-discord" hidden>Poslat na Discord ↗</button></div></section><form class="atelier-form"><fieldset><legend>Podoba fotografie</legend><div class="atelier-presets"></div><label>Síla patiny<input type="range" name="strength" min="0" max="100" value="75"></label><div class="atelier-pair"><label>Ořez<select name="format"><option value="wide">Na šířku</option><option value="portrait">Portrét</option><option value="square">Čtverec</option></select></label><label>Papír<select name="paper"><option value="ivory">Slonová kost</option><option value="warm">Zažloutlý</option><option value="pale">Světlý</option></select></label></div><label>Přiblížení<input name="zoom" type="range" min="1" max="3" step="0.01" value="1"></label><details class="atelier-crop"><summary>Posunutí a okraje</summary><label>Vodorovné posunutí<input name="panX" type="range" min="-100" max="100" value="0"></label><label>Svislé posunutí<input name="panY" type="range" min="-100" max="100" value="0"></label><label>Okraje<select name="edge"><option value="straight">Čistý papír</option><option value="torn">Potrhané okraje</option></select></label><label>Ozdoba<select name="ornament"><option value="none">Bez ozdoby</option><option value="tape">Kousek pásky</option><option value="pin">Připínáček</option><option value="stamp">Razítko ateliéru</option></select></label></details><label>Název fotografie<input name="title" maxlength="100" value="Vzpomínka z pohraničí"></label><div class="atelier-pair"><label>Místo<input name="place" maxlength="50" placeholder="Např. Valentine"></label><label>Datum<input name="date" maxlength="45" placeholder="Např. 17. listopadu 1897"></label></div><label>Věnování<input name="dedication" maxlength="120" placeholder="Některé večery stojí za zapamatování."></label><div class="atelier-pair"><label>Podpis<input name="signature" maxlength="50"></label><label>Písmo<select name="font"><option value="hand">Rukopisné</option><option value="book">Knižní</option><option value="type">Psací stroj</option></select></label></div></fieldset></form></div><section class="atelier-exhibition"><div class="atelier-exhibition-heading"><div><span class="eyebrow">MALÁ SBÍRKA VZPOMÍNEK</span><h2>Na tvé šňůře</h2><p>Jen tvých pět posledních vyvolaných snímků. Šestý nahradí nejstarší; fotku na Discordu tím nesmaže.</p></div><span class="atelier-count">0 / 5</span></div><div class="atelier-clothesline" aria-label="Pět posledních fotografií"><p>Načítám výstavku…</p></div></section>';
  const form=controls();form.onsubmit=e=>e.preventDefault();form.elements.signature.value=catalog[identity.owned[0]]?.nickname||identity.user.name;
  for(const [key,[title,description]]of Object.entries(presets)){const label=document.createElement('label');label.className='atelier-preset';label.dataset.preset=key;label.innerHTML='<input type="radio" name="preset" value="'+key+'"'+(key==='sepia'?' checked':'')+'><span><strong>'+title+'</strong><small>'+description+'</small></span>';host.querySelector('.atelier-presets').append(label);}
  form.addEventListener('input',changed);form.addEventListener('change',e=>{if(e.target.name==='preset'){form.elements.edge.value=e.target.value==='pocket'?'torn':'straight';form.elements.paper.value=['pocket','sepia'].includes(e.target.value)?'warm':'pale';changed();}});
  host.querySelector('.atelier-file').onchange=e=>upload(e.target.files[0]);host.querySelector('.atelier-save').onclick=save;host.querySelector('.atelier-download').onclick=download;host.querySelector('.atelier-discord').onclick=()=>share(currentPhoto);
  const stage=host.querySelector('.atelier-stage');stage.addEventListener('dragover',e=>{e.preventDefault();stage.classList.add('drag-over');});stage.addEventListener('dragleave',()=>stage.classList.remove('drag-over'));stage.addEventListener('drop',e=>{e.preventDefault();stage.classList.remove('drag-over');upload(e.dataTransfer.files[0]);});
  preview=host.querySelector('canvas');let drag=null;
  preview.onpointerdown=e=>{if(busy)return;drag={x:e.clientX,y:e.clientY,px:Number(form.elements.panX.value),py:Number(form.elements.panY.value)};preview.setPointerCapture(e.pointerId);};
  preview.onpointermove=e=>{if(!drag||busy)return;form.elements.panX.value=Math.max(-100,Math.min(100,drag.px-(e.clientX-drag.x)*.5));form.elements.panY.value=Math.max(-100,Math.min(100,drag.py-(e.clientY-drag.y)*.5));changed();};preview.onpointerup=preview.onpointercancel=()=>{drag=null;};
  document.fonts.ready.then(()=>{if(active(v,user)&&bitmap)schedule();});await loadPhotos(v,user);
 }
 return{open,dispose,get dirty(){return dirty;},get busy(){return busy;}};
})();

const RPCalendar=(()=>{
 let root=null,version=0,formState=null,savedDraft=null,baseline='',busy=false,sessionUser='',lastSync=0,syncBusy=false,noticeIds=new Set(),noticeCount=0,toast,toastTimer=0;
 const todayParts=()=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
 let year=Number(todayParts().year),month=Number(todayParts().month)-1,display=matchMedia('(max-width:700px)').matches?'agenda':'month';
 const categories={meeting:'Setkání',work:'Práce',journey:'Výprava',group:'Společná akce',other:'Jiné'},states={owner:'Organizátor',invited:'Čeká na odpověď',accepted:'Zúčastním se',maybe:'Možná',declined:'Nezúčastním se',left:'Opuštěno',revoked:'Přístup odebrán'},statuses={scheduled:'Naplánováno',cancelled:'Zrušeno',completed:'Dokončeno'},kinds={invite:'Nová pozvánka',update:'Změna akce',cancel:'Zrušená akce',complete:'Dokončená akce',rsvp:'Odpověď na pozvánku',reminder:'Připomínka akce'};
 const esc=value=>escapeHTML(value),pad=n=>String(n).padStart(2,'0'),dayKey=t=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(t*1000)).map(v=>[v.type,v.value]));return`${p.year}-${p.month}-${p.day}`;};
 const stamp=t=>new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(t*1000));
 const hour=t=>new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit'}).format(new Date(t*1000));
 const local=t=>{if(!t)return'';const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t*1000)).map(v=>[v.type,v.value]));return`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;};
 const snapshot=()=>root?.querySelector('.rp-event-form')?JSON.stringify([...new FormData(root.querySelector('.rp-event-form')).entries()]):'';
 const dirty=()=>!!formState&&!!snapshot()&&snapshot()!==baseline;
 function dispose({preserveDraft=false}={}){
  if(preserveDraft&&dirty())savedDraft={user:identity?.user.id,hash:location.hash,data:formData(),state:formState,baseline};else if(!preserveDraft)savedDraft=null;
  root=null;formState=null;baseline='';busy=false;version++;
 }
 function badges(){
  const badge=document.querySelector('.rp-calendar-badge');if(badge){badge.hidden=!noticeCount;badge.textContent=String(noticeCount);badge.setAttribute('aria-label',noticeCount+' upozornění kalendáře');}
  const counters=document.querySelector('.user-counters');if(counters){let b=counters.querySelector('.user-calendar');if(!b){b=document.createElement('span');b.className='user-calendar';counters.append(b);}b.hidden=!noticeCount;b.textContent=String(noticeCount);b.setAttribute('aria-label',noticeCount+' upozornění kalendáře');}
 }
 function clear(){sessionUser='';lastSync=0;syncBusy=false;noticeCount=0;noticeIds.clear();savedDraft=null;clearTimeout(toastTimer);toast?.remove();toast=null;badges();}
 async function sync(force=false){
  if(!identity||identity.restricted){if(sessionUser)clear();return;}
  if(sessionUser!==identity.user.id){clear();sessionUser=identity.user.id;}
  badges();if(document.hidden||syncBusy||(!force&&Date.now()-lastSync<12000))return;
  const user=sessionUser;syncBusy=true;
  try{const result=await api('/rp-calendar/notices');if(sessionUser!==user||identity?.user.id!==user||identity.restricted)return;
   const fresh=lastSync?result.notices.find(n=>!n.readAt&&!noticeIds.has(n.id)):null;noticeCount=result.unread;noticeIds=new Set(result.notices.map(n=>n.id));lastSync=Date.now();badges();
   if(fresh&&location.hash!=='#rp-calendar/notifications')showToast(fresh);
   const hash=location.hash,container=root,v=version;
   if(container&&/^#rp-calendar\/event\//.test(hash)){
    try{await api('/rp-calendar/events/'+hash.split('/')[2]);}
    catch(error){if([401,403,404].includes(error.status)&&root===container&&version===v&&identity?.user.id===user){container.querySelector('.rp-calendar-body').innerHTML='<div class="rp-calendar-empty"><h3>Akce už není dostupná.</h3><p>Organizátor ji smazal nebo odebral pozvánku.</p><a class="web-button" href="#rp-calendar">Zpět do diáře</a></div>';}}
   }
  }catch{/* Other portal features continue during migration or a transient calendar outage. */}finally{if(sessionUser===user)syncBusy=false;}
 }
 function showToast(n){
  clearTimeout(toastTimer);toast?.remove();toast=document.createElement('aside');toast.className='rp-calendar-toast';toast.setAttribute('role','status');
  toast.innerHTML='<span aria-hidden="true">◷</span><div><strong>'+esc(kinds[n.kind]||'RP kalendář')+'</strong><p>'+esc(n.title)+'</p><a href="#rp-calendar/notifications">Otevřít upozornění ↗</a></div><button type="button" aria-label="Zavřít upozornění">×</button>';
  toast.querySelector('button').onclick=()=>toast?.remove();document.body.append(toast);toastTimer=setTimeout(()=>toast?.remove(),12000);
 }
 function valid(v,user){return root?.isConnected&&version===v&&identity?.user.id===user&&!identity.restricted&&!document.hidden;}
 function message(text,error=false){const e=root?.querySelector('.rp-calendar-status');if(e){e.textContent=text;e.classList.toggle('is-error',error);}}
 function button(label,fn,cls=''){const b=document.createElement('button');b.type='button';b.className='web-button '+cls;b.textContent=label;b.onclick=fn;return b;}
 function card(e){return '<a class="rp-event-card '+(e.status!=='scheduled'?'is-inactive':'')+'" style="--event-color:'+esc(e.color)+'" href="#rp-calendar/event/'+e.id+'"><span class="rp-event-time">'+esc(hour(e.startsAt))+'</span><div><h3>'+esc(e.title)+'</h3><p>'+esc(e.location||categories[e.category])+'</p><small>'+esc(e.status==='scheduled'?(e.own?'Moje akce':states[e.myState]):statuses[e.status])+'</small></div><span aria-hidden="true">↗</span></a>';}
 function tabs(hash){return '<nav class="rp-calendar-tabs" aria-label="Výběr akcí">'+[['#rp-calendar','Vše'],['#rp-calendar/mine','Moje akce'],['#rp-calendar/invitations','Pozvánky'],['#rp-calendar/shared','Sdílené'],['#rp-calendar/notifications','Upozornění']].map(([h,l])=>'<a href="'+h+'"'+(h===hash?' aria-current="page"':'')+'>'+l+'</a>').join('')+'</nav>';}
 async function open(container,hash){
  dispose({preserveDraft:!!savedDraft});root=container;const v=++version,user=identity.user.id;
  root.innerHTML='<div class="rp-calendar-top"><div><span class="eyebrow">ČAS NA DALŠÍ PŘÍBĚH</span><h2>Tvůj RP kalendář</h2><p>Domluv si večer. Připomínku nech na Ústavu.</p></div><a class="web-button primary" href="#rp-calendar/new">＋ Přidat akci</a></div>'+tabs(hash)+'<p class="rp-calendar-status" role="status" aria-live="polite"></p><div class="rp-calendar-body"><p class="web-muted">Otevírám diář…</p></div>';
  try{
   if(hash==='#rp-calendar/new'||/^#rp-calendar\/edit\//.test(hash))await editor(hash,v,user);
   else if(/^#rp-calendar\/event\//.test(hash))await detail(hash.split('/')[2],v,user);
   else if(hash==='#rp-calendar/notifications')await notices(v,user);
   else await overview(hash,v,user);
  }catch(e){if(valid(v,user)){root.querySelector('.rp-calendar-body').innerHTML='<div class="rp-calendar-empty"><span aria-hidden="true">◷</span><h3>Diář teď nelze otevřít.</h3><p></p><a href="#rp-calendar" class="web-button">Zpět do kalendáře</a></div>';root.querySelector('.rp-calendar-empty p').textContent=e.message;}}
  if(valid(v,user))sync(true);
 }
 async function overview(hash,v,user){
  const from=Math.floor(Date.UTC(year,month,1)/1000)-86400,to=Math.floor(Date.UTC(year,month+1,1)/1000)+86400;
  const result=await api(hash==='#rp-calendar/invitations'?'/rp-calendar/invitations':'/rp-calendar/events?from='+from+'&to='+to);if(!valid(v,user))return;
  let events=result.events;if(hash.endsWith('/mine'))events=events.filter(e=>e.own);if(hash.endsWith('/shared'))events=events.filter(e=>!e.own&&e.myState!=='invited');
  const body=root.querySelector('.rp-calendar-body'),monthName=new Intl.DateTimeFormat('cs-CZ',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1))),today=todayParts(),keyToday=`${today.year}-${today.month}-${today.day}`;
  if(hash==='#rp-calendar/invitations'){body.innerHTML='<div class="rp-section-heading"><h3>Pozvánky čekají na odpověď</h3><span>'+events.length+'</span></div><div class="rp-calendar-agenda">'+(events.length?events.map(e=>'<p class="rp-agenda-date">'+esc(stamp(e.startsAt))+'</p>'+card(e)).join(''):'<div class="rp-calendar-empty"><span>✉</span><h3>Žádná pozvánka nečeká.</h3><p>Jakmile tě někdo pozve na akci, najdeš ji tady.</p></div>')+'</div>';return;}
  body.innerHTML='<div class="rp-month-controls"><div><button class="web-button rp-month-prev" type="button" aria-label="Předchozí měsíc">←</button><h3>'+esc(monthName)+'</h3><button class="web-button rp-month-next" type="button" aria-label="Další měsíc">→</button></div><div><button class="web-button rp-today" type="button">Dnes</button><button class="web-button rp-toggle-view" type="button">'+(display==='month'?'Seznam akcí':'Měsíční přehled')+'</button></div></div><div class="rp-calendar-layout"><section class="rp-calendar-sheet" aria-label="'+esc(monthName)+'"></section><aside class="rp-calendar-upcoming"><span class="eyebrow">V TOMTO MĚSÍCI</span><h3>Co tě čeká</h3><div></div><p class="rp-calendar-zone">Časy zobrazujeme v Europe/Prague.<br>Každý účastník má vlastní připomínky.</p></aside></div>';
  const sheet=body.querySelector('.rp-calendar-sheet'),days=new Date(Date.UTC(year,month+1,0)).getUTCDate(),offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
  if(display==='month'){
   sheet.innerHTML='<div class="rp-weekdays" aria-hidden="true">'+['Po','Út','St','Čt','Pá','So','Ne'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="rp-month-grid">'+Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const day=i-offset+1;if(day<1||day>days)return'<div class="rp-day is-outside" aria-hidden="true"></div>';const key=`${year}-${pad(month+1)}-${pad(day)}`,items=events.filter(e=>dayKey(e.startsAt)===key);return'<div class="rp-day '+(key===keyToday?'is-today':'')+'"><button type="button" class="rp-day-select" data-day="'+key+'" aria-label="Akce dne '+day+'. '+esc(monthName)+'"'+(key===keyToday?' aria-current="date"':'')+'>'+day+'</button>'+items.slice(0,2).map(e=>'<a class="rp-day-event" href="#rp-calendar/event/'+e.id+'" style="--event-color:'+esc(e.color)+'" title="'+esc(e.title)+'">'+esc(e.title)+'</a>').join('')+(items.length>2?'<button type="button" class="rp-day-more" data-day="'+key+'">Další '+(items.length-2)+'</button>':'')+'</div>';}).join('')+'</div><div class="rp-selected-day" hidden></div>';
   sheet.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const selection=sheet.querySelector('.rp-selected-day'),rows=events.filter(e=>dayKey(e.startsAt)===b.dataset.day);selection.hidden=false;selection.innerHTML='<h3>'+b.dataset.day.split('-').reverse().join('. ')+'</h3>'+(rows.length?rows.map(card).join(''):'<p class="web-muted">Pro tento den zatím nemáš žádnou akci.</p>');selection.append(button('Přidat akci na tento den',()=>{savedDraft={user,hash:'#rp-calendar/new',data:{startLocal:b.dataset.day+'T20:00'}};location.hash='#rp-calendar/new';}));});
  }else sheet.innerHTML='<div class="rp-calendar-agenda">'+(events.length?events.map(e=>'<p class="rp-agenda-date">'+esc(stamp(e.startsAt))+'</p>'+card(e)).join(''):'<div class="rp-calendar-empty"><span>◷</span><h3>Volné stránky.</h3><p>Přidej svou první RP akci.</p></div>')+'</div>';
  const upcoming=events.filter(e=>e.status==='scheduled'&&e.startsAt>=Date.now()/1000).slice(0,5);body.querySelector('.rp-calendar-upcoming>div').innerHTML=upcoming.length?upcoming.map(card).join(''):'<p class="web-muted">Žádné další akce v tomto měsíci.</p>';
  const shift=delta=>{const d=new Date(Date.UTC(year,month+delta,1));year=d.getUTCFullYear();month=d.getUTCMonth();open(root,hash);};body.querySelector('.rp-month-prev').onclick=()=>shift(-1);body.querySelector('.rp-month-next').onclick=()=>shift(1);body.querySelector('.rp-today').onclick=()=>{year=Number(todayParts().year);month=Number(todayParts().month)-1;open(root,hash);};body.querySelector('.rp-toggle-view').onclick=()=>{display=display==='month'?'agenda':'month';open(root,hash);};
 }
 function reminderFields(s){return '<fieldset class="rp-reminder-fields"><legend>Připomenout mi akci</legend><p>Nejvýše tři předstihy. Vlastní čas zadej v minutách, nejvýše týden.</p><label>Předstihy v minutách<input name="reminders" value="'+esc(s.reminders.join(', '))+'" placeholder="15, 60" inputmode="numeric"></label><div class="rp-reminder-presets">'+[[0,'Při začátku'],[5,'5 min'],[10,'10 min'],[15,'15 min'],[30,'30 min'],[60,'Hodina'],[1440,'Den']].map(([n,l])=>'<button type="button" data-reminder="'+n+'">'+l+'</button>').join('')+'</div><div class="rp-channel-options"><label><input type="checkbox" name="notifyWeb" '+(s.web?'checked':'')+'> Upozornění na webu</label><label><input type="checkbox" name="notifyDiscord" '+(s.discord?'checked':'')+'> Soukromá zpráva od UBD</label></div><p>Na zavřeném webu upozornění uvidíš po návratu. Discord může přijít i při vypnutém počítači, pokud máš dostupné osobní zprávy.</p></fieldset>';}
 function wireReminders(form){form.querySelectorAll('[data-reminder]').forEach(b=>b.onclick=()=>{const input=form.elements.reminders,list=input.value.split(',').map(x=>x.trim()).filter(Boolean).map(Number),n=Number(b.dataset.reminder);input.value=(list.includes(n)?list.filter(v=>v!==n):[...list,n]).join(', ');input.dispatchEvent(new Event('input',{bubbles:true}));});}
 function settingsData(form){return {reminders:form.elements.reminders.value.trim()?form.elements.reminders.value.split(',').map(v=>Number(v.trim())):[],web:form.elements.notifyWeb.checked,discord:form.elements.notifyDiscord.checked};}
 function formData(){
  const f=root.querySelector('.rp-event-form');if(!f)return null;
  const value=name=>f.elements[name].value;
  return {title:value('title'),description:value('description'),location:value('location'),privateNote:value('privateNote'),category:value('category'),color:value('color'),startLocal:value('startLocal'),endLocal:value('endLocal'),startChoice:value('startChoice'),endChoice:value('endChoice'),invitees:[...f.querySelectorAll('[name=invitee]:checked')].map(e=>e.value),...(f.elements.reminders?{settings:settingsData(f)}:{})};
 }
 async function editor(hash,v,user){
  const edit=hash.startsWith('#rp-calendar/edit/'),id=edit?hash.split('/')[2]:crypto.randomUUID(),[peopleResult,result]=await Promise.all([api('/rp-calendar/people'),edit?api('/rp-calendar/events/'+id):Promise.resolve(null)]);if(!valid(v,user))return;
  if(edit&&!result.event.own)throw Error('Akci může upravit pouze organizátor.');
  const e=result?.event,draft=savedDraft?.user===user&&savedDraft.hash===hash?savedDraft:null;
  const defaults={title:e?.title||'',description:e?.description||'',location:e?.location||'',privateNote:e?.privateNote||'',category:e?.category||'meeting',color:e?.color||'#b88b49',startLocal:local(e?.startsAt||Math.floor(Date.now()/1000)+3600),endLocal:local(e?.endsAt),startChoice:e?.startChoice||'earlier',endChoice:e?.endChoice||'earlier',invitees:result?.members.filter(m=>m.id!==user).map(m=>m.id)||[],settings:e?.settings||{reminders:[15],web:true,discord:true}},data={...defaults,...draft?.data};
  formState=draft?.state||{id,edit,revision:e?.revision||0,requestId:crypto.randomUUID()};
  const field=(name,label,max,area=false)=>'<label>'+label+(area?'<textarea name="'+name+'" maxlength="'+max+'" rows="4">'+esc(data[name])+'</textarea>':'<input name="'+name+'" maxlength="'+max+'" value="'+esc(data[name])+'"'+(name==='title'?' required':'')+'>')+'</label>';
  root.querySelector('.rp-calendar-body').innerHTML='<form class="rp-event-form"><div class="rp-form-heading"><span class="rp-calendar-seal" aria-hidden="true">◷</span><div><span class="eyebrow">'+(edit?'UPRAVIT SPOLEČNÝ PLÁN':'NOVÁ STRÁNKA V DIÁŘI')+'</span><h3>'+(edit?'Dolaď svou akci':'Na kdy si píšeme příběh?')+'</h3></div></div><div class="rp-form-columns"><section>'+field('title','Název akce',120)+'<div class="rp-form-pair"><label>Začátek · český čas<input type="datetime-local" name="startLocal" value="'+esc(data.startLocal)+'" required></label><label>Konec · volitelný<input type="datetime-local" name="endLocal" value="'+esc(data.endLocal)+'"></label></div>'+field('location','Místo setkání',200)+'<div class="rp-form-pair"><label>Kategorie<select name="category">'+Object.entries(categories).map(([k,l])=>'<option value="'+k+'"'+(data.category===k?' selected':'')+'>'+l+'</option>').join('')+'</select></label><label>Barva<input type="color" name="color" value="'+esc(data.color)+'"></label></div>'+field('description','Společný popis · uvidí pozvaní',2500,true)+'<details class="rp-time-options"><summary>Změna letního / zimního času</summary><p>Pokud se čas při přechodu na zimní opakuje, zvol jeho první nebo druhý výskyt.</p>'+['start','end'].map(k=>'<label>'+({start:'Začátek',end:'Konec'}[k])+'<select name="'+k+'Choice"><option value="earlier"'+(data[k+'Choice']==='earlier'?' selected':'')+'>První výskyt</option><option value="later"'+(data[k+'Choice']==='later'?' selected':'')+'>Druhý výskyt</option></select></label>').join('')+'</details></section><aside><fieldset class="rp-invite-picker"><legend>Pozvat hráče</legend><p>Sdílíš pouze tuto akci. Ostatní události zůstávají tvoje.</p>'+peopleResult.people.map(p=>'<label><input type="checkbox" name="invitee" value="'+p.id+'"'+(data.invitees.includes(p.id)?' checked':'')+'><img src="'+esc(p.avatar||mediaURL('icon-'+p.character+'.png',160))+'" alt="" width="34" height="34"><span>'+esc(p.name)+'</span></label>').join('')+'</fieldset><div class="rp-private-note">'+field('privateNote','Soukromá poznámka · jen pro tebe',2500,true)+'</div>'+(!edit?reminderFields(data.settings):'<p class="web-muted">Vlastní připomínky nastavíš v detailu akce. Pozvaní si nastavují svoje.</p>')+'</aside></div><div class="rp-form-actions"><button class="web-button primary" type="submit">'+(edit?'Uložit změny':'Vytvořit akci a odeslat pozvánky')+'</button><a class="web-button" href="#rp-calendar'+(edit?'/event/'+id:'')+'">Zpět</a></div><p class="rp-form-status" role="status"></p></form>';
  const form=root.querySelector('form');if(!edit)wireReminders(form);baseline=draft?.baseline||snapshot();savedDraft=null;
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;busy=true;form.querySelector('[type=submit]').disabled=true;form.querySelector('.rp-form-status').textContent='Ukládám akci…';
   try{const input={...formData(),id:formState.id,revision:formState.revision,requestId:formState.requestId};const out=await api('/rp-calendar/events'+(edit?'/'+id:''),{method:edit?'PUT':'POST',body:JSON.stringify(input)});if(!valid(v,user))return;baseline=snapshot();formState=null;savedDraft=null;location.hash='#rp-calendar/event/'+(out.id||id);sync(true);
   }catch(e){if(valid(v,user))form.querySelector('.rp-form-status').textContent=e.message;}finally{if(valid(v,user)){busy=false;form.querySelector('[type=submit]').disabled=false;}}
  };
 }
 async function detail(id,v,user){
  const result=await api('/rp-calendar/events/'+id);if(!valid(v,user))return;const e=result.event,members=result.members;
  root.querySelector('.rp-calendar-body').innerHTML='<article class="rp-event-detail" style="--event-color:'+esc(e.color)+'"><header><span class="eyebrow">'+esc(categories[e.category])+' · '+esc(statuses[e.status])+'</span><h3>'+esc(e.title)+'</h3><p class="rp-detail-date">'+esc(stamp(e.startsAt))+(e.endsAt?' — '+esc(stamp(e.endsAt)):'')+'</p><p>'+esc(e.location||'Místo zatím není uvedené')+'</p></header><div class="rp-detail-columns"><section><h4>O akci</h4><p class="rp-preserve-lines">'+esc(e.description||'Podrobnosti doplní organizátor.')+'</p><h4>Kdo má pozvánku</h4><ul class="rp-member-list">'+members.map(m=>'<li><span>'+esc(m.name)+'</span><b>'+esc(states[m.state])+'</b></li>').join('')+'</ul>'+(e.own&&e.privateNote?'<aside class="rp-private-note"><span class="eyebrow">JEN TVOJE OČI</span><p class="rp-preserve-lines">'+esc(e.privateNote)+'</p></aside>':'')+'<div class="rp-event-actions"></div></section><aside class="rp-personal-settings"></aside></div></article>';
  const actions=root.querySelector('.rp-event-actions');
  const mutate=async(action,body,method='POST')=>{if(busy)return;busy=true;actions.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('/rp-calendar/events/'+id+(action?'/'+action:''),{method,body:JSON.stringify(body)});if(valid(v,user)){sync(true);if(action==='leave'||method==='DELETE')location.hash='#rp-calendar';else open(root,location.hash);}}catch(error){if(valid(v,user)){message(error.message,true);busy=false;actions.querySelectorAll('button').forEach(b=>b.disabled=false);}}};
  if(!e.own&&e.status==='scheduled')for(const[state,label]of [['accepted','Zúčastním se'],['maybe','Možná'],['declined','Nezúčastním se']]){const b=button(label,()=>mutate('respond',{state,revision:e.settings.revision}),state===e.myState?'primary':'');b.setAttribute('aria-pressed',String(state===e.myState));actions.append(b);}
  if(e.own){if(e.status==='scheduled'){const edit=document.createElement('a');edit.className='web-button primary';edit.href='#rp-calendar/edit/'+id;edit.textContent='Upravit akci a pozvané';actions.append(edit);actions.append(button('Dokončeno',async()=>{if(await PortalPolish.confirm('Označit akci jako dokončenou?','Další připomínky se zastaví.','Dokončit'))mutate('complete',{revision:e.revision});}));actions.append(button('Zrušit akci',async()=>{if(await PortalPolish.confirm('Zrušit tuto RP akci?','Pozvaní uvidí zrušení. Všechny další připomínky se zastaví.','Zrušit akci'))mutate('cancel',{revision:e.revision});},'subtle'));}
   actions.append(button('Smazat',async()=>{if(await PortalPolish.confirm('Smazat akci z kalendáře?','Zápis zmizí všem účastníkům a soukromé poznámky se odstraní. Pozvaní dostanou zprávu o zrušení.','Smazat'))mutate('',{revision:e.revision},'DELETE');},'subtle'));
  }else actions.append(button('Opustit akci',async()=>{if(await PortalPolish.confirm('Opustit tuto akci?','Akce zmizí z tvého kalendáře a připomínky se zastaví.','Opustit'))mutate('leave',{});},'subtle'));
  if(e.status==='scheduled'){
   const settings=root.querySelector('.rp-personal-settings');settings.innerHTML='<form class="rp-settings-form">'+reminderFields(e.settings)+'<button type="submit" class="web-button">Uložit moje připomínky</button><p class="rp-settings-status" role="status"></p></form>';const form=settings.querySelector('form');wireReminders(form);
   form.onsubmit=async event=>{event.preventDefault();const b=form.querySelector('[type=submit]');b.disabled=true;try{await api('/rp-calendar/events/'+id+'/settings',{method:'PUT',body:JSON.stringify({...settingsData(form),revision:e.settings.revision})});if(valid(v,user)){await open(root,location.hash);message('Tvoje připomínky jsou uložené. Ostatním se nastavení nezměnilo.');}}catch(error){if(valid(v,user))form.querySelector('.rp-settings-status').textContent=error.message;}finally{if(valid(v,user))b.disabled=false;}};
  }
 }
 async function notices(v,user){
  const result=await api('/rp-calendar/notices');if(!valid(v,user))return;
  root.querySelector('.rp-calendar-body').innerHTML='<div class="rp-section-heading"><h3>Co ti diář připomíná</h3><button type="button" class="web-button rp-notices-read">Vše přečtené</button></div><div class="rp-notice-list">'+(result.notices.length?result.notices.map(n=>'<article class="rp-notice '+(!n.readAt?'is-unread':'')+'"><div><span class="eyebrow">'+esc(kinds[n.kind]||'RP kalendář')+'</span><h3>'+esc(n.title)+'</h3><p>'+esc(stamp(n.createdAt))+'</p><small>'+esc(({delivered:'Discord: doručeno',failed:'Discord: nedoručeno',uncertain:'Discord: doručení nepotvrzené',pending:'Discord: čeká na doručení',skipped:'Discord: upozornění už není potřeba',off:'Pouze web'})[n.delivery]||'')+'</small></div><div>'+(n.eventId?'<a class="web-button" href="#rp-calendar/event/'+n.eventId+'">Otevřít akci ↗</a>':'')+(!n.readAt?'<button type="button" class="web-button subtle" data-read="'+esc(n.id)+'">Přečteno</button>':'')+'</div></article>').join(''):'<div class="rp-calendar-empty"><span>✉</span><h3>Všechno v klidu.</h3><p>Pozvánky, změny a připomínky najdeš na tomto místě.</p></div>')+'</div>';
  const read=async id=>{try{await api('/rp-calendar/notices/read',{method:'POST',body:JSON.stringify(id?{id}:{})});if(valid(v,user)){await sync(true);open(root,location.hash);}}catch(e){if(valid(v,user))message(e.message,true);}};
  root.querySelector('.rp-notices-read').onclick=()=>read();root.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>read(b.dataset.read));
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(toastTimer);toast?.remove();}else sync();});
 return {open,dispose,sync,badges,clear,get dirty(){return dirty();},get pendingDraft(){return !!savedDraft;}};
})();

// Administrative preview only. No public atmosphere or account preference is changed.
const WeatherSurface=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function mount(stage){
  const canvas=document.createElement('canvas');canvas.className='weather-surface';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
  const ctx=canvas.getContext('2d'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let dead=false,visible=true,frame=0,resizeFrame=0,last=0,w=1,h=1,edges=[],caps=[],particles=[],gusts=[],mode='off',level=45,simple=false,interact=true,accumulate=true,falling=true,blown=0,seeded=false;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const dynamic=()=>!simple&&!motion.matches;
  function particle(initial=false){const size=mode==='autumn'?7+Math.random()*5:1+Math.random()*2;return{x:Math.random()*w,y:initial?Math.random()*h:-20-Math.random()*h*.15,vx:mode==='rain'?-65:Math.random()*12-6,vy:mode==='rain'?400+Math.random()*220:mode==='autumn'?20+Math.random()*18:23+Math.random()*25,size,angle:Math.random()*6,rest:null};}
  function refill(){const count=mode==='off'||!falling?0:mode==='rain'?Math.round(20+level*.5):mode==='winter'?Math.round(18+level*.6):mode==='autumn'?Math.round(5+level*.11):Math.round(5+level*.06);particles=Array.from({length:Math.min(count,w<600?32:85)},()=>particle(true));if(mode==='autumn'&&accumulate)particles.slice(0,3).forEach((p,i)=>{const e=edges[(i+1)%edges.length];if(e){p.x=e.x+e.width*.6;p.y=e.y;p.angle=i*.6;p.rest={edge:e.key,offset:e.width*.6};}});gusts=[];}
  function collect(){
   if(dead||!stage.isConnected)return;const box=stage.getBoundingClientRect();w=Math.max(1,box.width);h=Math.max(1,box.height);const ratio=Math.min(devicePixelRatio||1,1.4,1600/w,Math.sqrt(2000000/(w*h)));
   canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));ctx.setTransform(ratio,0,0,ratio,0,0);
   const previous=new Map(caps.map(c=>[c.key,c]));edges=[];
   stage.querySelectorAll('[data-weather-surface]').forEach((el,i)=>{
    const r=el.getBoundingClientRect();if(r.width<5||r.height<5)return;
    if(el.dataset.weatherSurface==='word'&&el.firstChild?.nodeType===Node.TEXT_NODE){
     const style=getComputedStyle(el);ctx.font=style.fontStyle+' '+style.fontWeight+' '+style.fontSize+' '+style.fontFamily;const metrics=ctx.measureText(el.textContent),ascent=metrics.fontBoundingBoxAscent||parseFloat(style.fontSize)*.8,descent=metrics.fontBoundingBoxDescent||parseFloat(style.fontSize)*.2,baseline=r.top-box.top+(parseFloat(style.lineHeight)-ascent-descent)/2+ascent;
     let offset=0;for(const char of el.textContent){const range=document.createRange();range.setStart(el.firstChild,offset);range.setEnd(el.firstChild,offset+char.length);const letter=range.getBoundingClientRect(),ink=ctx.measureText(char);offset+=char.length;if(char.trim()&&letter.width>3)edges.push({key:i+':'+offset,x:letter.left-box.left+letter.width*.18,y:baseline-ink.actualBoundingBoxAscent+1,width:letter.width*.64,word:true});}
    }else edges.push({key:i,x:r.left-box.left+2,y:r.top-box.top+2,width:r.width-4});
   });
   caps=[];for(const edge of edges){const count=Math.max(3,Math.ceil(edge.width/8));for(let i=0;i<count;i++){const key=edge.key+':'+i;caps.push({key,x:edge.x+i*edge.width/(count-1),y:edge.y,radius:edge.word?Math.min(3,edge.width/3):6,mass:previous.get(key)?.mass||(seeded?0:1.5+Math.random()*2)});}}
   seeded=true;refill();draw(performance.now(),0);schedule();
  }
  function leaf(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=['#ad642e','#cc914a','#bd783d'][Math.floor(p.size)%3];ctx.beginPath();ctx.moveTo(0,-p.size);ctx.bezierCurveTo(p.size*1.1,-p.size*.5,p.size,p.size,0,p.size);ctx.bezierCurveTo(-p.size,p.size,-p.size,-p.size*.4,0,-p.size);ctx.fill();ctx.strokeStyle='#654329';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-p.size*.7);ctx.lineTo(0,p.size*1.2);ctx.stroke();ctx.restore();}
  function draw(t,dt){
   if(dead)return;ctx.clearRect(0,0,w,h);if(mode==='off')return;
   if(mode==='winter'&&accumulate){
    for(const c of caps){if(dt&&dynamic())c.mass=Math.min(4.8,c.mass+dt*.035*level/45);if(c.mass<.2)continue;ctx.fillStyle='#d0e0e6';ctx.beginPath();ctx.ellipse(c.x,c.y,c.radius,c.mass+1,0,Math.PI,2*Math.PI);ctx.fill();ctx.fillStyle='#f3f7f6';ctx.beginPath();ctx.ellipse(c.x,c.y-1,c.radius*.85,c.mass,0,Math.PI,2*Math.PI);ctx.fill();}
   }
   if(mode==='rain'){
    ctx.strokeStyle='rgba(201,220,230,.29)';ctx.lineWidth=.7;ctx.beginPath();
    for(const p of particles){if(dt){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>h+30||p.x<-30)Object.assign(p,particle());}ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-3,p.y+13+p.size*2);}ctx.stroke();
    // Small beads stay at the outside edge; never cover the reading area.
    ctx.fillStyle='rgba(212,226,234,.3)';for(let i=0;i<5;i++){const y=(h*(i+.3)/5+t*.015)%h;ctx.beginPath();ctx.ellipse(i%2? w-5:5,y,1.5,4,0,0,Math.PI*2);ctx.fill();}
   }else for(const p of particles){
    if(dt){
     if(p.rest){const edge=edges.find(e=>e.key===p.rest.edge);if(edge){p.x=edge.x+p.rest.offset;p.y=edge.y-p.size*.2;}else Object.assign(p,particle());}
     else{const old=p.y;p.x+=(p.vx+Math.sin(t*.0006+p.angle)*9)*dt;p.y+=p.vy*dt;p.angle+=dt*.3;
      if(accumulate&&['autumn','winter'].includes(mode)){const hit=edges.find(e=>p.x>=e.x&&p.x<=e.x+e.width&&old<=e.y&&p.y>=e.y);if(hit){if(mode==='autumn'){p.rest={edge:hit.key,offset:p.x-hit.x};p.y=hit.y;}else{const cap=caps.reduce((best,c)=>Math.abs(c.x-p.x)+Math.abs(c.y-hit.y)<Math.abs(best.x-p.x)+Math.abs(best.y-hit.y)?c:best,caps[0]);if(cap)cap.mass=Math.min(4.8,cap.mass+.5);Object.assign(p,particle());}}}
      if(p.y>h+25||p.x>w+40||p.x<-40)Object.assign(p,particle());
     }
    }
    if(mode==='autumn')leaf(p);else{ctx.fillStyle=mode==='winter'?'rgba(236,243,247,.65)':mode==='spring'?'rgba(195,218,170,.6)':'rgba(240,207,132,.55)';ctx.beginPath();ctx.ellipse(p.x,p.y,p.size,mode==='spring'?p.size*.45:p.size,0,0,Math.PI*2);ctx.fill();}
   }
   gusts=gusts.filter(p=>p.life>0);for(const p of gusts){if(dt){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*22;p.angle+=dt*3;}ctx.globalAlpha=Math.max(0,p.life/1.3);if(p.leaf)leaf(p);else{ctx.fillStyle='#e6f0f4';ctx.fillRect(p.x,p.y,1.5,1.5);}ctx.globalAlpha=1;}
  }
  function schedule(){if(dead||frame||document.hidden||!visible||!dynamic()||mode==='off')return;frame=requestAnimationFrame(t=>{frame=0;if(last&&t-last<33){schedule();return;}const dt=last?Math.min(.05,(t-last)/1000):0;last=t;draw(t,dt);schedule();});}
  let pointer=null;
  function blow(event){
   if(!interact||!accumulate||!dynamic()||!['autumn','winter'].includes(mode)||document.hidden)return;const box=stage.getBoundingClientRect(),x=event.clientX-box.left,y=event.clientY-box.top,now=performance.now();if(pointer&&now-pointer.t<25)return;
   const vx=pointer?clamp((x-pointer.x)/Math.max(16,now-pointer.t)*180,-180,180):65;pointer={x,y,t:now};const radius=event.pointerType==='touch'?42:34;let affected=false;
   for(const c of caps){if(mode!=='winter'||c.mass<.4||Math.hypot(c.x-x,c.y-y)>radius)continue;affected=true;for(let i=0;i<2&&gusts.length<48;i++)gusts.push({x:c.x,y:c.y,vx:vx+Math.random()*50-25,vy:-35-Math.random()*25,size:1,angle:0,life:1.3});c.mass=0;}
   for(const p of particles){if(mode!=='autumn'||!p.rest||Math.hypot(p.x-x,p.y-y)>radius)continue;affected=true;if(gusts.length<48)gusts.push({...p,leaf:true,vx:vx+Math.random()*50-25,vy:-40-Math.random()*35,life:1.3});Object.assign(p,particle());}
   if(affected){blown++;stage.dataset.gusts=String(blown);}schedule();
  }
  const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(collect);};
  const visibility=()=>{if(document.hidden)stop();else{draw(performance.now(),0);schedule();}};
  const reduced=()=>{stop();stage.classList.toggle('weather-motion-reduced',!dynamic());draw(performance.now(),0);schedule();};
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else stop();});intersection.observe(stage);
  const observer=new ResizeObserver(resize);observer.observe(stage);stage.addEventListener('pointermove',blow,{passive:true});stage.addEventListener('pointerdown',blow,{passive:true});document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduced);document.fonts.ready.then(()=>{if(!dead)resize();});collect();
  return{configure(next){mode=next.mode;level=clamp(next.strength,10,100);simple=!!next.simple;interact=next.interactive!==false;accumulate=next.caps!==false;falling=next.falling!==false;stage.dataset.weather=mode;stage.classList.toggle('weather-motion-reduced',!dynamic());stop();refill();draw(performance.now(),0);schedule();},reset(){seeded=false;caps=[];collect();},dispose(){dead=true;stop();cancelAnimationFrame(resizeFrame);observer.disconnect();intersection.disconnect();stage.removeEventListener('pointermove',blow);stage.removeEventListener('pointerdown',blow);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduced);canvas.remove();particles=[];caps=[];edges=[];gusts=[];},get running(){return !!frame;},get stats(){return{mode,particles:particles.length,surfaces:edges.length,settled:particles.filter(p=>p.rest).length,snow:accumulate?caps.reduce((n,c)=>n+c.mass,0):0,blown,running:!!frame};}};
 }
 return{mount};
})();

const WeatherStudio=(()=>{
 let host=null,stage=null,surface=null,version=0,mode='winter',strength=45,city=null,currentWeather=null,weatherAt=0,weatherCache=new Map(),timer=0,searchTimer=0,fetchController=null,searchController=null,searchVersion=0,weatherVersion=0,source='manual',sound=null;
 const esc=s=>escapeHTML(s),modes={spring:'Jaro',summer:'Léto',autumn:'Podzim',winter:'Zima',rain:'Déšť',off:'Vypnuto'};
 const now=()=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',month:'numeric',day:'numeric'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
 function festiveDate(){const p=now();return Number(p.month)===12&&Number(p.day)>=20&&Number(p.day)<=27;}
 const season=()=>{const m=Number(now().month);return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';};
 function dressPine(){
  const wreath=stage.querySelector('.weather-wreath');wreath.replaceChildren();
  const svg=(name,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  wreath.append(svg('circle',{cx:100,cy:100,r:87,fill:'none',stroke:'#263f2f','stroke-width':10}));
  for(let i=0;i<38;i++){const a=i*Math.PI*2/38,g=svg('g',{transform:'translate('+(100+87*Math.cos(a))+','+(100+87*Math.sin(a))+') rotate('+(a*180/Math.PI+35)+')'});g.append(svg('path',{d:'M0 10Q6 0 0 -14M1 -9L-5 -15M2 -6L9 -13M3 -3L-5 -9M3 0L11 -6M2 3L-6 -4M1 6L8 1',fill:'none',stroke:i%3?'#3c5d40':'#68734b','stroke-width':1.3,'stroke-linecap':'round'}));if(i%7===0)g.append(svg('circle',{cx:0,cy:0,r:2.6,fill:i%2?'#c3a46c':'#974b3c'}));wreath.append(g);}
  wreath.append(svg('path',{d:'M92 182Q52 150 72 184L100 177Q148 146 127 184Z',fill:'#913f35'}));
  const garland=svg('svg',{viewBox:'0 0 1000 40',preserveAspectRatio:'none','aria-hidden':'true',class:'weather-pine-needles'});garland.append(svg('path',{d:'M0 9Q250 20 500 9T1000 9',fill:'none',stroke:'#304632','stroke-width':12}));
  for(let i=0;i<65;i++)garland.append(svg('path',{d:'M0 0L14 8M4 2L1 12M6 3L10 -5M9 5L7 15M11 6L16 -2',transform:'translate('+(i*16)+',8) rotate('+(i%2?8:-15)+')',fill:'none',stroke:i%3?'#486242':'#78805a','stroke-width':1.1,'stroke-linecap':'round'}));stage.querySelector('.weather-pine-garland').prepend(garland);
 }
 const state=()=>({mode,strength,simple:!!host?.querySelector('[name=simple]')?.checked,interactive:!!host?.querySelector('[name=interactive]')?.checked});
 function dispose(){version++;weatherVersion++;searchVersion++;clearTimeout(timer);clearTimeout(searchTimer);fetchController?.abort();searchController?.abort();surface?.dispose();surface=null;host=null;stage=null;city=null;currentWeather=null;weatherAt=0;weatherCache.clear();sound?.close().catch(()=>{});sound=null;}
 function valid(v){return v===version&&host?.isConnected&&!!identity?.admin?.owner&&!identity.restricted;}
 function status(text){const e=host?.querySelector('.weather-status');if(e)e.textContent=text;}
 function storageKey(){return 'nh-weather-studio:'+identity.user.id;}
 function save(){try{localStorage.setItem(storageKey(),JSON.stringify({source,mode:host.querySelector('[name=mode]').value,strength,city,...Object.fromEntries(['interactive','simple','garland','wreath','caps','ribbons','christmas','snow','sounds'].map(k=>[k,host.querySelector('[name='+k+']').checked]))}));}catch{}}
 function render(){
  if(!stage)return;const christmas=host.querySelector('[name=christmas]').checked,automatic=source==='season';
  stage.dataset.christmas=String(christmas||(automatic&&festiveDate()));
  stage.dataset.garland=String(host.querySelector('[name=garland]').checked);stage.dataset.wreath=String(host.querySelector('[name=wreath]').checked);stage.dataset.ribbons=String(host.querySelector('[name=ribbons]').checked);
  stage.dataset.caps=String(host.querySelector('[name=caps]').checked);
  const festive=stage.dataset.christmas==='true',selected=source==='season'?season():mode;
  surface.configure({...state(),caps:host.querySelector('[name=caps]').checked,falling:!festive||selected!=='winter'||host.querySelector('[name=snow]').checked,mode:selected});
  stage.querySelector('.weather-greeting').textContent=festive?'Klidný vánoční večer, '+identity.user.name+'.':selected==='autumn'?'Za okny padá listí. Příběh pokračuje.':selected==='rain'?'Venku prší. Uvnitř čeká tvůj příběh.':'Šest osudů. Jeden horizont.';
  host.querySelector('.weather-mode-label').textContent=festive?'Vánoční náhled':modes[selected];stage.classList.toggle('weather-no-caps',!host.querySelector('[name=caps]').checked);stage.classList.toggle('weather-no-snow',!host.querySelector('[name=snow]').checked);
  // Decoration and animation remain scoped to the demo, never to the live portal.
  host.querySelector('.weather-source-note').textContent=source==='city'?(city?'Počasí: '+city.name+' · '+(currentWeather||'čekáme na údaje')+(weatherAt?' · ověřeno '+new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit'}).format(new Date(weatherAt)):''):'Vyber město nebo dobrovolně použij polohu.'):'Náhled používá '+(source==='season'?'aktuální roční období.':'ručně zvolenou atmosféru.');
  save();
 }
 function weatherType(code){return [71,73,75,77,85,86].includes(code)?'winter':[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)?'rain':'off';}
 function useCity(next){city=next;source='city';mode='off';currentWeather=null;weatherAt=0;host.querySelector('[name=source]').value=source;host.querySelector('[name=christmas]').checked=false;render();weather();}
 async function weather(){
  clearTimeout(timer);if(source!=='city'||!city||document.hidden||!host)return;const v=version,wv=++weatherVersion,chosen=city,key=chosen.latitude+','+chosen.longitude,cached=weatherCache.get(key);fetchController?.abort();fetchController=new AbortController();
  const controller=fetchController,timeout=setTimeout(()=>controller.abort(),8000);
  try{
   let data=cached&&Date.now()-cached.at<15*60000?cached:null;
   if(!data){const params=new URLSearchParams({latitude:chosen.latitude,longitude:chosen.longitude,current:'weather_code,precipitation',timezone:'Europe/Prague'}),r=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error('Počasí je dočasně nedostupné.');const raw=await r.json();if(!Number.isInteger(raw.current?.weather_code))throw Error('Neplatná odpověď počasí.');data={mode:weatherType(raw.current.weather_code),at:Date.now()};weatherCache.set(key,data);}
   if(!valid(v)||wv!==weatherVersion||source!=='city')return;mode=data.mode;weatherAt=data.at;currentWeather=mode==='rain'?'déšť / srážky':mode==='winter'?'sněžení':'bez srážek';status('Modelové počasí pro vybranou oblast; nejde o okamžitý detektor deště.');render();
  }catch(error){if(valid(v)&&wv===weatherVersion&&source==='city'&&!document.hidden){mode='off';weatherAt=0;currentWeather='údaje nejsou dostupné';render();status('Počasí nelze načíst. Náhled srážek je vypnutý; můžeš zvolit ruční režim.');}}
  finally{clearTimeout(timeout);if(valid(v)&&wv===weatherVersion&&source==='city'&&!document.hidden)timer=setTimeout(weather,15*60000);}
 }
 async function search(query){
  if(!host)return;const v=version,sv=++searchVersion;searchController?.abort();const results=host.querySelector('.weather-city-results');results.replaceChildren();if(query.trim().length<2)return;
  searchController=new AbortController();const controller=searchController,timeout=setTimeout(()=>controller.abort(),8000);status('Hledám město…');
  try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:query.trim().slice(0,80),count:6,language:'cs',format:'json'}),{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error();const data=await r.json();if(!valid(v)||sv!==searchVersion)return;for(const result of data.results||[]){if(!Number.isFinite(result.latitude)||!Number.isFinite(result.longitude))continue;const b=document.createElement('button');b.type='button';b.className='web-button';b.textContent=[result.name,result.admin1,result.country].filter(Boolean).join(' · ');b.onclick=()=>{results.replaceChildren();useCity({name:b.textContent,latitude:Number(result.latitude.toFixed(2)),longitude:Number(result.longitude.toFixed(2))});};results.append(b);}status(results.children.length?'Vyber město z výsledků.':'Město se nepodařilo najít. Zkus jiný název.');}
  catch{if(valid(v)&&sv===searchVersion)status('Města teď nelze načíst. Ruční náhled funguje dál.');}finally{clearTimeout(timeout);}
 }
 function locate(){
  if(!navigator.geolocation){status('Prohlížeč polohu nepodporuje. Použij vyhledání města.');return;}const v=version;status('Polohu použijeme pouze po tvém souhlasu.');
  navigator.geolocation.getCurrentPosition(p=>{if(!valid(v))return;useCity({name:'Moje přibližná poloha',latitude:Number(p.coords.latitude.toFixed(2)),longitude:Number(p.coords.longitude.toFixed(2))});},()=>{if(valid(v))status('Poloha není dostupná nebo nebyla povolena. Můžeš zadat město ručně.');},{enableHighAccuracy:false,timeout:10000,maximumAge:15*60000});
 }
 function chime(){
  if(!host?.querySelector('[name=sounds]').checked||host.querySelector('[name=simple]').checked||matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return; sound??=new Audio();sound.resume();const t=sound.currentTime;for(const [i,f]of [1318,1760,2093].entries()){const o=sound.createOscillator(),g=sound.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.016,t+i*.07+.01);g.gain.exponentialRampToValueAtTime(.0001,t+i*.07+.6);o.connect(g);g.connect(sound.destination);o.start(t+i*.07);o.stop(t+i*.07+.65);}}catch{}
 }
 async function open(container){
  dispose();if(!identity?.admin?.owner||identity.restricted)return;host=container;const v=version;mode='winter';strength=45;source='manual';
  host.innerHTML='<section class="weather-studio"><div class="weather-heading"><div><span class="eyebrow">ZKUŠEBNÍ PRACOVNA · JEN PRO TEBE</span><h2>Pod stejným nebem.</h2><p>Počasí, které se dotkne kroniky. Ostatním hráčům se zatím nic nemění.</p></div><span class="status-pill weather-mode-label">Zima</span></div><div class="weather-layout"><aside class="weather-settings"><h3>Atmosféra</h3><label>Zdroj počasí<select name="source"><option value="manual">Ruční náhled</option><option value="season">Podle ročního období</option><option value="city">Podle města / polohy</option></select></label><label>Vyzkoušet období<select name="mode">'+Object.entries(modes).map(([k,n])=>'<option value="'+k+'"'+(k==='winter'?' selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Intenzita <output>45 %</output><input name="strength" type="range" min="10" max="100" value="45"></label><label class="weather-check"><input name="interactive" type="checkbox" checked> Rozfoukání myší / dotykem</label><label class="weather-check"><input name="simple" type="checkbox"> Klidný vzhled bez pohybu</label><div class="weather-city"><label>Město<input name="city" type="search" maxlength="80" placeholder="Například Praha" autocomplete="off"></label><button class="web-button weather-locate" type="button">Použít moji polohu</button><div class="weather-city-results"></div><small>Počasí se ověřuje nejvýše jednou za 15 minut. Souřadnice zaokrouhlíme; nic neukládáme na náš server.</small><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Počasí a geokódování: Open‑Meteo ↗</a></div><h3>Vánoce · 20.–27. prosince</h3>'+[['christmas','Zapnout vánoční náhled',true],['garland','Jehličí a teplá světýlka',true],['wreath','Věnec kolem loga',true],['ribbons','Stuhy a ozdoby',true],['caps','Usazování na nadpisech a kartách',true],['snow','Vánoční sněžení',true],['sounds','Jemné rolničky při kliknutí',false]].map(([name,label,on])=>'<label class="weather-check"><input type="checkbox" name="'+name+'"'+(on?' checked':'')+'> '+label+'</label>').join('')+'<button type="button" class="web-button weather-reset">Obnovit sníh / listí</button><button type="button" class="web-button weather-stop">Vypnout celý náhled</button><p class="weather-performance">Efekty se zastaví ve skryté kartě i mimo obrazovku. Volba omezeného pohybu má přednost.</p></aside><div class="weather-preview-column"><p class="weather-source-note"></p><section class="weather-demo" data-weather="winter" data-christmas="true" aria-label="Zkušební náhled počasí a vánoční výzdoby"><div class="weather-demo-background" aria-hidden="true"></div><div class="weather-pine-garland" aria-hidden="true">'+Array.from({length:10},(_,i)=>'<i style="--n:'+i+'"></i>').join('')+'<b class="weather-bow"></b></div><div class="weather-demo-content"><span class="eyebrow">MISSOURI & THE FRONTIER · 1897</span><div class="weather-logo-wrap"><img src="'+mediaURL('NH.png',320)+'" width="170" height="175" alt="New Horizon RP"><svg class="weather-wreath" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="89"/><circle cx="100" cy="100" r="85"/><path d="M92 182Q52 150 72 184L100 177Q148 146 127 184Z"/></svg><span class="weather-logo-ribbon" aria-hidden="true">✦</span></div><p class="weather-greeting"></p><h3 class="weather-demo-title">'+['Každý','příběh','začíná','rozhodnutím.'].map(w=>'<span data-weather-surface="word">'+w+'</span>').join(' ')+'</h3><button type="button" class="web-button weather-demo-open">Otevřít můj archiv ↗</button><p class="weather-click-feedback" role="status"></p><div class="weather-demo-cards"><button type="button" class="weather-demo-card" data-weather-surface="edge"><span aria-hidden="true">▤</span><strong>Můj deník</strong><small>Myšlenky z našich cest.</small></button><button type="button" class="weather-demo-card" data-weather-surface="edge"><span aria-hidden="true">▦</span><strong>RP kalendář</strong><small>Čas na společný příběh.</small></button></div><p class="weather-demo-hint">Přejeď přes sníh nebo listí. Na telefonu se dotkni hrany.</p></div></section><p class="weather-status" role="status" aria-live="polite"></p></div></div></section>';
  stage=host.querySelector('.weather-demo');dressPine();surface=WeatherSurface.mount(stage);
  let saved=null;try{saved=JSON.parse(localStorage.getItem(storageKey()));}catch{}
  if(saved){for(const name of ['interactive','simple','garland','wreath','caps','ribbons','christmas','snow'])if(typeof saved[name]==='boolean')host.querySelector('[name='+name+']').checked=saved[name];if(Object.hasOwn(modes,saved.mode))host.querySelector('[name=mode]').value=mode=saved.mode;if(['manual','season','city'].includes(saved.source))host.querySelector('[name=source]').value=source=saved.source;strength=Math.min(100,Math.max(10,Number(saved.strength)||45));host.querySelector('[name=strength]').value=strength;host.querySelector('output').textContent=strength+' %';if(saved.city&&typeof saved.city.name==='string'&&saved.city.name.length<=250&&Number.isFinite(saved.city.latitude)&&Math.abs(saved.city.latitude)<=90&&Number.isFinite(saved.city.longitude)&&Math.abs(saved.city.longitude)<=180)city=saved.city;}
  for(const name of ['interactive','simple','garland','wreath','caps','ribbons','christmas','snow','sounds'])host.querySelector('[name='+name+']').onchange=render;
  host.querySelector('[name=mode]').onchange=e=>{source='manual';host.querySelector('[name=source]').value=source;mode=e.target.value;if(mode!=='winter')host.querySelector('[name=christmas]').checked=false;weatherVersion++;clearTimeout(timer);fetchController?.abort();render();};
  host.querySelector('[name=christmas]').onchange=e=>{if(e.target.checked){source='manual';mode='winter';host.querySelector('[name=source]').value=source;host.querySelector('[name=mode]').value=mode;weatherVersion++;clearTimeout(timer);fetchController?.abort();}render();};
  host.querySelector('[name=source]').onchange=e=>{source=e.target.value;weatherVersion++;clearTimeout(timer);fetchController?.abort();mode=source==='city'?'off':host.querySelector('[name=mode]').value;if(source!=='manual'||mode!=='winter')host.querySelector('[name=christmas]').checked=false;if(source==='city'&&city)weather();render();};
  host.querySelector('[name=strength]').oninput=e=>{strength=Number(e.target.value);host.querySelector('output').textContent=strength+' %';render();};
  host.querySelector('[name=city]').oninput=e=>{clearTimeout(searchTimer);searchVersion++;searchController?.abort();const q=e.target.value;searchTimer=setTimeout(()=>{if(valid(v))search(q);},450);};
  host.querySelector('.weather-locate').onclick=locate;host.querySelector('.weather-reset').onclick=()=>surface.reset();host.querySelector('.weather-stop').onclick=()=>{weatherVersion++;clearTimeout(timer);fetchController?.abort();source='manual';mode='off';host.querySelector('[name=source]').value=source;host.querySelector('[name=mode]').value=mode;host.querySelector('[name=christmas]').checked=false;host.querySelector('[name=sounds]').checked=false;sound?.suspend();render();};
  host.querySelectorAll('.weather-demo button').forEach(b=>b.onclick=()=>{stage.querySelector('.weather-click-feedback').textContent='Tlačítko funguje — výzdoba nebrání ovládání.';chime();});
  if(source==='manual'&&mode!=='winter'||source==='city')host.querySelector('[name=christmas]').checked=false;
  render();if(source==='city'&&city)weather();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);fetchController?.abort();sound?.suspend();}else if(host&&source==='city')weather();});
 return{open,dispose,weatherType,festiveDate,get stats(){return surface?.stats||null;}};
})();

const Community=(()=>{
 let page,nav,generation=0,loadedHash='',view='',editorState=null,suspended=null;
 const labels={given:'Jméno',surname:'Příjmení',nickname:'Přezdívka',age:'Věk v lore',birth:'Datum narození',occupation:'Povolání',relatives:'Rodina a blízcí',kicker:'Motto',description:'Úvodní charakteristika',quote:'Osobní citát',closing:'Závěrečná slova',origin:'Původ',familyTitle:'Nadpis vztahů',familyDescription:'Úvod ke vztahům',chapters:'Kapitoly lore',family:'Vztahy'};
 const permissionLabels={review:'Schvalování změn',activity:'Přehled přihlášení',blacklist:'Správa blacklistu'};
 const icons={edit:'M5 19l4-1L20 7l-3-3L6 15zM14 7l3 3',mail:'M3 6h18v13H3zM3 6l9 7 9-7',admin:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',home:'M3 11l9-8 9 8M6 9v12h12V9',users:'M15 21v-3c0-5-12-5-12 0v3M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 5c5 0 5 7 0 7M18 15c3 0 3 3 3 6',clock:'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',check:'M4 12l5 5L20 6'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[name]+'"/></svg>';
 const stamp=state=>({pending:'Čeká na schválení',approved:'Schváleno',rejected:'Zamítnuto'}[state]||state);
 const date=t=>t?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(new Date(t*1000)):'Zatím nezaznamenáno';
 const routeMatch=()=>/^#(?:manage|edit|telegrams|gramophone|seasons|atlas|games|shop|calendar|player|atelier|rp-calendar)(?:\/|$)/.test(location.hash);
 const has=permission=>identity?.admin?.permissions.includes(permission);
 const text=data=>escapeHTML(data);
 function setStatus(message){page.querySelector('.community-status').textContent=message;}
 function button(label,handler,style=''){const b=document.createElement('button');b.type='button';b.className='web-button '+style;b.textContent=label;b.onclick=handler;return b;}
 function init(){
  page=document.createElement('main');page.id='community-page';page.hidden=true;portal.after(page);
  nav=document.querySelector('.portal-navigation');
  nav.querySelector('.portal-home').innerHTML=icon('home')+'Můj archiv';
  const edit=document.createElement('a');edit.href='#edit';edit.className='nav-edit';edit.innerHTML=icon('edit')+'Upravit postavu';nav.append(edit);
  const seasons=document.createElement('a');seasons.href='#seasons';seasons.className='nav-seasons';seasons.innerHTML=icon('clock')+'Roční období';nav.append(seasons);
  const atlas=document.createElement('a');atlas.href='#atlas';atlas.className='nav-atlas';atlas.innerHTML=AtlasIcons.svg('pin')+'Atlas';nav.append(atlas);
  const atelier=document.createElement('a');atelier.href='#atelier';atelier.className='nav-atelier';atelier.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v14H3zM7 7l2-4h6l2 4"/><circle cx="12" cy="14" r="4"/></svg>Ateliér';nav.append(atelier);
  const calendar=document.createElement('a');calendar.href='#rp-calendar';calendar.className='nav-rp-calendar';calendar.innerHTML=icon('clock')+'RP kalendář <span class="web-badge rp-calendar-badge" hidden></span>';nav.append(calendar);
  const admin=document.createElement('a');admin.href='#manage';admin.className='nav-manage';admin.innerHTML=icon('admin')+'Pro správu webu <span class="web-badge review-badge" hidden></span>';nav.append(admin);
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
 }
 function sync(){
  if(!nav)return;
  nav.querySelector('.nav-edit').hidden=!identity?.owned.length;
  nav.querySelector('.nav-manage').hidden=!identity?.admin?.owner&&!identity?.admin?.permissions.length;
  nav.querySelector('.nav-seasons').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-atlas').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-rp-calendar').hidden=!identity||!!identity.restricted;
  nav.querySelector('.nav-atelier').hidden=!identity||!!identity.restricted;
  for(const [selector,count]of [['.nav-manage',identity?.pending||0]]){const badge=nav.querySelector(selector+' .web-badge');badge.hidden=!count;badge.textContent=String(count);}
 }
 function values(){
  const form=page.querySelector('.character-form');if(!form||!editorState)return null;
  const data={};for(const key of Object.keys(labels))if(!['chapters','family'].includes(key))data[key]=form.elements[key].value;
  data.chapters=[...form.querySelectorAll('.edit-chapter')].map(row=>({title:row.querySelector('[data-title]').value,text:row.querySelector('textarea').value}));
  data.family=[...form.querySelectorAll('.edit-relation')].map(row=>Object.fromEntries(['label','name','text','status'].map(key=>[key,row.querySelector('[data-relation='+key+']').value])));
  return data;
 }
 function dirty(){if(RPCalendar.dirty)return true;if(Atelier.dirty)return true;if(Atlas.dirty())return true;return view==='edit'&&editorState&&JSON.stringify(values())!==editorState.baseline;}
 async function beforeLogout(){if(RPCalendar.dirty)return PortalPolish.confirm('Odhlásit a opustit diář?','Neuložené akce se zahodí. Uložené akce zůstanou.','Odhlásit');if(Atelier.dirty)return PortalPolish.confirm('Odhlásit a zavřít ateliér?','Nevyvolaný náhled se zahodí. Uložené fotografie na šňůře zůstanou.','Odhlásit');return !dirty()||await PortalPolish.confirm('Odhlásit a zahodit rozepsané změny?','Neuložené změny postavy se zahodí. Uložený koncept zůstane zachovaný.','Odhlásit');}
 async function beforeRoute(){
  if(loadedHash!==location.hash&&RPCalendar.dirty){if(!await PortalPolish.confirm('Opustit rozepsanou akci?','Neuložené změny akce se zahodí.','Opustit diář')){history.replaceState(null,'',loadedHash);return false;}RPCalendar.dispose();}
  if(loadedHash!==location.hash&&Atelier.dirty){if(!await PortalPolish.confirm('Opustit ateliér?','Nevyvolaný náhled se zahodí. Fotografie na šňůře zůstanou uložené.','Opustit ateliér')){history.replaceState(null,'',loadedHash);return false;}Atelier.dispose();}
  if(loadedHash!==location.hash&&Atlas.dirty()){if(!await PortalPolish.confirm('Opustit rozepsané místo?','Neuložené úpravy místa v atlasu se zahodí.','Opustit atlas')){history.replaceState(null,'',loadedHash);return false;}Atlas.dispose();}
  if(loadedHash!==location.hash&&dirty()&&!await PortalPolish.confirm('Opustit rozepsanou postavu?','Neuložené změny se zahodí. Koncept uložený na serveru zůstane zachovaný.','Opustit editor')){history.replaceState(null,'',loadedHash);return false;}return true;
 }
 function purge({preserveDraft=false}={}){
  WeatherStudio.dispose();RPCalendar.dispose({preserveDraft});Atelier.dispose();MemberProfile.dispose();Atlas.dispose({preserveDraft});SeasonLab.dispose();
  if(preserveDraft&&view==='edit'&&editorState)suspended={user:identity?.user.id,data:values(),state:editorState};else if(!preserveDraft)suspended=null;
  generation++;page.hidden=true;page.replaceChildren();document.body.classList.remove('community-view');view='';editorState=null;loadedHash='';
 }
 function shell(title,subtitle,type='archive'){
  document.body.classList.add('community-view');
  page.hidden=false;page.className='community-'+type;page.innerHTML='<section class="community-hero"><div><span class="eyebrow">NEW HORIZON · SOUKROMÁ KRONIKA</span><h1>'+text(title)+'</h1><p>'+text(subtitle)+'</p></div><span class="community-hero-mark" aria-hidden="true">✦</span></section><div class="community-workspace"><aside class="community-menu"></aside><section class="community-main"><p class="community-status" role="status" aria-live="polite"></p><div class="community-content"></div></section></div>';
 }
 function content(){return page.querySelector('.community-content');}
 function menu(items){page.querySelector('.community-menu').innerHTML=items.map(([hash,label,kind])=>'<a href="'+hash+'"'+(location.hash===hash?' aria-current="page"':'')+'>'+icon(kind)+'<span>'+text(label)+'</span></a>').join('');}
 async function open(){
  purge({preserveDraft:!!suspended||Atlas.pendingDraft||RPCalendar.pendingDraft});const version=++generation,user=identity?.user.id;loadedHash=location.hash;
  if(!identity){shell('Vstup do svého archivu','Pro správu postavy a osobního archivu se přihlas přes Discord.');content().innerHTML='<a class="web-button" href="'+loginHref+'">Přihlásit přes Discord</a>';return;}
  try{
   if(loadedHash.startsWith('#telegrams')||loadedHash==='#manage/mail'){view='removed';shell('Telegramy se zavřely','Soukromá schránka už není součástí webu.');content().innerHTML='<div class="web-empty"><h2>Rozhodnutí najdeš u své žádosti.</h2><p>Stav úprav postavy a vyjádření správy jsou dostupné v Moje žádosti. Upozornění na Discordu fungují dál.</p><a class="web-button" href="#edit/requests">Moje žádosti</a><a class="web-button" href="#">Můj archiv</a></div>'; }
   else if(/^#(?:games|shop|calendar)(?:\/|$)/.test(loadedHash)||/^#manage\/(?:economy|calendar)(?:\/|$)/.test(loadedHash)){view='retired';shell('Tato část kroniky skončila','Hry, obchod a adventní kalendář už nejsou součástí webu.','retired');content().innerHTML='<div class="web-empty"><h2>Vrať se ke svému příběhu.</h2><p>Archiv, deník, atlas a ateliér jsou dál dostupné.</p><a href="#" class="web-button">Můj archiv ↗</a></div>';}
   else if(loadedHash.startsWith('#rp-calendar')){view='rp-calendar';shell('RP kalendář','Tvoje plány, společné akce a včasné připomínky.','rp-calendar');menu([['#','Můj archiv','home'],['#rp-calendar','Diář','clock'],['#rp-calendar/invitations','Pozvánky','users'],['#rp-calendar/notifications','Upozornění','mail']]);await RPCalendar.open(content(),loadedHash);}
   else if(/^#player(?:\/|$)/.test(loadedHash)){view='member-profile';shell('Moje vizitka','Hráč a jeho postava.','member-profile');menu([['#','Můj archiv','home'],['#player','Moje vizitka','users']]);await MemberProfile.open(content(),loadedHash);}
   else if(loadedHash.startsWith('#edit')){view='edit';shell('Tvůj příběh. Tvými slovy.','Uprav svou postavu. Zveřejní se až po schválení správou.','editor');menu([['#','Můj archiv','home'],['#edit','Upravit postavu','edit'],['#edit/requests','Moje žádosti','check']]);if(loadedHash.startsWith('#edit/requests'))await ownRequests(version,user);else await editor(version,user);}
   else if(loadedHash==='#atelier'){view='atelier';shell('Fotografický ateliér','Vzpomínky z našich cest. Vyvolané po tvém.','atelier');menu([['#','Můj archiv','home'],['#atelier','Ateliér','edit']]);await Atelier.open(content());}
   else if(loadedHash.startsWith('#gramophone')){view='removed';shell('Gramofon dohrál','Hudební místnost už není součástí kroniky.');content().innerHTML='<div class="web-empty"><h2>Vzpomínky pokračují dál.</h2><a class="web-button" href="#atelier">Fotografický ateliér ↗</a><a class="web-button" href="#">Můj archiv</a></div>';}
   else if(loadedHash.startsWith('#seasons')){view='seasons';shell('Roční období','Atmosféra kroniky podle tebe.','seasons');menu([['#','Můj archiv','home'],['#seasons','Roční období','clock']]);await SeasonLab.open(content());}
   else if(loadedHash.startsWith('#atlas')){view='atlas';shell('Atlas pohraničí','Vlastní místa. Vlastní cesty. Stejný horizont.','atlas');menu([['#','Můj archiv','home'],['#atlas','Atlas','home'],['#edit/requests','Moje žádosti','check']]);await Atlas.open(content());}
   else if(loadedHash.startsWith('#manage')){view='manage';shell('Správa kroniky','Žádosti, lidé a provoz na jednom místě.','manage');await manage(version,user);}
   else{view='missing';shell('Stránka není dostupná','Vrať se do svého archivu.');content().innerHTML='<a class="web-button" href="#">Můj archiv</a>';}
   if(version!==generation||user!==identity?.user.id||document.hidden)return;
   window.scrollTo({top:0,behavior:'instant'});document.title=page.querySelector('h1').textContent+' · New Horizon';
  }catch(error){if(version===generation)setStatus(error.message);}
 }
 function valid(version,user){return version===generation&&user===identity?.user.id&&!document.hidden;}
 function field(key,value,area=false){return '<label>'+text(labels[key])+(area?'<textarea name="'+key+'" rows="4" maxlength="'+({description:1500,quote:1500,closing:1500,familyDescription:2000}[key]||500)+'">'+text(value)+'</textarea>':'<input name="'+key+'" value="'+text(value)+'" maxlength="'+({given:100,surname:100,nickname:100,age:80,birth:100,occupation:250,relatives:500,kicker:500,origin:200,familyTitle:150}[key]||200)+'"'+(['given','surname','age'].includes(key)?' required':'')+'>')+'</label>';}
 function chapterRow(chapter){const row=document.createElement('div');row.className='edit-chapter';row.innerHTML='<label>Název kapitoly<input data-title maxlength="160" required value="'+text(chapter.title)+'"></label><label>Text kapitoly<textarea rows="7" maxlength="16000" required>'+text(chapter.text)+'</textarea></label>';row.append(button('Odstranit kapitolu',async()=>{if(await PortalPolish.confirm('Odstranit kapitolu?','Odstraní se z tohoto návrhu. Schválený příběh se zatím nezmění.','Odstranit')){row.remove();paintPreview();}},'subtle'));return row;}
 function relationRow(relation){const row=document.createElement('div');row.className='edit-relation';row.innerHTML=['label','name','text','status'].map(key=>'<label>'+({label:'Role / označení',name:'Jméno',text:'Popis vztahu',status:'Poznámka'}[key])+(key==='text'?'<textarea data-relation="text" maxlength="2000">'+text(relation[key])+'</textarea>':'<input data-relation="'+key+'" maxlength="160" value="'+text(relation[key])+'">')+'</label>').join('');row.append(button('Odstranit vztah',()=>{row.remove();paintPreview();},'subtle'));return row;}
 function paintOwnRequests(history,host){
  host.innerHTML=history.length?history.map(r=>'<article class="web-list-row"><span class="status-pill '+r.status+'">'+stamp(r.status)+'</span><div><p>Odesláno '+date(r.created_at)+(r.decided_at?' · Vyřízeno '+date(r.decided_at):'')+'</p><p>'+text(r.reason|| (r.status==='pending'?'Čekáme na vyjádření správy.':r.status==='approved'?'Nová verze postavy je zveřejněná.':'Návrh nebyl schválen.'))+'</p><a class="web-button" href="#edit/requests/'+r.id+'">Otevřít žádost ↗</a></div></article>').join(''):'<p class="web-muted">Zatím jsi neposlal žádnou žádost.</p>';
 }
 async function ownRequests(version,user){
  const key=identity.owned[0];if(!key)throw Error('K účtu není přiřazená vlastní postava.');
  const id=loadedHash.split('/')[2];
  if(id){
   const {request:r}=await api('/editor/requests/'+encodeURIComponent(id));if(!valid(version,user))return;
   content().innerHTML='<a class="web-back" href="#edit/requests">← Moje žádosti</a><section class="own-request-detail"><span class="eyebrow">'+text(catalog[r.character_key]?.name||'Tvoje postava')+'</span><h2>Vyjádření k úpravám postavy</h2><span class="status-pill '+r.status+'">'+stamp(r.status)+'</span><p>Odesláno '+date(r.created_at)+(r.decided_at?' · Vyřízeno '+date(r.decided_at):'')+'</p><h3>Vyjádření správy</h3><p class="request-reason">'+text(r.reason||(r.status==='pending'?'Žádost čeká na schválení.':r.status==='approved'?'Úpravy byly schváleny a nová verze je zveřejněná.':'Návrh nebyl schválen.'))+'</p><a class="web-button" href="#edit">Upravit postavu</a></section>';
  }else{
   const data=await api('/editor/'+key);if(!valid(version,user))return;content().innerHTML='<h2>Moje žádosti</h2><p>Stav návrhů a vyjádření správy k úpravám tvé postavy.</p><div class="my-requests"></div><a class="web-button" href="#edit">Upravit postavu</a>';paintOwnRequests(data.history,content().querySelector('.my-requests'));
  }
 }
 async function editor(version,user){
  const key=identity.owned[0];if(!key)throw Error('K tvému účtu není přiřazená vlastní postava.');
  const result=await api('/editor/'+key);if(!valid(version,user))return;
  const recovered=suspended?.user===user&&suspended.state.baseRevision===result.revision?suspended:null;suspended=null;
  const initial=result.pending?.data||recovered?.data||result.draft?.data||result.data;
  editorState={key,baseRevision:result.revision,draftRevision:result.draft?.revision||0,baseline:JSON.stringify(initial),pending:!!result.pending};
  if(recovered)editorState.baseline=recovered.state.baseline;
  content().innerHTML=(result.pending?'<div class="web-callout">'+icon('clock')+'<div><strong>Změny čekají na schválení.</strong><p>Žádost odeslána '+date(result.pending.created_at)+'. Rozhodnutí najdeš v Moje žádosti.</p></div></div>':'')+'<div class="editor-layout"><form class="character-form"><fieldset'+(result.pending?' disabled':'')+'><h2>Osobní údaje</h2><div class="web-form-grid">'+['given','surname','nickname','age','birth','occupation','origin','relatives'].map(key=>field(key,initial[key])).join('')+'</div><h2>Hlas tvé postavy</h2>'+['kicker','description','quote','closing'].map(key=>field(key,initial[key],true)).join('')+'<div class="section-heading"><h2>Kapitoly lore</h2><button class="add-chapter web-button subtle" type="button">+ Přidat kapitolu</button></div><p class="field-help">Odděluj odstavce prázdným řádkem. Můžeš použít **tučné písmo** a *kurzívu*.</p><div class="edit-chapters"></div><h2>Vztahy a blízcí</h2>'+field('familyTitle',initial.familyTitle)+field('familyDescription',initial.familyDescription,true)+'<div class="edit-relations"></div><button class="add-relation web-button subtle" type="button">+ Přidat vztah</button><div class="editor-save-bar"><button type="button" class="save-character-draft web-button">Uložit koncept</button><button type="submit" class="submit-character web-button primary">Odeslat ke schválení ↗</button></div></fieldset></form><aside class="character-preview"><span class="eyebrow">NÁHLED NÁVRHU · ZATÍM NEZVEŘEJNĚNO</span><div></div></aside></div><h2>Moje žádosti</h2><div class="my-requests"></div>';
  const form=page.querySelector('.character-form');
  initial.chapters.forEach(c=>form.querySelector('.edit-chapters').append(chapterRow(c)));initial.family.forEach(c=>form.querySelector('.edit-relations').append(relationRow(c)));
  page.querySelector('.add-chapter').onclick=()=>{if(form.querySelectorAll('.edit-chapter').length<40){form.querySelector('.edit-chapters').append(chapterRow({title:'Nová kapitola',text:''}));paintPreview();}};
  page.querySelector('.add-relation').onclick=()=>{if(form.querySelectorAll('.edit-relation').length<20){form.querySelector('.edit-relations').append(relationRow({label:'',name:'',text:'',status:''}));paintPreview();}};
  form.oninput=paintPreview;page.querySelector('.save-character-draft').onclick=()=>saveCharacter(false);form.onsubmit=e=>{e.preventDefault();saveCharacter(true);};
  paintOwnRequests(result.history,page.querySelector('.my-requests'));
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
   if(submit){editorState.pending=true;content().prepend(Object.assign(document.createElement('p'),{className:'web-callout submission-success',textContent:result.message}));setStatus('Žádost byla odeslána. Rozhodnutí najdeš v Moje žádosti. UBD tě může upozornit na Discordu.');await refreshSession();}
   else{editorState.draftRevision=result.revision;setStatus('Soukromý koncept je uložený. Ještě nebyl odeslán ke schválení.');form.querySelector('fieldset').disabled=false;}
  }catch(error){if(version===generation){setStatus(error.message);form.querySelector('fieldset').disabled=false;}}
 }
 async function manage(version,user){
  const overview=await api('/manage/overview');if(!valid(version,user))return;
  const own=overview.admin.owner,p=overview.admin.permissions,path=loadedHash.split('/');
  const groups=[['PRACOVNA',[['#manage','Přehled','home'],...(p.includes('review')?[['#manage/requests','Změny postav','edit']]:[])]],['LIDÉ',[...(p.includes('activity')?[['#manage/users','Uživatelé','users']]:[]),...(own?[['#manage/admins','Správci a oprávnění','admin']]:[]),...(p.includes('blacklist')?[['#manage/blacklist','Blacklist','admin']]:[])]],['PROVOZ',p.includes('review')?[['#manage/delivery','Discord upozornění','mail'],['#manage/audit','Historie správy','clock']]:[]]];
  if(own)groups.push(['LABORATOŘ',[['#manage/weather','Počasí a Vánoce','clock']]]);
  const sidebar=page.querySelector('.community-menu');sidebar.innerHTML=groups.filter(([,items])=>items.length).map(([label,items])=>'<div class="manage-nav-group"><span>'+label+'</span>'+items.map(([hash,label,kind])=>'<a href="'+hash+'"'+(loadedHash===hash||hash==='#manage/requests'&&path[1]==='requests'?' aria-current="page"':'')+'>'+icon(kind)+'<span>'+label+'</span>'+(hash==='#manage/requests'&&overview.pending?'<b class="web-badge">'+overview.pending+'</b>':'')+'</a>').join('')+'</div>').join('');
  if(path[1]==='weather'){if(!own){content().innerHTML='<div class="web-empty">Laboratoř je zatím dostupná pouze majiteli webu.</div>';return;}await WeatherStudio.open(content());return;}
  if(path[1]==='redm'){location.hash='#manage';return;}
  if(path[1]==='requests'){
   if(path[2]&&!['pending','approved','rejected'].includes(path[2])){await review(path[2],version,user);return;}
   const state=path[2]||'pending',result=await api('/manage/requests?status='+state);if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><div><span class="eyebrow">POSTAVY</span><h2>Žádosti o změnu</h2></div><span class="status-pill">'+result.requests.length+' záznamů</span></div><nav class="manage-tabs" aria-label="Stav žádosti">'+['pending','approved','rejected'].map(s=>'<a href="#manage/requests/'+s+'"'+(s===state?' aria-current="page"':'')+'>'+stamp(s)+'</a>').join('')+'</nav><div class="request-list">'+(result.requests.length?result.requests.map(r=>'<a class="request-card" href="#manage/requests/'+r.id+'"><img src="'+mediaURL('icon-'+r.character_key+'.png',320)+'" width="56" height="56" alt=""><div><h3>'+text(catalog[r.character_key]?.name||r.character_key)+'</h3><p>'+text(r.player_name||r.user_id)+' · '+date(r.created_at)+' · '+r.changedCount+' upravených oblastí'+'</p></div><span>Porovnat ↗</span></a>').join(''):'<div class="web-empty"><h3>Žádné žádosti v tomto stavu.</h3><p>Nové návrhy najdeš v části Čeká na schválení.</p></div>')+'</div>';
  }else if(path[1]==='users'){
   const result=await api('/manage/users');if(!valid(version,user))return;
   content().innerHTML='<h2>Lidé v kronice</h2><p class="web-muted">Poslední úspěšné přihlášení přes Discord; nejde o stav online.</p><label class="manage-search">Najít uživatele<input type="search" placeholder="Nick, postava nebo Discord ID"></label><div class="manage-user-layout"><div class="user-list"></div><aside class="manage-user-detail"><p>Vyber uživatele pro podrobnosti.</p></aside></div>';
   const list=content().querySelector('.user-list');
   const paint=query=>{const rows=result.users.filter(r=>(r.display_name+' '+r.user_id+' '+r.characters.map(k=>catalog[k]?.name).join(' ')).toLocaleLowerCase('cs').includes(query.toLocaleLowerCase('cs')));list.replaceChildren();if(!rows.length)list.innerHTML='<p>Žádný uživatel neodpovídá hledání.</p>';for(const r of rows){const b=button(r.display_name,()=>{const d=content().querySelector('.manage-user-detail');d.innerHTML='<span class="eyebrow">DISCORD ÚČET</span><h3>'+text(r.display_name)+'</h3><p>'+text(r.user_id)+'</p><p>'+text(r.characters.map(k=>catalog[k]?.name).join(', ')||'Bez postavy')+'</p><p>Poslední přihlášení<br><strong>'+date(r.last_login)+'</strong></p><span class="status-pill">'+(r.restricted?'Omezený přístup':'Přístup bez omezení')+'</span>'+(r.restriction_reason?'<p>'+text(r.restriction_reason)+'</p>':'');if(p.includes('blacklist')&&r.user_id!==identity.user.id&&r.user_id!=='417061947759001600')d.append(button('Spravovat omezení',()=>location.hash='#manage/blacklist/'+r.user_id));if(own&&r.user_id!=='417061947759001600')d.append(button('Spravovat oprávnění',()=>location.hash='#manage/admins/'+r.user_id));});b.className='manage-user-row';b.innerHTML=(r.avatar?'<img src="'+text(r.avatar)+'" width="44" height="44" alt="">':'<span class="manage-avatar">✦</span>')+'<span><strong>'+text(r.display_name)+'</strong><small>'+text(r.characters.map(k=>catalog[k]?.nickname||catalog[k]?.name).join(', ')||r.user_id)+'</small><small>'+date(r.last_login)+'</small></span>'+(r.restricted?'<span class="status-pill rejected">Omezen</span>':'');list.append(b);}};
   paint('');content().querySelector('input').oninput=e=>paint(e.target.value);
  }else if(path[1]==='admins')await administrators(version,user);
  else if(path[1]==='blacklist')await blacklist(version,user);
  else if(path[1]==='delivery'){
   const result=await api('/manage/delivery');if(!valid(version,user))return;
   const states={pending:'Čeká na doručení',delivered:'Doručeno',failed:'Nedoručeno',uncertain:'Výsledek nejistý',skipped:'Přeskočeno'};
   content().innerHTML='<div class="section-heading"><h2>Discord upozornění</h2><button class="web-button delivery-refresh">Obnovit</button></div><p class="web-muted">Posledních 100 pokusů. Nejistá zpráva mohla dorazit; znovu ji automaticky neposíláme. Uzavřené osobní zprávy musí povolit příjemce na Discordu.</p><label>Stav<select class="delivery-filter"><option value="all">Všechny</option>'+Object.entries(states).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select></label><div class="delivery-list"></div>';
   const paint=state=>{const rows=result.deliveries.filter(r=>state==='all'||r.state===state);content().querySelector('.delivery-list').innerHTML=rows.length?rows.map(r=>'<article class="web-list-row"><div><span class="status-pill '+(r.state==='failed'||r.state==='uncertain'?'rejected':'')+'">'+text(states[r.state]||r.state)+'</span><h3>'+text(r.display_name||r.recipient_id)+'</h3><p>'+(r.kind==='review'?'Nová žádost ke schválení':'Rozhodnutí o žádosti')+' · '+r.attempts+' pokusů</p><small>'+text(({dm_unavailable:'Příjemce nemá dostupné osobní zprávy.',bot_credentials:'Zkontroluj přihlašovací token bota.',rate_limit:'Discord omezil rychlost. Další pokus proběhne automaticky.',unconfirmed_delivery:'Discord nepotvrdil doručení. Zpráva mohla dorazit.',temporary_failure:'Dočasná chyba spojení.',no_longer_needed:'Upozornění již není potřeba.'})[r.last_error]||r.last_error||'Bez zaznamenané chyby')+'</small></div><time>'+date(r.created_at)+'</time></article>').join(''):'<div class="web-empty">Žádná upozornění v tomto stavu.</div>';};paint('all');content().querySelector('select').onchange=e=>paint(e.target.value);content().querySelector('.delivery-refresh').onclick=()=>open();
  }else if(path[1]==='audit'){
   const result=await api('/manage/audit');if(!valid(version,user))return;
   content().innerHTML='<h2>Historie správy</h2><p class="web-muted">Posledních 100 událostí.</p>'+eventRows(result.events);
  }else{
   const m=overview.metrics||{};
   content().innerHTML='<div class="manage-dashboard-heading"><span class="eyebrow">PŘEHLED PRACOVNY</span><h2>Co dnes potřebuje pozornost?</h2><p class="web-muted">Údaje načtené při otevření. Soukromé deníky a archivy zůstávají pod vlastními přístupy.</p></div><div class="manage-metrics">'+[['pending','Žádosti ke schválení','requests'],['users','Přihlášené účty','users'],['restricted','Omezené účty','blacklist'],['deliveryProblems','Problémy doručení','delivery']].filter(([k])=>m[k]!==null&&m[k]!==undefined).map(([k,label,route])=>'<a href="#manage/'+route+'" class="manage-metric '+(m[k]>0&&['pending','deliveryProblems'].includes(k)?'needs-attention':'')+'"><span>'+label+'</span><strong>'+m[k]+'</strong><small>Otevřít přehled ↗</small></a>').join('')+'</div><div class="manage-dashboard-columns">'+(p.includes('review')?'<section class="manage-panel"><h3>Spisy na tvém stole</h3>'+(overview.requests?.length?overview.requests.map(r=>'<a class="manage-incoming" href="#manage/requests/'+r.id+'"><img src="'+mediaURL('icon-'+r.character_key+'.png',160)+'" width="48" height="48" alt=""><span>'+text(catalog[r.character_key]?.name||r.character_key)+'<small>'+date(r.created_at)+'</small></span><b>↗</b></a>').join(''):'<p>Vše vyřízeno. Žádné návrhy nečekají.</p>')+'</section><section class="manage-panel"><h3>Poslední rozhodnutí</h3>'+eventRows(overview.events||[])+'</section>':'<section class="manage-panel"><h3>Tvoje oprávnění</h3><p>'+text(p.map(k=>permissionLabels[k]).join(' · '))+'</p></section>')+'</div>';content().querySelector('.manage-dashboard-heading').append(button('Obnovit přehled',()=>open(),'subtle'));
  }
 }
 function eventRows(events){const names={'character.approved':'Schválena postava','character.rejected':'Zamítnut návrh','admin.updated':'Změněna oprávnění','admin.removed':'Odebrán správce','blacklist.added':'Omezen přístup','blacklist.removed':'Obnoven přístup'};return events.length?events.map(r=>'<article class="manage-event"><div><strong>'+text(names[r.action]||r.action)+'</strong><p>'+text(r.actor_name||r.actor_id||'Správa')+'</p>'+(r.detail?'<small>'+text(r.detail)+'</small>':'')+(r.character_key?'<a href="#manage/requests/'+r.target+'">Otevřít rozhodnutí ↗</a>':'')+'</div><time>'+date(r.created_at)+'</time></article>').join(''):'<p class="web-muted">Zatím žádné zaznamenané události.</p>';}

 async function blacklist(version,user){
  const result=await api('/manage/blacklist');if(!valid(version,user))return;
  content().innerHTML='<div class="section-heading"><h2>Blacklist webu</h2><span class="status-pill pending">'+result.users.length+' omezených účtů</span></div><p class="web-muted">Přihlášení zůstane dostupné. Omezený uživatel uvidí pouze oznámení a kontakt na vedení Ústavu. Po obnovení přístupu se vrátí jeho původní oprávnění.</p><form class="blacklist-form"><label>Discord ID hráče<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" maxlength="20" required placeholder="Např. 642857462982115357"></label><label>Interní poznámka pro správu (nepovinná)<textarea name="reason" maxlength="500" rows="3"></textarea></label><p class="field-help">Poznámku vidí pouze oprávněná správa. Hlavního vlastníka webu nelze zablokovat.</p><button class="web-button primary">Odebrat přístup k webu</button></form><h2>Účty s omezeným přístupem</h2><div class="blacklist-list"></div>';
  const selected=loadedHash.split('/')[2];if(/^\d{17,20}$/.test(selected||''))page.querySelector('.blacklist-form [name=userId]').value=selected;
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
  content().innerHTML='<a class="web-back" href="#manage/requests">← Zpět na žádosti</a><div class="section-heading"><h2>'+text(catalog[r.character_key].name)+'</h2><span class="status-pill '+r.status+'">'+stamp(r.status)+'</span></div><p class="web-muted">Odesláno '+date(r.created_at)+' · '+changed.length+' upravených oblastí</p><label class="review-scope">Porovnání<select><option value="changed">Jen změny</option><option value="all">Celý návrh</option></select></label><div class="review-diff">'+changed.map(key=>'<section><h3>'+text(labels[key])+'</h3><div class="diff-columns"><div><span>PŮVODNÍ VERZE</span><pre>'+text(printable(r.before[key]))+'</pre></div><div><span>NÁVRH HRÁČE</span><pre>'+text(printable(r.data[key]))+'</pre></div></div></section>').join('')+'</div>'+(r.status==='pending'?'<form class="review-form"><label>Vyjádření správy (povinné při zamítnutí)<textarea name="reason" maxlength="1500" rows="4"></textarea></label><div class="web-actions"><button type="button" class="web-button reject-change">Zamítnout</button><button type="button" class="web-button primary approve-change">Schválit a zveřejnit</button></div></form>':'<p>'+text(r.reason||'')+'</p>');
  const paintDiff=all=>{const keys=all?Object.keys(labels):changed;page.querySelector('.review-diff').innerHTML=keys.map(key=>'<section class="'+(changed.includes(key)?'field-changed':'field-unchanged')+'"><h3>'+text(labels[key])+(changed.includes(key)?' · upraveno':' · beze změny')+'</h3><div class="diff-columns"><div><span>PŮVODNÍ VERZE</span><pre>'+text(printable(r.before[key]))+'</pre></div><div><span>NÁVRH HRÁČE</span><pre>'+text(printable(r.data[key]))+'</pre></div></div></section>').join('');};paintDiff(false);page.querySelector('.review-scope select').onchange=e=>paintDiff(e.target.value==='all');
  if(r.status!=='pending')return;
  const decide=async action=>{
   const reason=page.querySelector('[name=reason]').value;if(action==='reject'&&!reason.trim()){setStatus('Při zamítnutí napiš důvod pro hráče.');return;}
   if(!await PortalPolish.confirm(action==='approve'?'Schválit a zveřejnit změny?':'Zamítnout tento návrh?','Hráč najde rozhodnutí v Moje žádosti a může dostat upozornění na Discordu. Akce se zapíše do historie.',action==='approve'?'Schválit':'Zamítnout'))return;
   page.querySelectorAll('.review-form button').forEach(b=>b.disabled=true);
   try{await api('/manage/requests/'+id,{method:'POST',body:JSON.stringify({action,reason})});if(!valid(version,user))return;await refreshSession();location.hash='#manage/requests';}catch(error){if(version===generation){setStatus(error.message);page.querySelectorAll('.review-form button').forEach(b=>b.disabled=false);}}
  };page.querySelector('.approve-change').onclick=()=>decide('approve');page.querySelector('.reject-change').onclick=()=>decide('reject');
 }
 async function administrators(version,user){
  const result=await api('/manage/admins');if(!valid(version,user))return;
  content().innerHTML='<h2>Správci a oprávnění</h2><div class="web-callout">'+icon('admin')+'<div><strong>Hlavní vlastník: kubiasofficial</strong><p>'+text(result.owner)+' · chráněný přístup</p></div></div><form class="admin-form"><label>Discord ID nového nebo stávajícího správce<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" required></label><div class="permission-options">'+Object.entries(permissionLabels).map(([key,label])=>'<label><input type="checkbox" name="'+key+'">'+text(label)+'<small>'+text(({review:'Rozhodování o změnách postav, historie a doručování upozornění.',activity:'Přehled účtů a posledních úspěšných přihlášení.',blacklist:'Omezení a obnovení přístupu k webovým funkcím.'})[key])+'</small></label>').join('')+'</div><button class="web-button primary">Uložit oprávnění</button></form><h2>Pověření správci</h2><div class="admin-list"></div>';
  for(const row of result.admins){const card=document.createElement('article');card.className='web-list-row';card.innerHTML='<div><strong>'+text(row.display_name||row.user_id)+'</strong><p>'+text(row.permissions.map(p=>permissionLabels[p]).join(' · '))+'</p><small>'+text(row.user_id)+'</small></div>';card.append(button('Upravit',()=>{const f=page.querySelector('.admin-form');f.elements.userId.value=row.user_id;for(const key of Object.keys(permissionLabels))f.elements[key].checked=row.permissions.includes(key);f.scrollIntoView({behavior:'smooth',block:'center'});}));card.append(button('Odebrat',async()=>{if(!await PortalPolish.confirm('Odebrat přístup správci?','Jeho správcovská oprávnění přestanou platit. Vlastnictví postavy tím nezměníš.','Odebrat'))return;try{await api('/manage/admins/'+row.user_id,{method:'DELETE'});if(valid(version,user))open();}catch(e){setStatus(e.message);}},'subtle'));page.querySelector('.admin-list').append(card);}
  const selectedAdmin=loadedHash.split('/')[2];if(/^\d{17,20}$/.test(selectedAdmin||'')){const f=page.querySelector('.admin-form'),prior=result.admins.find(r=>r.user_id===selectedAdmin);f.elements.userId.value=selectedAdmin;for(const key of Object.keys(permissionLabels))f.elements[key].checked=!!prior?.permissions.includes(key);}
  page.querySelector('.admin-form').onsubmit=async event=>{event.preventDefault();const f=event.target,permissions=Object.keys(permissionLabels).filter(key=>f.elements[key].checked);if(!permissions.length){setStatus('Vyber alespoň jedno oprávnění.');return;}const previous=result.admins.find(r=>r.user_id===f.elements.userId.value)?.permissions||[];if(!await PortalPolish.confirm('Změnit oprávnění správce?',f.elements.userId.value+'\nDosud: '+(previous.map(k=>permissionLabels[k]).join(', ')||'Bez oprávnění')+'\nNově: '+permissions.map(k=>permissionLabels[k]).join(', '),'Uložit oprávnění'))return;if(!valid(version,user))return;f.querySelector('button').disabled=true;try{await api('/manage/admins/'+f.elements.userId.value,{method:'PUT',body:JSON.stringify({permissions})});if(valid(version,user))open();}catch(e){if(valid(version,user)){setStatus(e.message);f.querySelector('button').disabled=false;}}};
 }
 function allowed(){if(/^#(?:gramophone|seasons|atlas|games)(?:\/|$)/.test(location.hash))return !!identity&&!identity.restricted;const path=location.hash.split('/')[1];if(path==='admins'||path==='seasons'||path==='weather')return !!identity?.admin?.owner;const permission={requests:'review',audit:'review',delivery:'review',users:'activity',blacklist:'blacklist'}[path];return permission?has(permission):!!identity?.admin?.owner||!!identity?.admin?.permissions.length;}
 return {init,sync,open,purge,beforeRoute,beforeLogout,get matches(){return routeMatch();},get active(){return view;},allowed};
})();

const PERSONAL_POINTERS={"scarlett":{"name":"Kočičí stopa","animal":"Kočka","color":"#6fa9ff","normal":"assets/pointers/scarlett-normal.2b4eead4b6d5.svg","link":"assets/pointers/scarlett-link.4df9eff1d7a0.svg","stamp":"assets/pointers/scarlett-stamp.c4003513c25d.svg"},"nathaniel":{"name":"Havraní podpis","animal":"Havran","color":"#d36b7c","normal":"assets/pointers/nathaniel-normal.0c7f1797eb69.svg","link":"assets/pointers/nathaniel-link.d987b5320d62.svg","stamp":"assets/pointers/nathaniel-stamp.bbf04dc3dec0.svg"},"daniel":{"name":"Jantarový panter","animal":"Panter","color":"#e7a052","normal":"assets/pointers/daniel-normal.03ce4c2006d3.svg","link":"assets/pointers/daniel-link.77734a92d6ec.svg","stamp":"assets/pointers/daniel-stamp.724579149632.svg"},"katie":{"name":"Vlčí přísaha","animal":"Vlk","color":"#a2d6f5","normal":"assets/pointers/katie-normal.406b470345bc.svg","link":"assets/pointers/katie-link.ee72601d8bdc.svg","stamp":"assets/pointers/katie-stamp.8b9e8905f649.svg"},"vincent":{"name":"Dračí dotek","animal":"Drak","color":"#6eafff","normal":"assets/pointers/vincent-normal.bd5425e5ed45.svg","link":"assets/pointers/vincent-link.35d109ace4d0.svg","stamp":"assets/pointers/vincent-stamp.ae64f42e9213.svg"},"elijah":{"name":"Věrný strážce","animal":"Ovčák","color":"#d5a05c","normal":"assets/pointers/elijah-normal.3adffcb4f881.svg","link":"assets/pointers/elijah-link.e8aa99987b89.svg","stamp":"assets/pointers/elijah-stamp.8bd8626894dc.svg"}};
const PersonalPointer=(()=>{
 const defaults={cursor:true,clicks:true,touch:false},inputSelector='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"],[draggable="true"],iframe';
 let initialized=false,account=null,key=null,theme=null,prefs={...defaults},dialog=null,overlay=null,opener=null,lastStamp=-1000,device='',storageKey='';
 const memory=new Map(),effects=new Set(),fine=matchMedia('(any-pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),down=new Map();
 const quietPage=()=>/^#manage(?:\/|$)/.test(location.hash);
 const uri=url=>'url("'+url+'") 2 1';
 function clear(){for(const e of effects)e.remove();effects.clear();down.clear();}
 function load(){let value=memory.get(account);try{const saved=storageKey?JSON.parse(localStorage.getItem(storageKey)):null;if(saved&&typeof saved==='object')value=saved;}catch{}prefs={...defaults};for(const k of Object.keys(defaults))if(typeof value?.[k]==='boolean')prefs[k]=value[k];}
 function apply(){
  const html=document.documentElement;delete html.dataset.personalPointer;
  html.style.removeProperty('--personal-cursor');html.style.removeProperty('--personal-link-cursor');
  if(!theme||!prefs.cursor||!fine.matches||quietPage())return;
  html.style.setProperty('--personal-cursor',uri(theme.normal));html.style.setProperty('--personal-link-cursor',uri(theme.link));html.dataset.personalPointer=key;
 }
 function sync(){
  const next=identity&&!identity.restricted?identity.user.id:null,nextKey=next?identity.owned.find(k=>Object.hasOwn(PERSONAL_POINTERS,k))||null:null;
  if(next!==account||nextKey!==key){clear();close();account=next;key=nextKey;theme=key?PERSONAL_POINTERS[key]:null;storageKey=account?'nh-pointer-v1:'+account:'';load();lastStamp=-1000;if(theme){const image=new Image();image.src=theme.stamp;}}
  apply();const control=document.querySelector('.pointer-settings-open');if(control)control.hidden=!theme;
 }
 function setDevice(type){const next=type==='mouse'?'mouse':'touch';if(device===next)return;device=next;document.documentElement.dataset.pointerDevice=next;}
 function save(){memory.set(account,{...prefs});try{localStorage.setItem(storageKey,JSON.stringify(prefs));}catch{}clear();apply();}
 function stamp(x,y,target,preview=false){
  if(!theme||document.hidden||(!preview&&quietPage()))return;const now=performance.now();if(now-lastStamp<75)return;lastStamp=now;
  while(effects.size>=6){const old=effects.values().next().value;old.remove();effects.delete(old);}
  const node=document.createElement('span');node.className='personal-click-stamp';node.setAttribute('aria-hidden','true');node.dataset.theme=key;node.style.setProperty('--stamp-color',theme.color);
  const img=document.createElement('img');img.src=theme.stamp;img.alt='';img.width=44;img.height=44;img.draggable=false;node.append(img);
  const layer=target instanceof Element?target.closest('dialog[open]'):null;
  if(layer){const bounds=layer.getBoundingClientRect();node.style.left=(x-bounds.left+layer.scrollLeft)+'px';node.style.top=(y-bounds.top+layer.scrollTop)+'px';layer.append(node);}else{node.style.left=x+'px';node.style.top=y+'px';overlay.append(node);}
  effects.add(node);const remove=()=>{node.remove();effects.delete(node);};
  if(typeof node.animate==='function'){const motion=reduced.matches?[{opacity:.8},{opacity:0}]:[{opacity:0,transform:'translate(-50%,-50%) scale(.75)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.2},{opacity:0,transform:'translate(-50%,-50%) scale(1.08)'}];node.animate(motion,{duration:reduced.matches?260:520,easing:'ease-out'}).finished.then(remove,remove);}
  setTimeout(remove,650);
 }
 function pointerDown(e){setDevice(e.pointerType);if(!theme||document.hidden||quietPage()||e.button!==0||!e.isPrimary)return;down.set(e.pointerId,{x:e.clientX,y:e.clientY,target:e.target});}
 function pointerUp(e){
  const start=down.get(e.pointerId);down.delete(e.pointerId);if(!start||!theme||!e.isPrimary||e.button!==0||quietPage()||document.hidden)return;
  const touch=e.pointerType!=='mouse';if(touch?!prefs.touch:!prefs.clicks)return;
  if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>9)return;
  for(const t of [start.target,e.target])if(t instanceof Element&&t.closest(inputSelector+',:disabled,[aria-disabled="true"],[data-pointer-preview]'))return;
  stamp(e.clientX,e.clientY,e.target);
 }
 function close(){if(dialog?.open)dialog.close();}
 function open(){
  sync();if(!theme)return;opener=document.activeElement?.closest('.profile-navigation')?document.querySelector('.user-trigger'):document.activeElement;const d=dialog;
  d.querySelector('.pointer-theme-name').textContent=theme.name;d.style.setProperty('--pointer-color',theme.color);
  const art=d.querySelector('.pointer-preview-art');art.replaceChildren();for(const[type,label]of [['normal','Tvůj kurzor'],['stamp','Stopa kliknutí']]){const figure=document.createElement('figure'),img=new Image();img.src=theme[type];img.alt='';img.width=44;img.height=44;const caption=document.createElement('figcaption');caption.textContent=label;figure.append(img,caption);art.append(figure);}
  for(const k of Object.keys(defaults))d.querySelector('[name='+k+']').checked=prefs[k];
  d.querySelector('.pointer-settings-status').textContent='Změny se ukládají automaticky v tomto prohlížeči pro tvůj Discord účet.';
  d.showModal();d.querySelector('.pointer-close').focus();
 }
 function init(){
  if(initialized)return;initialized=true;overlay=document.createElement('div');overlay.className='personal-pointer-layer';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);dialog=document.createElement('dialog');dialog.className='pointer-settings-dialog';dialog.setAttribute('aria-labelledby','pointer-settings-title');
  dialog.innerHTML='<button type="button" class="pointer-close dialog-close" aria-label="Zavřít vzhled a efekty">×</button><span class="eyebrow">TVŮJ KURZOR. TVOJE STOPA.</span><h2 id="pointer-settings-title">Vzhled a efekty</h2><p class="pointer-theme-name"></p><div class="pointer-preview-art"></div><fieldset><legend>Osobní ovládání</legend><label><input type="checkbox" name="cursor"><span>Vlastní kurzor<small>Tvůj motiv při ovládání myší.</small></span></label><label><input type="checkbox" name="clicks"><span>Efekt kliknutí<small>Krátká stopa v místě kliknutí.</small></span></label><label><input type="checkbox" name="touch"><span>Efekty při dotyku<small>Volitelné pro telefon, tablet a pero. Posouvání stránky stopy nevytváří.</small></span></label></fieldset><div class="pointer-preview-zone"><button type="button" class="web-button" data-pointer-preview>Vyzkoušet stopu</button></div><p class="pointer-settings-note">Při psaní, přetahování a v administraci zůstává běžné ovládání. Efekty jsou bez zvuku a respektují omezení pohybu.</p><p class="pointer-settings-status" role="status"></p>';
  document.body.append(dialog);dialog.querySelector('.pointer-close').onclick=close;dialog.addEventListener('close',()=>{clear();if(opener?.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('change',e=>{if(!theme||!Object.hasOwn(defaults,e.target.name))return;prefs[e.target.name]=e.target.checked;save();});
  dialog.querySelector('[data-pointer-preview]').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();stamp(e.detail?e.clientX:r.x+r.width/2,e.detail?e.clientY:r.y+r.height/2,e.currentTarget,true);};
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
  document.addEventListener('pointerover',e=>setDevice(e.pointerType),{passive:true});document.addEventListener('pointerdown',pointerDown,{passive:true,capture:true});document.addEventListener('pointerup',pointerUp,{passive:true,capture:true});document.addEventListener('pointercancel',e=>down.delete(e.pointerId),{passive:true});
  document.addEventListener('dragstart',()=>down.clear(),{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();close();}});window.addEventListener('blur',()=>{clear();close();});
  window.addEventListener('hashchange',()=>{if(quietPage())clear();close();apply();});window.addEventListener('storage',e=>{if(storageKey&&e.key===storageKey){load();clear();apply();if(dialog.open)for(const k of Object.keys(defaults))dialog.querySelector('[name='+k+']').checked=prefs[k];}});
  fine.addEventListener('change',apply);reduced.addEventListener('change',clear);sync();
 }
 return{init,sync,open,close};
})();

const UserChrome=(()=>{
 let host,nav,trigger,birthday,settings,birthdayKey=null,birthdayVersion=0,settingsVersion=0,restoreBirthdayFocus=null;
 const cake='<svg class="cake-icon" viewBox="0 0 48 48" aria-hidden="true"><path class="cake-flame" d="M24 3c-5 6-4 9 0 9s5-3 0-9Z"/><path d="M24 13v7M12 29v-7h24v7M8 29h32v14H8zM5 43h38M13 23c0 5 5 5 5 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 5 5 5 0M9 33c0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0"/></svg>';
 const bell='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5zM10 20h4M12 3v2"/></svg>';
 function closeMenu(focus=false){if(!host)return;host.classList.remove('user-menu-open');nav.inert=true;nav.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');if(focus)trigger?.focus({preventScroll:true});}
 function openMenu(focus=false){if(!identity||!trigger)return;host.classList.add('user-menu-open');nav.inert=false;nav.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');if(focus)nav.querySelector('a:not([hidden]),button:not([hidden])')?.focus();}
 function closeBirthday(){birthdayVersion++;birthdayKey=null;if(birthday?.open)birthday.close();birthday?.querySelector('.birthday-content').replaceChildren();restoreBirthdayFocus?.focus({preventScroll:true});restoreBirthdayFocus=null;}
 function clearPrivate(){closeBirthday();settingsVersion++;if(settings?.open)settings.close();settings?.querySelector('form').reset();}
 function arrangeMenu(){
  const own=identity?.owned[0];nav.querySelector('.nav-journal').href=own?'#journal-'+own:'#';nav.querySelector('.nav-journal').hidden=!own||!!identity?.restricted;nav.querySelector('.nav-trust').hidden=!own||!!identity?.restricted;
  for(const selector of ['.nav-profile'])nav.querySelector(selector).hidden=!!identity?.restricted;
  const groups=[['Moje postava',['.nav-profile','.portal-home','.nav-journal','.nav-edit','.nav-trust','.nav-rp-calendar']],['Náš svět',['.cast-toggle','.nav-atlas']],['Volný čas',['.nav-atelier']],['Nastavení',['.nav-seasons','.pointer-settings-open','.notification-settings','.menu-logout']],['Správa',['.nav-manage']]];
  const fresh=[];for(const[label,selectors]of groups){const section=document.createElement('section');section.className='account-menu-group';const title=document.createElement('h3');title.textContent=label;section.append(title);for(const selector of selectors){const e=nav.querySelector(selector);if(e)section.append(e);}fresh.push(section);}
  nav.querySelectorAll('.account-menu-group').forEach(e=>e.remove());nav.append(...fresh);
 }
 function init(){
  nav=document.querySelector('.portal-navigation');nav.id='user-navigation';nav.classList.add('profile-navigation');nav.inert=true;nav.setAttribute('aria-hidden','true');
  host=document.createElement('div');host.className='user-chrome';document.querySelector('.masthead').append(host);host.append(accountControls,nav);
  const preferenceButton=document.createElement('button');preferenceButton.type='button';preferenceButton.className='notification-settings';preferenceButton.innerHTML=bell+'Upozornění';preferenceButton.onclick=openSettings;nav.append(preferenceButton);
  const pointerButton=document.createElement('button');pointerButton.type='button';pointerButton.className='pointer-settings-open';pointerButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v16l5-5 4 7 3-2-4-7h7Z"/></svg>Vzhled a efekty';pointerButton.onclick=()=>PersonalPointer.open();pointerButton.hidden=true;nav.append(pointerButton);
  for(const[cls,href,label,symbol]of [['profile','#player','Moje vizitka','♙'],['journal','#','Můj deník','▤']]){const a=document.createElement('a');a.className='nav-'+cls;a.href=href;a.innerHTML='<span class="menu-symbol" aria-hidden="true">'+symbol+'</span>'+label;nav.append(a);}
  const trust=document.createElement('button');trust.type='button';trust.className='nav-trust';trust.innerHTML='<span class="menu-symbol" aria-hidden="true">♧</span>Komu důvěřuji';trust.onclick=()=>document.querySelector('.trust-open')?.click();nav.append(trust);
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
  settings=document.createElement('dialog');settings.className='notification-dialog';settings.setAttribute('aria-labelledby','notification-title');settings.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít nastavení">×</button><span class="notification-emblem">'+bell+'</span><span class="eyebrow">SOUKROMÉ ZPRÁVY OD UBD</span><h2 id="notification-title">Když kronika zavolá.</h2><p>Vyber, na co tě má bot upozornit soukromou zprávou na Discordu. Podrobnosti žádostí a lore zůstávají na webu.</p><form><fieldset><label><input type="checkbox" name="decisions">Rozhodnutí o úpravách mé postavy</label><label class="review-preference"><input type="checkbox" name="reviews">Nové návrhy ke schválení</label><button class="web-button primary">Uložit nastavení</button></fieldset></form><p class="notification-status" role="status" aria-live="polite"></p>';document.body.append(settings);settings.querySelector('.dialog-close').onclick=()=>{settingsVersion++;settings.close();};
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
  const counters=document.createElement('span');counters.className='user-counters';counters.innerHTML='<span class="user-pending" hidden></span>';trigger.append(counters);accountControls.replaceChildren(trigger);
  logout.classList.add('menu-logout');nav.append(logout);arrangeMenu();trigger.onclick=()=>host.classList.contains('user-menu-open')?closeMenu():openMenu();refresh();
 }
 function refresh(){
  RPCalendar.badges();
  if(birthdayKey&&(!identity||!identity.access.includes(birthdayKey)))closeBirthday();
  if(!identity){closeMenu();return;}
  if(!trigger)return;
  Holiday.update();
  for(const [selector,count,label]of [['.user-pending',identity.pending||0,'změn ke schválení']]){const counter=trigger.querySelector(selector);counter.hidden=!count;counter.textContent=String(count);counter.setAttribute('aria-label',count+' '+label);}
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
  try{const data=await api('/notifications/settings');if(version!==settingsVersion||user!==identity?.user.id)return;for(const key of ['decisions','reviews'])form.elements[key].checked=data[key];form.querySelector('fieldset').disabled=false;settings.querySelector('.notification-status').textContent=data.lastDelivery?.reason==='dm_unavailable'?'Poslední zprávu Discord nepovolil doručit. Pokud upozornění chceš dostávat, povol soukromé zprávy od členů serveru. Rozhodnutí na webu dál najdeš v Moje žádosti.':'';}
  catch(error){if(version===settingsVersion)settings.querySelector('.notification-status').textContent=error.message;}
 }
 async function saveSettings(event){event.preventDefault();const version=settingsVersion,user=identity?.user.id,form=event.target;form.querySelector('fieldset').disabled=true;
  try{await api('/notifications/settings',{method:'PUT',body:JSON.stringify(Object.fromEntries(['decisions','reviews'].map(key=>[key,form.elements[key].checked])))});if(version===settingsVersion&&user===identity?.user.id)settings.querySelector('.notification-status').textContent='Nastavení upozornění je uložené.';}
  catch(error){if(version===settingsVersion)settings.querySelector('.notification-status').textContent=error.message;}
  finally{if(version===settingsVersion)form.querySelector('fieldset').disabled=false;}
 }
 return {init,account,refresh,clearPrivate,closeMenu,decorateBirthdays};
})();

const RestrictedAccess=(()=>{
 let page;
 function show(){
  SeasonAtmosphere.syncSession();
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

// Public copy only. One cancellable timer; no work while hidden, logged in or motion-reduced.
const EntranceTypewriter=(()=>{
 const scene=document.querySelector('.frontier-entrance'),line=scene?.querySelector('.entrance-typed'),wrapper=scene?.querySelector('.entrance-typewriter');
 if(!line)return;
 const phrases=['Jak začneš dnešní příběh ty?','Některé cesty začínají jediným rozhodnutím.','Komu dnes svěříš své tajemství?','Minulost už nezměníš. Další kapitolu ano.','Za obzorem čeká příběh, který ještě nikdo nenapsal.'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let timer=0,index=0,position=0,phase='typing';
 const stop=()=>{clearTimeout(timer);timer=0;};
 const active=()=>!document.hidden&&!scene.hidden&&!document.body.classList.contains('signed-in');
 function later(delay){stop();if(active()&&!reduced.matches)timer=setTimeout(tick,delay);}
 function tick(){
  timer=0;if(!active()||reduced.matches)return;
  if(phase==='typing'){
   line.textContent=phrases[index].slice(0,++position);
   if(position>=phrases[index].length){phase='hold';later(4200);}
   else later(/[.,?]/.test(phrases[index][position-1])?200:48+(position%4)*11);
  }else if(phase==='hold'){wrapper.classList.add('is-fading');phase='next';later(600);}
  else{index=(index+1)%phrases.length;position=0;phase='typing';line.textContent='';wrapper.classList.remove('is-fading');later(250);}
 }
 function sync(){
  stop();scene.classList.toggle('is-paused',!active());
  if(reduced.matches){wrapper.classList.remove('is-fading');line.textContent=phrases[index];position=phrases[index].length;phase='hold';return;}
  if(active())later(phase==='hold'?4200:phase==='next'?600:150);
 }
 line.textContent=reduced.matches?phrases[0]:'';
 new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);reduced.addEventListener('change',sync);
 sync();return {sync};
})();

// Browser receives private profile data only after server authorization.
const catalog = {};
function clearCatalog(){for(const key of Object.keys(catalog))delete catalog[key];}
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
 if(!response.ok){if(data.restricted&&identity){identity={authenticated:true,restricted:true,user:identity.user,csrf,owned:[],access:[],journalAccess:[],directory:{},admin:{owner:false,permissions:[]},pending:0};routeVersion++;renderAccount();}throw Object.assign(Error(data.error || 'Archiv není dostupný.'),{status:response.status,restricted:!!data.restricted,uncertain:!!data.uncertain});}
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
 RPCalendar.sync();
 PersonalPointer.sync();
 SeasonAtmosphere.syncSession();
 Community.sync();
 UserChrome.refresh();
 const fingerprint=identity?JSON.stringify([identity.user,identity.restricted,identity.owned,identity.access,identity.journalAccess,identity.directory,new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague'}).format(new Date())]):'guest';
 if(fingerprint===accountFingerprint)return;accountFingerprint=fingerprint;
 document.body.classList.toggle('signed-in',!!identity);welcome.hidden=!identity;rail.hidden=!identity;
 document.body.classList.toggle('restricted-user',!!identity?.restricted);if(!identity?.restricted)RestrictedAccess.hide();
 accountControls.replaceChildren();
 if(!identity){clearCatalog();Community.purge();PortalPolish.closeCast();rail.replaceChildren();portal.replaceChildren();UserChrome.account();Holiday.update();return;}
 const photo=new Image(34,34);photo.src=identity.user.avatar;photo.alt='';accountControls.append(photo);
 const name=document.createElement('span');name.textContent=identity.user.name;accountControls.append(name);
 const logout=document.createElement('button');logout.type='button';logout.textContent='Odhlásit';logout.onclick=async()=>{
  if(!await Community.beforeLogout())return;
  logout.disabled=true;loggingOut=true;refreshVersion++;try{await api('/auth/logout',{method:'POST'});identity=null;csrf='';purgeProfile();Journal.purge();resetTrust();renderAccount();location.hash='';await route();}catch(error){setNotice(error.message);logout.disabled=false;}finally{loggingOut=false;}
 };accountControls.append(logout);
 if(identity.restricted){clearCatalog();UserChrome.account();RestrictedAccess.show();return;}
 const day=new Intl.DateTimeFormat('cs-CZ',{weekday:'long',timeZone:'Europe/Prague'}).format(new Date());
 const greeting={pondělí:'Krásné pondělí',úterý:'Krásné úterý',středa:'Krásnou středu',čtvrtek:'Krásný čtvrtek',pátek:'Krásný pátek',sobota:'Krásnou sobotu',neděle:'Krásnou neděli'};
 welcome.querySelector('h2').textContent=(greeting[day]||'Krásný den')+', '+identity.user.name+'.';
 const own=identity.owned[0],person=catalog[own];
 document.body.style.setProperty('--account-aura',person?.color||'#c88e4a');
 welcome.querySelector('p').textContent=person?'Tvůj příběh čeká, '+person.nickname+'.':'Vítej mezi příběhy, do kterých ti jejich hráči dovolí nahlédnout.';
 welcome.querySelector('.trust-open').hidden=!own;
 rail.innerHTML='<header class="cast-heading"><div><span class="eyebrow">ŠEST OSUDŮ. JEDEN HORIZONT.</span><h2>Příběhy kolem tebe<span aria-hidden="true">✦</span></h2><p>Známé tváře. Vlastní tajemství. Každý příběh otevírá důvěra.</p></div><span class="cast-count">'+String(Object.keys(catalog).length-(own?1:0)).padStart(2,'0')+'<small>DALŠÍCH PŘÍBĚHŮ</small></span></header><div class="cast-grid">'+Object.entries(catalog).filter(([key])=>key!==own).map(([key,p])=>'<a href="#'+key+'" class="private-medallion" style="--aura:'+p.color+'"><img src="'+mediaURL('icon-'+key+'.png',320)+'" alt="" width="180" height="180" loading="lazy" decoding="async"><span>'+escape(p.nickname)+'</span></a>').join('')+'</div><p class="cast-footnote">Příběh a deník mají vlastní povolení. O přístup můžeš požádat přímo hráče.</p>';
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
  clearCatalog();if(next&&!next.restricted)Object.assign(catalog,data.directory||{});
  if(directoryChanged&&activePerson)purgeProfile();
  identity=next;csrf=data.csrf||'';ready=true;renderAccount();
  if(identity?.restricted){RestrictedAccess.show();return;}
  if(!identity||activePerson&&!identity.access.includes(activePerson)||Journal.key&&!identity.journalAccess?.includes(Journal.key)){purgeProfile();Journal.purge();await route();}
  else if(initial||changed||Community.matches&&!Community.active||Community.active==='manage'&&!Community.allowed()||directoryChanged&&currentKey()||currentKey()&&activePerson!==currentKey()&&identity.access.includes(currentKey())||Journal.route&&!Journal.key)await route();
 }catch(error){if(version!==refreshVersion)return;ready=true;purgeProfile();Journal.purge({preserveDraft:true});Community.purge({preserveDraft:true});UserChrome.clearPrivate();if(initial){identity=null;renderAccount();selection.hidden=false;}setNotice(error.message);}
}
async function route(){
 const version=++routeVersion,journalMatch=Journal.route,key=journalMatch?.[1]||currentKey(),previous=activePerson;
 if(!ready)return;
 if(identity?.restricted){RestrictedAccess.show();return;}
 if(!await Community.beforeRoute())return;
 if(denial.open)denial.close();
 if(Community.matches){purgeProfile();Journal.purge();PortalPolish.closeCast();selection.hidden=true;portal.hidden=true;await Community.open();return;}
 Community.purge();
 if(!key){purgeProfile();Journal.purge();PortalPolish.loading('',false);PortalPolish.active(null);selection.hidden=!!identity;portal.hidden=!identity;document.title='New Horizon RP · Šest osudů, jeden horizont';window.scrollTo({top:0,behavior:'instant'});return;}
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
PortalPolish.init();Journal.init();Community.init();UserChrome.init();SeasonAtmosphere.init();Holiday.init();PersonalPointer.init();renderAccount();
const loginResult=new URLSearchParams(location.search).get('login');
if(loginResult){setNotice(loginResult==='failed'?'Přihlášení se nepodařilo. Ověř, že jsi členem vašeho Discord serveru, a zkus to znovu.':'Přihlášení bylo zrušeno.');history.replaceState(null,'',location.pathname+location.hash);}
refreshSession(true);
