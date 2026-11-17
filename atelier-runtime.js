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
