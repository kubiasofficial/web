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
   const person=catalog[key];page.style.setProperty('--aura',person.color);page.dataset.character=key;PlayerHub.apply();
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
