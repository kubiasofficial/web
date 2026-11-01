const PortalPolish = (() => {
 let loader, confirmation, resolveConfirmation=null, flyout, castToggle, openTrigger=null, closeTimer;
 const playerNames={daniel:'Eidík',nathaniel:'kubiasofficial',vincent:'BuFu',elijah:'mata20_official',katie:'Safík Alex',scarlett:'Graciie04',sophie:'🐭Myška🐭'};
 const names=new Map(), pendingNames=new Map();
 const avatars=new Map();
 function closeCast(){clearTimeout(closeTimer);if(openTrigger)openTrigger.setAttribute('aria-expanded','false');openTrigger=null;if(flyout)flyout.hidden=true;}
 function positionCard(){if(!openTrigger)return;const rect=openTrigger.getBoundingClientRect();flyout.style.left=(Math.max(rect.right,rail.getBoundingClientRect().right)+10)+'px';flyout.style.top=Math.max(85,Math.min(innerHeight-flyout.offsetHeight-16,rect.top-12))+'px';}
 function openCast(anchor){
  if(!anchor)return;clearTimeout(closeTimer);if(openTrigger!==anchor)closeCast();openTrigger=anchor;const key=anchor.dataset.playerKey,p=catalog[key];
  anchor.setAttribute('aria-expanded','true');flyout.style.setProperty('--aura',p.color);flyout.querySelector('strong').textContent=p.name;
  flyout.querySelector('.rail-player').textContent=names.get(key)||playerNames[key];const avatar=flyout.querySelector('.rail-avatar');avatar.hidden=!avatars.has(key);if(avatars.has(key))avatar.src=avatars.get(key);
  const links=flyout.querySelectorAll('a');links[0].href='#'+key;links[1].href='#journal-'+key;
  links[0].querySelector('small').textContent=identity.access.includes(key)?'Přístup udělen':'Uzamčeno';links[1].querySelector('small').textContent=identity.journalAccess?.includes(key)?'Přístup udělen':'Uzamčeno';
  flyout.hidden=false;positionCard();loadName(key);
 }
 function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!flyout.matches(':hover')&&!rail.matches(':hover')&&!flyout.contains(document.activeElement)&&!rail.contains(document.activeElement))closeCast();},180);}
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
  flyout=document.createElement('section');flyout.id='cast-card';flyout.className='cast-card';flyout.hidden=true;flyout.setAttribute('aria-label','Postava a její archiv');flyout.innerHTML='<span class="eyebrow">OSOBNÍ SPIS</span><strong></strong><div class="rail-player-row"><img class="rail-avatar" width="34" height="34" alt="" hidden><span class="rail-player"></span></div><div class="cast-card-actions"><a><span>Příběh ↗</span><small></small></a><a class="rail-journal"><span>Deník ↗</span><small></small></a></div>';document.body.append(flyout);
  castToggle=document.createElement('button');castToggle.type='button';castToggle.className='cast-toggle';castToggle.textContent='✦ Postavy';castToggle.setAttribute('aria-expanded','false');rail.id='private-cast';castToggle.setAttribute('aria-controls',rail.id);document.body.append(castToggle);castToggle.onclick=()=>{const on=document.body.classList.toggle('cast-open');castToggle.setAttribute('aria-expanded',String(on));if(!on)closeCast();};
  const hover=event=>{const anchor=event.target.closest('[data-player-key]');if(anchor)openCast(anchor);};
  rail.addEventListener('pointerover',hover);rail.addEventListener('focusin',hover);
  rail.addEventListener('click',event=>{const anchor=event.target.closest('[data-player-key]');if(anchor){event.preventDefault();openCast(anchor);}else if(event.target.closest('.private-home')){closeCast();document.body.classList.remove('cast-open');castToggle.setAttribute('aria-expanded','false');}});
  rail.addEventListener('pointerleave',scheduleClose);rail.addEventListener('focusout',scheduleClose);flyout.addEventListener('pointerleave',scheduleClose);flyout.addEventListener('focusout',scheduleClose);flyout.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
  flyout.addEventListener('click',event=>{if(event.target.closest('a')){closeCast();document.body.classList.remove('cast-open');castToggle.setAttribute('aria-expanded','false');}});
  document.addEventListener('pointerdown',event=>{if(!rail.contains(event.target)&&!flyout.contains(event.target)&&event.target!==castToggle){closeCast();document.body.classList.remove('cast-open');castToggle.setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&openTrigger){const trigger=openTrigger;closeCast();trigger.focus();closeCast();}});
  rail.addEventListener('keydown',event=>{if((event.key==='ArrowRight'||event.key==='Tab'&&!event.shiftKey)&&openTrigger&&event.target===openTrigger){event.preventDefault();flyout.querySelector('a').focus();}});
  flyout.addEventListener('keydown',event=>{if(event.key==='Tab'&&openTrigger){const links=flyout.querySelectorAll('a');if(event.shiftKey&&event.target===links[0]){event.preventDefault();openTrigger.focus();}else if(!event.shiftKey&&event.target===links[1]){event.preventDefault();const triggers=[...rail.querySelectorAll('[data-player-key]')],next=triggers[triggers.indexOf(openTrigger)+1];closeCast();(next||castToggle.offsetParent&&castToggle||document.querySelector('.trust-open')).focus();}}});
  window.addEventListener('resize',positionCard);rail.addEventListener('scroll',positionCard);window.addEventListener('hashchange',closeCast);
 }
 async function loadName(key){
  if(!key||names.has(key)||pendingNames.has(key))return;
  const promise=api('/players/'+key).then(data=>{if(typeof data.name==='string')names.set(key,data.name);if(typeof data.avatar==='string'&&data.avatar.startsWith('https://cdn.discordapp.com/'))avatars.set(key,data.avatar);if(openTrigger?.dataset.playerKey===key){flyout.querySelector('.rail-player').textContent=names.get(key)||playerNames[key];const avatar=flyout.querySelector('.rail-avatar');avatar.hidden=!avatars.has(key);if(avatars.has(key))avatar.src=avatars.get(key);}}).catch(()=>{}).finally(()=>pendingNames.delete(key));pendingNames.set(key,promise);
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
  for(const anchor of rail.querySelectorAll('.private-medallion')){
   const key=anchor.hash.slice(1),p=catalog[key],allowed=identity.access.includes(key),journal=identity.journalAccess?.includes(key);
   anchor.dataset.playerKey=key;anchor.classList.toggle('is-unlocked',allowed);anchor.classList.toggle('is-locked',!allowed);
   const status=document.createElement('span');status.className='medallion-status';status.innerHTML=allowed?seal:lock;anchor.append(status);
   anchor.querySelector('span:not(.medallion-status)')?.remove();anchor.setAttribute('role','button');anchor.setAttribute('aria-expanded','false');anchor.setAttribute('aria-controls','cast-card');anchor.setAttribute('aria-label',p.name+' — otevřít nabídku');anchor.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();openCast(anchor);}});
   const wrapper=document.createElement('div');wrapper.className='private-member';wrapper.style.setProperty('--aura',p.color);anchor.replaceWith(wrapper);wrapper.append(anchor);
  }
 }
 function loading(key,on=true){loader.hidden=!on;if(on){loader.style.setProperty('--aura',catalog[key]?.color||'#bd965b');loader.querySelector('img').src='assets/icon-'+key+'.png';}}
 function active(key,kind='lore'){
  closeCast();rail.querySelectorAll('.private-member').forEach(member=>member.classList.toggle('member-current',member.querySelector('[data-player-key]')?.dataset.playerKey===key));
  rail.querySelectorAll('.private-medallion,.rail-journal').forEach(link=>{const match=kind==='journal'?link.hash==='#journal-'+key:link.hash==='#'+key;link.classList.toggle('is-current',match);if(match)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 }
 function revealProfile(key){
  let journalLink=profile.querySelector('.profile-journal-link');if(!journalLink){journalLink=document.createElement('a');journalLink.className='profile-journal-link';profile.querySelector('.profile-heading .story-button').after(journalLink);}journalLink.href='#journal-'+key;journalLink.innerHTML=book(key,true)+'<span>Osobní deník ↗</span>';
  if(motionAllowed()){profile.querySelector('.hero-character').animate([{opacity:0,transform:'translateX(35px) scale(1.015)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.65,.25,1)'});profile.querySelector('.profile-heading').animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'ease-out'});}
 }
 return {init,account,loading,active,book,confirm:confirmAction,cancelConfirmation:()=>{if(resolveConfirmation)settle(false);},revealProfile};
})();
