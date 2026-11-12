const PersonalPointer=(()=>{
 const defaults={cursor:true,clicks:true,touch:false},inputSelector='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"],[draggable="true"],iframe';
 let initialized=false,account=null,key=null,theme=null,prefs={...defaults},dialog=null,overlay=null,opener=null,lastStamp=-1000,device='',storageKey='';
 const memory=new Map(),effects=new Set(),fine=matchMedia('(any-pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),down=new Map();
 const game=()=>/^#games\/ustav(?:\/|$)/.test(location.hash);
 const uri=url=>'url("'+url+'") 2 1';
 function clear(){for(const e of effects)e.remove();effects.clear();down.clear();}
 function load(){let value=memory.get(account);try{const saved=storageKey?JSON.parse(localStorage.getItem(storageKey)):null;if(saved&&typeof saved==='object')value=saved;}catch{}prefs={...defaults};for(const k of Object.keys(defaults))if(typeof value?.[k]==='boolean')prefs[k]=value[k];}
 function apply(){
  const html=document.documentElement;delete html.dataset.personalPointer;
  html.style.removeProperty('--personal-cursor');html.style.removeProperty('--personal-link-cursor');
  if(!theme||!prefs.cursor||!fine.matches||game())return;
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
  if(!theme||document.hidden||(!preview&&game()))return;const now=performance.now();if(now-lastStamp<75)return;lastStamp=now;
  while(effects.size>=6){const old=effects.values().next().value;old.remove();effects.delete(old);}
  const node=document.createElement('span');node.className='personal-click-stamp';node.setAttribute('aria-hidden','true');node.dataset.theme=key;node.style.setProperty('--stamp-color',theme.color);
  const img=document.createElement('img');img.src=theme.stamp;img.alt='';img.width=44;img.height=44;img.draggable=false;node.append(img);
  const layer=target instanceof Element?target.closest('dialog[open]'):null;
  if(layer){const bounds=layer.getBoundingClientRect();node.style.left=(x-bounds.left+layer.scrollLeft)+'px';node.style.top=(y-bounds.top+layer.scrollTop)+'px';layer.append(node);}else{node.style.left=x+'px';node.style.top=y+'px';overlay.append(node);}
  effects.add(node);const remove=()=>{node.remove();effects.delete(node);};
  if(typeof node.animate==='function'){const motion=reduced.matches?[{opacity:.8},{opacity:0}]:[{opacity:0,transform:'translate(-50%,-50%) scale(.75)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.2},{opacity:0,transform:'translate(-50%,-50%) scale(1.08)'}];node.animate(motion,{duration:reduced.matches?260:520,easing:'ease-out'}).finished.then(remove,remove);}
  setTimeout(remove,650);
 }
 function pointerDown(e){setDevice(e.pointerType);if(!theme||document.hidden||game()||e.button!==0||!e.isPrimary)return;down.set(e.pointerId,{x:e.clientX,y:e.clientY,target:e.target});}
 function pointerUp(e){
  const start=down.get(e.pointerId);down.delete(e.pointerId);if(!start||!theme||!e.isPrimary||e.button!==0||game()||document.hidden)return;
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
  dialog.innerHTML='<button type="button" class="pointer-close dialog-close" aria-label="Zavřít vzhled a efekty">×</button><span class="eyebrow">TVŮJ KURZOR. TVOJE STOPA.</span><h2 id="pointer-settings-title">Vzhled a efekty</h2><p class="pointer-theme-name"></p><div class="pointer-preview-art"></div><fieldset><legend>Osobní ovládání</legend><label><input type="checkbox" name="cursor"><span>Vlastní kurzor<small>Tvůj motiv při ovládání myší.</small></span></label><label><input type="checkbox" name="clicks"><span>Efekt kliknutí<small>Krátká stopa v místě kliknutí.</small></span></label><label><input type="checkbox" name="touch"><span>Efekty při dotyku<small>Volitelné pro telefon, tablet a pero. Posouvání stránky stopy nevytváří.</small></span></label></fieldset><div class="pointer-preview-zone"><button type="button" class="web-button" data-pointer-preview>Vyzkoušet stopu</button></div><p class="pointer-settings-note">Při psaní, přetahování a u karetního stolu zůstává běžné ovládání. Efekty jsou bez zvuku a respektují omezení pohybu.</p><p class="pointer-settings-status" role="status"></p>';
  document.body.append(dialog);dialog.querySelector('.pointer-close').onclick=close;dialog.addEventListener('close',()=>{clear();if(opener?.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('change',e=>{if(!theme||!Object.hasOwn(defaults,e.target.name))return;prefs[e.target.name]=e.target.checked;save();});
  dialog.querySelector('[data-pointer-preview]').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();stamp(e.detail?e.clientX:r.x+r.width/2,e.detail?e.clientY:r.y+r.height/2,e.currentTarget,true);};
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
  document.addEventListener('pointerover',e=>setDevice(e.pointerType),{passive:true});document.addEventListener('pointerdown',pointerDown,{passive:true,capture:true});document.addEventListener('pointerup',pointerUp,{passive:true,capture:true});document.addEventListener('pointercancel',e=>down.delete(e.pointerId),{passive:true});
  document.addEventListener('dragstart',()=>down.clear(),{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();close();}});window.addEventListener('blur',()=>{clear();close();});
  window.addEventListener('hashchange',()=>{if(game())clear();close();apply();});window.addEventListener('storage',e=>{if(storageKey&&e.key===storageKey){load();clear();apply();if(dialog.open)for(const k of Object.keys(defaults))dialog.querySelector('[name='+k+']').checked=prefs[k];}});
  fine.addEventListener('change',apply);reduced.addEventListener('change',clear);sync();
 }
 return{init,sync,open,close};
})();
