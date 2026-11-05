const Atlas=(()=>{
 const categories={home:['⌂','Domov'],ranch:['♞','Ranč'],shop:['⚖','Obchod'],camp:['△','Tábor'],memory:['✦','Vzpomínka'],danger:['!','Nebezpečí'],other:['◆','Jiné']};
 let host,map,layer,resize,generation=0,places=[],chosen=null,picking=false,loading;
 const esc=escapeHTML;
 function dirty(){const form=host?.querySelector('.atlas-form');return !!form&&!!chosen&&[...new FormData(form)].some(([key,value])=>value!==String(chosen[key]??''));}
 function dispose(){generation++;resize?.disconnect();map?.remove();map=null;host=null;places=[];chosen=null;picking=false;}
 function library(){
  if(window.L)return Promise.resolve();if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   if(!document.querySelector('[data-atlas-style]')){const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';css.dataset.atlasStyle='';document.head.append(css);}
   const script=document.createElement('script');script.src='vendor/leaflet/leaflet.js';const timer=setTimeout(()=>{script.remove();loading=null;reject(Error('Mapa se nenačetla. Obnov stránku a zkus to znovu.'));},15000);
   script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();loading=null;reject(Error('Mapový prohlížeč se nepodařilo načíst.'));};document.head.append(script);
  });return loading;
 }
 function status(message){if(host)host.querySelector('.atlas-status').textContent=message;}
 function filtered(){const q=host.querySelector('.atlas-search').value.trim().toLocaleLowerCase('cs'),category=host.querySelector('.atlas-category').value;return places.filter(p=>(!category||p.category===category)&&(!q||(p.title+' '+p.description).toLocaleLowerCase('cs').includes(q)));}
 function render(){
  if(!host||!map)return;layer.clearLayers();const list=host.querySelector('.atlas-list');list.replaceChildren();const rows=filtered();host.querySelector('.atlas-count').textContent=rows.length+' / '+places.length+' míst';
  for(const p of rows){
   const b=document.createElement('button');b.type='button';b.className='atlas-place'+(chosen?.id===p.id?' selected':'');b.innerHTML='<span style="color:'+p.color+'">'+categories[p.category][0]+'</span><span><strong>'+esc(p.title)+'</strong><small>'+categories[p.category][1]+'</small></span>';b.onclick=()=>select(p);list.append(b);
   const marker=L.marker([p.lat,p.lng],{title:p.title,icon:L.divIcon({className:'atlas-marker-wrap',html:'<span class="atlas-marker" style="--pin:'+p.color+'">'+categories[p.category][0]+'</span>',iconSize:[38,44],iconAnchor:[19,42]})}).addTo(layer);marker.on('click',()=>select(p));
  }
  if(!rows.length)list.innerHTML='<p class="atlas-empty">'+(places.length?'Žádné místo neodpovídá hledání.':'Tvůj atlas je zatím nepopsaný. Přidej první místo na mapu.')+'</p>';
 }
 function panel(){const p=host.querySelector('.atlas-detail');p.hidden=false;return p;}
 function close(){host.querySelector('.atlas-detail').hidden=true;chosen=null;picking=false;host.classList.remove('atlas-picking');render();}
 function select(place){
  picking=false;host.classList.remove('atlas-picking');chosen=place;map.panTo([place.lat,place.lng],{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});render();
  const p=panel();p.innerHTML='<button class="atlas-close" type="button" aria-label="Zavřít detail">×</button><span class="eyebrow">'+categories[place.category][1]+' · SOUKROMÉ MÍSTO</span><h2>'+esc(place.title)+'</h2>'+(place.image_url?'<img class="atlas-photo" src="'+esc(place.image_url)+'" alt="Fotografie místa" referrerpolicy="no-referrer" loading="lazy">':'')+'<p class="atlas-description">'+esc(place.description||'Bez poznámky.')+'</p><div class="atlas-actions"><button class="web-button atlas-edit" type="button">Upravit</button><button class="web-button atlas-delete" type="button">Odstranit</button></div><p class="atlas-feedback" role="status"></p>';
  p.querySelector('.atlas-close').onclick=close;p.querySelector('.atlas-edit').onclick=()=>edit(place);p.querySelector('.atlas-photo')?.addEventListener('error',event=>{event.target.hidden=true;p.querySelector('.atlas-feedback').textContent='Fotografie není dostupná.';});
  p.querySelector('.atlas-delete').onclick=async event=>{if(!await PortalPolish.confirm('Odstranit místo?',place.title+' bude z atlasu odstraněno.','Odstranit'))return;event.target.disabled=true;try{await api('/atlas/places/'+place.id,{method:'DELETE',body:JSON.stringify({revision:place.revision})});if(!host)return;await reload();if(host)close();}catch(error){if(host){p.querySelector('.atlas-feedback').textContent=error.message;event.target.disabled=false;}}};
 }
 function edit(place){
  chosen=place;const p=panel();p.innerHTML='<button class="atlas-close" type="button" aria-label="Zavřít formulář">×</button><span class="eyebrow">TVŮJ ATLAS · SOUKROMÉ MÍSTO</span><h2>'+(place.id?'Upravit místo':'Nová značka')+'</h2><form class="atlas-form"><label>Název<input name="title" maxlength="100" required value="'+esc(place.title||'')+'"></label><label>Druh místa<select name="category">'+Object.entries(categories).map(([k,v])=>'<option value="'+k+'"'+(k===place.category?' selected':'')+'>'+v[1]+'</option>').join('')+'</select></label><label>Poznámka<textarea name="description" maxlength="4000" rows="4">'+esc(place.description||'')+'</textarea></label><label>Barva značky<input name="color" type="color" value="'+(place.color||'#b98a49')+'"></label><label>Fotografie · odkaz HTTPS<input name="image_url" type="url" maxlength="1500" placeholder="https://…" value="'+esc(place.image_url||'')+'"></label><p class="web-muted">V náhledu vidíš místa pouze ty. Sdílení hráčům zatím není zapnuté.</p><button class="web-button primary" type="submit">Uložit místo ↗</button><p class="atlas-feedback" role="status"></p></form>';
  p.querySelector('.atlas-close').onclick=close;
  p.querySelector('form').onsubmit=async event=>{event.preventDefault();const version=generation,form=event.currentTarget,b=form.querySelector('[type=submit]'),data=Object.fromEntries(new FormData(form));b.disabled=true;
   try{const saved=await api('/atlas/places'+(place.id?'/'+place.id:''),{method:place.id?'PUT':'POST',body:JSON.stringify({...data,lat:place.lat,lng:place.lng,revision:place.revision})});if(version!==generation)return;await reload();if(version!==generation)return;select(places.find(row=>row.id===saved.id));status('Místo bylo uloženo do tvého atlasu.');}catch(error){if(version===generation){p.querySelector('.atlas-feedback').textContent=error.message;b.disabled=false;}}
  };p.querySelector('input').focus({preventScroll:true});
 }
 async function reload(){const version=generation,result=await api('/atlas/places');if(version!==generation)return;places=result.places;render();}
 async function open(container){
  dispose();if(!identity?.admin?.owner||identity.restricted)throw Error('Atlas je zatím pouze pro vlastníka webu.');host=container;const version=generation;
  host.innerHTML='<div class="atlas-toolbar"><div><span class="eyebrow">TAM, KDE ZAČÍNAJÍ PŘÍBĚHY</span><h2>Atlas pohraničí</h2></div><span class="status-pill">SOUKROMÝ NÁHLED</span><button class="web-button atlas-add" type="button">+ Přidat místo</button></div><p class="atlas-status" role="status">Načítám mapu a tvoje místa…</p><div class="atlas-workspace"><aside class="atlas-index"><label>Hledat místo<input type="search" class="atlas-search" placeholder="Název nebo poznámka…"></label><label>Kategorie<select class="atlas-category"><option value="">Všechna místa</option>'+Object.entries(categories).map(([k,v])=>'<option value="'+k+'">'+v[1]+'</option>').join('')+'</select></label><div class="atlas-index-heading"><span class="atlas-count"></span><button class="atlas-reset web-button" type="button">Celá mapa</button></div><div class="atlas-list"></div></aside><div class="atlas-map-shell"><div class="atlas-map" aria-label="Mapa světa Red Dead Redemption 2"></div><span class="atlas-compass" aria-hidden="true">N<br>✥</span></div><aside class="atlas-detail" hidden></aside></div><p class="atlas-source">Podklad: Rockstar Games · Neoficiální fanouškovský atlas. Mapové obrázky se načítají z externího zdroje až při otevření.</p>';
  const [result]=await Promise.all([api('/atlas/places'),library()]);if(version!==generation||!host?.isConnected)return;places=result.places;
  const bounds=[[-144,0],[0,176]],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  map=L.map(host.querySelector('.atlas-map'),{crs:L.CRS.Simple,minZoom:2,maxZoom:7,maxBounds:[[-155,-15],[15,191]],maxBoundsViscosity:.9,zoomAnimation:!reduced,fadeAnimation:!reduced}).fitBounds(bounds);
  const tiles=L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg',{bounds,noWrap:true,maxNativeZoom:6,maxZoom:7,attribution:'Map © <a href="https://www.rockstargames.com/" target="_blank" rel="noopener noreferrer">Rockstar Games</a>',referrerPolicy:'no-referrer',keepBuffer:1}).addTo(map);
  let tileErrors=0;tiles.on('tileerror',()=>{tileErrors++;if(tileErrors>3)status('Část mapového podkladu není dostupná. Zkus mapu otevřít později; uložená místa zůstávají zachovaná.');});
  layer=L.layerGroup().addTo(map);resize=new ResizeObserver(()=>map?.invalidateSize({pan:false}));resize.observe(host.querySelector('.atlas-map'));
  host.querySelector('.atlas-search').oninput=render;host.querySelector('.atlas-category').onchange=render;host.querySelector('.atlas-reset').onclick=()=>map.fitBounds(bounds);
  host.querySelector('.atlas-add').onclick=()=>{close();picking=true;host.classList.add('atlas-picking');status('Vyber bod kliknutím nebo klepnutím na mapu. Tlačítkem Escape výběr zrušíš.');};
  map.on('click',event=>{if(!picking)return;const {lat,lng}=event.latlng;if(lat< -144||lat>0||lng<0||lng>176){status('Vyber místo uvnitř mapy.');return;}picking=false;host.classList.remove('atlas-picking');status('Doplň název a poznámku k místu.');edit({lat,lng,category:'home',color:'#b98a49'});});
  host.onkeydown=event=>{if(event.key==='Escape'){close();status('Výběr byl zavřen.');}};
  status('Tvoje vlastní místa na skutečné mapě RDR2. Začni tlačítkem Přidat místo.');render();
 }
 return {open,dispose,dirty};
})();
