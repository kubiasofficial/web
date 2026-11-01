// Browser receives private profile data only after server authorization.
const catalog = window.PUBLIC_PEOPLE;
let identity = null, csrf = '', ready = false, routeVersion = 0, refreshVersion = 0, loggingOut = false;
const apiRoot = '/api/ubd';
const deniedText = 'Děláš si prdel? Takto se informace nezískávají. Nejsi hoden znát toto info, takže si naser :D';
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
denial.innerHTML='<button class="dialog-close" type="button" aria-label="Zavřít">×</button><img width="180" height="180" alt=""><p class="eyebrow">SOUKROMÝ ARCHIV</p><h2 id="denial-title"></h2><p class="denial-motto"></p><p class="denial-copy"></p><a class="discord-login" href="'+loginHref+'">Přihlásit přes Discord</a><p class="denial-hint"></p><button class="denial-back" type="button">Zpět k postavám</button>';
document.body.append(denial);
function purgeProfile(){
 profile.hidden=true;profile.innerHTML=profileTemplate;activePerson=null;
 for(const key of Object.keys(people))delete people[key];
 window.VisualReading?.syncVisibility(null);
}
function currentKey(){const hash=location.hash;return Object.keys(catalog).find(key=>hash==='#'+key||hash.startsWith('#'+key+'-'))||((hash==='#pribeh'||/^#kapitola-\d+$/.test(hash))?'nathaniel':null);}
function setNotice(text){notice.textContent=text;notice.hidden=!text;}
function deny(key,message=deniedText){
 purgeProfile();selection.hidden=!!identity;portal.hidden=!identity;
 const person=catalog[key];denial.style.setProperty('--aura',person.color);
 denial.querySelector('img').src='assets/icon-'+key+'.png';
 denial.querySelector('h2').textContent=person.name;denial.querySelector('.denial-motto').textContent=person.motto;
 denial.querySelector('.denial-copy').textContent=message;
 denial.querySelector('.discord-login').hidden=!!identity;
 denial.querySelector('.denial-hint').textContent=identity?'O nahlédnutí požádej přímo hráče této postavy. Povolení může udělit ve svém archivu.':'Přihlas se a vstup do svého příběhu. Cizí archiv otevře jen jeho majitel.';
 if(!denial.open)denial.showModal();document.title='Soukromý archiv · New Horizon RP';
}
function closeDenial(){denial.close();location.hash='';}
denial.querySelector('.dialog-close').onclick=closeDenial;denial.querySelector('.denial-back').onclick=closeDenial;
denial.addEventListener('cancel',event=>{event.preventDefault();closeDenial();});
function renderAccount(){
 document.body.classList.toggle('signed-in',!!identity);welcome.hidden=!identity;rail.hidden=!identity;
 accountControls.replaceChildren();
 if(!identity){const login=document.createElement('a');login.href=loginHref;login.className='discord-login';login.textContent='Přihlásit přes Discord';accountControls.append(login);return;}
 const photo=new Image(34,34);photo.src=identity.user.avatar;photo.alt='';accountControls.append(photo);
 const name=document.createElement('span');name.textContent=identity.user.name;accountControls.append(name);
 const logout=document.createElement('button');logout.type='button';logout.textContent='Odhlásit';logout.onclick=async()=>{
  logout.disabled=true;loggingOut=true;refreshVersion++;try{await api('/auth/logout',{method:'POST'});identity=null;csrf='';purgeProfile();trust.close();renderAccount();location.hash='';await route();}catch(error){setNotice(error.message);logout.disabled=false;}finally{loggingOut=false;}
 };accountControls.append(logout);
 const day=new Intl.DateTimeFormat('cs-CZ',{weekday:'long',timeZone:'Europe/Prague'}).format(new Date());
 const greeting={pondělí:'Krásné pondělí',úterý:'Krásné úterý',středa:'Krásnou středu',čtvrtek:'Krásný čtvrtek',pátek:'Krásný pátek',sobota:'Krásnou sobotu',neděle:'Krásnou neděli'};
 welcome.querySelector('h2').textContent=(greeting[day]||'Krásný den')+', '+identity.user.name+'.';
 const own=identity.owned[0],person=catalog[own];
 document.body.style.setProperty('--account-aura',person?.color||'#c88e4a');
 welcome.querySelector('p').textContent=person?'Tvůj příběh čeká, '+person.nickname+'.':'Vítej mezi příběhy, do kterých ti jejich hráči dovolí nahlédnout.';
 welcome.querySelector('.trust-open').hidden=!own;
 rail.innerHTML='<a class="private-home" href="#" aria-label="Můj prostor">✦</a>'+Object.entries(catalog).filter(([key])=>key!==own).map(([key,p])=>'<a href="#'+key+'" class="private-medallion" style="--aura:'+p.color+'" aria-label="'+escape(p.name)+' — '+(identity.access.includes(key)?'Přístup udělen':'Uzamčeno')+'"><img src="assets/icon-'+key+'.png" alt="" width="64" height="64"><span>'+escape(p.nickname)+'<small>'+(identity.access.includes(key)?'PŘÍSTUP UDĚLEN':'UZAMČENO')+'</small></span></a>').join('');
 portal.innerHTML='<section class="personal-scene" style="--aura:'+(person?.color||'#c88e4a')+'">'+(person?'<img class="personal-portrait" src="assets/'+person.image+'" alt="'+escape(person.name)+'" width="1024" height="1536">':'<img class="personal-emblem" src="assets/NH.png" alt="New Horizon RP">')+'<div class="personal-copy"><span class="eyebrow">'+(person?'PŘÍBĚH, O KTERÉM ROZHODUJEŠ TY':'KAŽDÁ DŮVĚRA MÁ SVŮJ PŘÍBĚH')+'</span><h1>'+(person?escape(person.given)+'<strong>'+escape(person.surname)+'</strong>':'Vítej v archivu')+'</h1>'+(person?'<p class="personal-signature">'+escape(person.nickname)+'</p><p>'+escape(person.motto)+'</p><a class="story-button" href="#'+own+'">Otevřít můj příběh <span>↗</span></a>':'<p>Po straně najdeš všechny postavy. Jejich příběhy si přečteš, pokud ti je hráči zpřístupní.</p>')+'<p class="personal-privacy">'+(person?'Tvůj archiv je soukromý. Ostatní do něj vstoupí pouze s tvým svolením.':'Přihlášení samo o sobě cizí příběhy neodemyká.')+'</p></div></section>';
}
async function refreshSession(initial=false){
 if(loggingOut)return;const version=++refreshVersion;
 try{
  const data=await api('/auth/session');if(version!==refreshVersion)return;const next=data.authenticated?data:null,changed=identity?.user.id!==next?.user.id;
  if(changed){purgeProfile();trust.close();trustGeneration++;}
  identity=next;csrf=data.csrf||'';ready=true;renderAccount();
  if(!identity||activePerson&&!identity.access.includes(activePerson)){purgeProfile();await route();}
  else if(initial||changed||currentKey()&&activePerson!==currentKey()&&identity.access.includes(currentKey()))await route();
 }catch(error){if(version!==refreshVersion)return;ready=true;purgeProfile();if(initial){identity=null;renderAccount();selection.hidden=false;}setNotice(error.message);}
}
async function route(){
 const version=++routeVersion,key=currentKey(),previous=activePerson;
 if(!ready)return;
 if(denial.open)denial.close();
 if(!key){purgeProfile();selection.hidden=!!identity;portal.hidden=!identity;document.title='New Horizon RP · Sedm osudů, jeden horizont';window.scrollTo({top:0,behavior:'instant'});return;}
 if(!identity){deny(key);return;}
 if(!identity.access.includes(key)){deny(key);return;}
 if(activePerson!==key){
  purgeProfile();setNotice('Ověřuji přístup k příběhu…');
  try{
   const data=await api('/archive/lore/'+key);if(version!==routeVersion||document.hidden)return;
   people[key]=data.person;renderProfile(key);setNotice('');
  }catch(error){if(version!==routeVersion)return;if([401,403].includes(error.status))deny(key);else{setNotice(error.message);portal.hidden=false;}return;}
 }
 selection.hidden=true;portal.hidden=true;profile.hidden=false;window.VisualReading?.syncVisibility(key);document.title=catalog[key].name+' · New Horizon RP';
 if(previous!==key&&motionAllowed())profile.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
 requestAnimationFrame(()=>{if(location.hash==='#'+key)window.scrollTo({top:0,behavior:'instant'});else document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});});
}
const trust=document.createElement('dialog');trust.className='trust-dialog';trust.setAttribute('aria-labelledby','trust-title');
trust.innerHTML='<button type="button" class="dialog-close" aria-label="Zavřít">×</button><span class="eyebrow">TVŮJ PŘÍBĚH. TVÁ DŮVĚRA.</span><h2 id="trust-title">Komu důvěřuji</h2><p>Povolení platí pouze pro čtení tvého lore. Můžeš ho kdykoliv odebrat.</p><form class="trust-form"><label>Vyber hráče<select name="known"><option value="">Jiný člen Discordu — zadat ID</option></select></label><label>Discord ID<input name="userId" inputmode="numeric" pattern="[0-9]{17,20}" maxlength="20" required placeholder="ID hráče z vašeho serveru"></label><button type="submit">Najít hráče</button></form><div class="trust-candidate" hidden></div><p class="trust-status" role="status" aria-live="polite"></p><div class="trust-list"></div>';
document.body.append(trust);trust.querySelector('.dialog-close').onclick=()=>trust.close();
let trustKey=null,trustGeneration=0;
function trustStatus(text){trust.querySelector('.trust-status').textContent=text;}
async function loadGrants(){
 const data=await api('/archive/grants/'+trustKey);const list=trust.querySelector('.trust-list');list.replaceChildren();
 if(!data.grants.length){const empty=document.createElement('p');empty.textContent='Zatím do tvého archivu nikdo další nesmí.';list.append(empty);}
 for(const grant of data.grants){
  const row=document.createElement('div');row.className='trust-person';const img=new Image(40,40);img.src=grant.avatar;img.alt='';
  const label=document.createElement('span');label.textContent=grant.display_name;const button=document.createElement('button');button.type='button';button.textContent='Odebrat přístup';
  button.onclick=async()=>{button.disabled=true;try{await api('/archive/grants/'+trustKey+'/'+grant.grantee_id,{method:'DELETE'});trustStatus('Přístup byl odebrán.');await loadGrants();}catch(error){trustStatus(error.message);button.disabled=false;}};
  row.append(img,label,button);list.append(row);
 }
}
welcome.querySelector('.trust-open').onclick=async()=>{
 trustKey=identity?.owned[0];if(!trustKey)return;trustGeneration++;trustStatus('Načítám přístupy…');trust.querySelector('.trust-candidate').hidden=true;
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
  button.onclick=async()=>{button.disabled=true;try{await api('/archive/grants/'+trustKey,{method:'POST',body:JSON.stringify({userId:data.user.id})});box.hidden=true;trustStatus('Nahlížení bylo povoleno.');await loadGrants();}catch(error){trustStatus(error.message);button.disabled=false;}};
  box.append(img,name,button);box.hidden=false;trustStatus('Je to správný člověk? Potvrď povolení.');
 }catch(error){trustStatus(error.message);}
};
window.addEventListener('hashchange',route);
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!profile.hidden)location.hash='';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){routeVersion++;purgeProfile();}else refreshSession(true);});
window.addEventListener('pageshow',event=>{if(event.persisted){routeVersion++;purgeProfile();refreshSession(true);}});
setInterval(()=>{if(!document.hidden&&identity)refreshSession();},15000);
renderAccount();
const loginResult=new URLSearchParams(location.search).get('login');
if(loginResult){setNotice(loginResult==='failed'?'Přihlášení se nepodařilo. Ověř, že jsi členem vašeho Discord serveru, a zkus to znovu.':'Přihlášení bylo zrušeno.');history.replaceState(null,'',location.pathname+location.hash);}
refreshSession(true);
