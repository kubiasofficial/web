const Community=(()=>{
 let page,nav,generation=0,loadedHash='',view='',editorState=null,suspended=null,mailRequest=null,mailDraft=null;
 const labels={given:'Jméno',surname:'Příjmení',nickname:'Přezdívka',age:'Věk v lore',birth:'Datum narození',occupation:'Povolání',relatives:'Rodina a blízcí',kicker:'Motto',description:'Úvodní charakteristika',quote:'Osobní citát',closing:'Závěrečná slova',origin:'Původ',familyTitle:'Nadpis vztahů',familyDescription:'Úvod ke vztahům',chapters:'Kapitoly lore',family:'Vztahy'};
 const permissionLabels={review:'Schvalování změn',activity:'Přehled přihlášení',official:'Telegramy za správu',blacklist:'Správa blacklistu'};
 const icons={edit:'M5 19l4-1L20 7l-3-3L6 15zM14 7l3 3',mail:'M3 6h18v13H3zM3 6l9 7 9-7',admin:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',home:'M3 11l9-8 9 8M6 9v12h12V9',users:'M15 21v-3c0-5-12-5-12 0v3M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 5c5 0 5 7 0 7M18 15c3 0 3 3 3 6',clock:'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',check:'M4 12l5 5L20 6'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[name]+'"/></svg>';
 const stamp=state=>({pending:'Čeká na schválení',approved:'Schváleno',rejected:'Zamítnuto'}[state]||state);
 const date=t=>t?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(new Date(t*1000)):'Zatím nezaznamenáno';
 const routeMatch=()=>/^#(?:manage|edit|telegrams|gramophone|seasons)(?:\/|$)/.test(location.hash);
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
 function dirty(){if(view==='mail'){const v=mailValues();return !!v&&(!!v.subject||!!v.body);}return view==='edit'&&editorState&&JSON.stringify(values())!==editorState.baseline;}
 async function beforeLogout(){return !dirty()||await PortalPolish.confirm('Odhlásit a zahodit rozepsané změny?',view==='mail'?'Rozepsaný telegram nebyl odeslán.':'Neuložené změny postavy se zahodí. Uložený koncept zůstane zachovaný.','Odhlásit');}
 async function beforeRoute(){
  if(loadedHash!==location.hash&&dirty()&&!await PortalPolish.confirm(view==='mail'?'Zahodit rozepsaný telegram?':'Opustit rozepsanou postavu?',view==='mail'?'Neodeslaný text telegramu se zahodí.':'Neuložené změny se zahodí. Koncept uložený na serveru zůstane zachovaný.',view==='mail'?'Zahodit telegram':'Opustit editor')){history.replaceState(null,'',loadedHash);return false;}return true;
 }
 function purge({preserveDraft=false}={}){
  SeasonLab.dispose();Gramophone.detach();
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
  purge({preserveDraft:!!suspended||!!mailDraft});const version=++generation,user=identity?.user.id;loadedHash=location.hash;
  if(!identity){shell('Vstup do svého archivu','Pro správu postavy a telegramy se přihlas přes Discord.');content().innerHTML='<a class="web-button" href="'+loginHref+'">Přihlásit přes Discord</a>';return;}
  try{
   if(loadedHash.startsWith('#edit')){view='edit';shell('Tvůj příběh. Tvými slovy.','Uprav svou postavu. Zveřejní se až po schválení správou.','editor');menu([['#','Můj archiv','home'],['#edit','Upravit postavu','edit'],['#telegrams','Telegramy','mail']]);await editor(version,user);}
   else if(loadedHash.startsWith('#gramophone')){view='gramophone';shell('Gramofon','Desky, které dávají příběhům vlastní hlas.','gramophone');menu([['#','Můj archiv','home'],['#gramophone','Gramofon','home'],['#seasons','Roční období','clock']]);await Gramophone.open(content());}
   else if(loadedHash.startsWith('#seasons')){view='seasons';shell('Roční období','Atmosféra kroniky podle tebe.','seasons');menu([['#','Můj archiv','home'],['#gramophone','Gramofon','home'],['#seasons','Roční období','clock']]);await SeasonLab.open(content());}
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
  if(own){items.push(['#seasons','Roční období','clock'],['#gramophone','Gramofon','home']);menu(items);}
  const changes=page.querySelector('.community-menu a[href="#manage/requests"]');if(changes&&overview.pending){changes.classList.add('has-pending');changes.dataset.count=overview.pending;}
  const path=loadedHash.split('/');
  if(path[1]==='requests'){
   if(path[2]){await review(path[2],version,user);return;}
   const result=await api('/manage/requests?status='+(path[2]||'pending'));if(!valid(version,user))return;
   content().innerHTML='<div class="section-heading"><h2>Změny ke schválení</h2><span class="status-pill pending">'+result.requests.length+' čeká</span></div><p class="web-muted">Před rozhodnutím porovnej návrh se schválenou verzí.</p><div class="request-list">'+(result.requests.length?result.requests.map(r=>'<a class="request-card" href="#manage/requests/'+r.id+'"><img src="'+mediaURL('icon-'+r.character_key+'.png',320)+'" width="64" height="64" alt=""><div><h3>'+text(catalog[r.character_key].name)+'</h3><p>'+date(r.created_at)+'</p></div><span>Porovnat změny ↗</span></a>').join(''):'<div class="web-empty">'+icon('check')+'<h3>Všechny spisy jsou vyřízené.</h3><p>Nové žádosti se objeví tady.</p></div>')+'</div>';
  }else if(path[1]==='users'){
   const result=await api('/manage/users');if(!valid(version,user))return;
   content().innerHTML='<h2>Uživatelé a poslední přihlášení</h2><p class="web-muted">Čas posledního úspěšného přihlášení přes Discord. Obnovení stránky jej nemění.</p><div class="user-list">'+result.users.map(r=>'<article class="web-list-row">'+(r.avatar?'<img src="'+text(r.avatar)+'" width="44" height="44" alt="">':'')+'<div><strong>'+text(r.display_name)+'</strong><p>'+text(r.characters.map(k=>catalog[k].name).join(', ')||'Bez přiřazené postavy')+'</p></div><time>'+date(r.last_login)+'</time></article>').join('')+'</div>';
  }else if(path[1]==='seasons'){await SeasonLab.open(content());}
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
 function allowed(){if(/^#(?:gramophone|seasons)(?:\/|$)/.test(location.hash))return !!identity&&!identity.restricted;const path=location.hash.split('/')[1];if(path==='admins'||path==='seasons')return !!identity?.admin?.owner;const permission={requests:'review',audit:'review',users:'activity',mail:'official',blacklist:'blacklist'}[path];return permission?has(permission):!!identity?.admin?.owner||!!identity?.admin?.permissions.length;}
 return {init,sync,open,purge,beforeRoute,beforeLogout,get matches(){return routeMatch();},get active(){return view;},allowed};
})();
