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
  for(const selector of ['.nav-profile','.nav-shop','.nav-calendar'])nav.querySelector(selector).hidden=!!identity?.restricted;
  const groups=[['Moje postava',['.nav-profile','.portal-home','.nav-journal','.nav-edit','.nav-trust']],['Náš svět',['.cast-toggle','.nav-mail','.nav-atlas']],['Volný čas',['.nav-gramophone','.nav-games','.nav-calendar','.nav-shop']],['Nastavení',['.nav-seasons','.notification-settings','.menu-logout']],['Správa',['.nav-manage']]];
  const fresh=[];for(const[label,selectors]of groups){const section=document.createElement('section');section.className='account-menu-group';const title=document.createElement('h3');title.textContent=label;section.append(title);for(const selector of selectors){const e=nav.querySelector(selector);if(e)section.append(e);}fresh.push(section);}
  nav.querySelectorAll('.account-menu-group').forEach(e=>e.remove());nav.append(...fresh);
 }
 function init(){
  nav=document.querySelector('.portal-navigation');nav.id='user-navigation';nav.classList.add('profile-navigation');nav.inert=true;nav.setAttribute('aria-hidden','true');
  host=document.createElement('div');host.className='user-chrome';document.querySelector('.masthead').append(host);host.append(accountControls,nav);
  const preferenceButton=document.createElement('button');preferenceButton.type='button';preferenceButton.className='notification-settings';preferenceButton.innerHTML=bell+'Upozornění';preferenceButton.onclick=openSettings;nav.append(preferenceButton);
  for(const[cls,href,label,symbol]of [['profile','#player','Moje vizitka','♙'],['journal','#','Můj deník','▤'],['calendar','#calendar','Prosincová pošta','✉'],['shop','#shop','Ústavní krámek','◈']]){const a=document.createElement('a');a.className='nav-'+cls;a.href=href;a.innerHTML='<span class="menu-symbol" aria-hidden="true">'+symbol+'</span>'+label;nav.append(a);}
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
  logout.classList.add('menu-logout');nav.append(logout);arrangeMenu();trigger.onclick=()=>host.classList.contains('user-menu-open')?closeMenu():openMenu();refresh();
 }
 function refresh(){
  if(birthdayKey&&(!identity||!identity.access.includes(birthdayKey)))closeBirthday();
  if(!identity){closeMenu();return;}
  if(!trigger)return;
  PlayerHub.sync();Holiday.update();
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
