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
  surface.configure({...state(),caps:host.querySelector('[name=caps]').checked,falling:!festive||host.querySelector('[name=snow]').checked,mode:festive&&source!=='city'&&host.querySelector('[name=snow]').checked?'winter':selected});
  stage.querySelector('.weather-greeting').textContent=festive?'Klidný vánoční večer, '+identity.user.name+'.':selected==='autumn'?'Za okny padá listí. Příběh pokračuje.':selected==='rain'?'Venku prší. Uvnitř čeká tvůj příběh.':'Šest osudů. Jeden horizont.';
  host.querySelector('.weather-mode-label').textContent=festive?'Vánoční náhled':modes[selected];stage.classList.toggle('weather-no-caps',!host.querySelector('[name=caps]').checked);stage.classList.toggle('weather-no-snow',!host.querySelector('[name=snow]').checked);
  // Decoration and animation remain scoped to the demo, never to the live portal.
  host.querySelector('.weather-source-note').textContent=source==='city'?(city?'Počasí: '+city.name+' · '+(currentWeather||'čekáme na údaje')+(weatherAt?' · ověřeno '+new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit'}).format(new Date(weatherAt)):''):'Vyber město nebo dobrovolně použij polohu.'):'Náhled používá '+(source==='season'?'aktuální roční období.':'ručně zvolenou atmosféru.');
  save();
 }
 function weatherType(code){return [71,73,75,77,85,86].includes(code)?'winter':[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)?'rain':'off';}
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
  try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:query.trim().slice(0,80),count:6,language:'cs',format:'json'}),{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error();const data=await r.json();if(!valid(v)||sv!==searchVersion)return;for(const result of data.results||[]){if(!Number.isFinite(result.latitude)||!Number.isFinite(result.longitude))continue;const b=document.createElement('button');b.type='button';b.className='web-button';b.textContent=[result.name,result.admin1,result.country].filter(Boolean).join(' · ');b.onclick=()=>{city={name:b.textContent,latitude:Number(result.latitude.toFixed(2)),longitude:Number(result.longitude.toFixed(2))};results.replaceChildren();host.querySelector('[name=source]').value=source='city';weather();};results.append(b);}status(results.children.length?'Vyber město z výsledků.':'Město se nepodařilo najít. Zkus jiný název.');}
  catch{if(valid(v)&&sv===searchVersion)status('Města teď nelze načíst. Ruční náhled funguje dál.');}finally{clearTimeout(timeout);}
 }
 function locate(){
  if(!navigator.geolocation){status('Prohlížeč polohu nepodporuje. Použij vyhledání města.');return;}const v=version;status('Polohu použijeme pouze po tvém souhlasu.');
  navigator.geolocation.getCurrentPosition(p=>{if(!valid(v))return;city={name:'Moje přibližná poloha',latitude:Number(p.coords.latitude.toFixed(2)),longitude:Number(p.coords.longitude.toFixed(2))};source='city';host.querySelector('[name=source]').value=source;weather();},()=>{if(valid(v))status('Poloha není dostupná nebo nebyla povolena. Můžeš zadat město ručně.');},{enableHighAccuracy:false,timeout:10000,maximumAge:15*60000});
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
  host.querySelector('[name=mode]').onchange=e=>{source='manual';host.querySelector('[name=source]').value=source;mode=e.target.value;weatherVersion++;clearTimeout(timer);fetchController?.abort();render();};
  host.querySelector('[name=source]').onchange=e=>{source=e.target.value;weatherVersion++;clearTimeout(timer);fetchController?.abort();mode=source==='city'?'off':host.querySelector('[name=mode]').value;if(source==='city'&&city)weather();render();};
  host.querySelector('[name=strength]').oninput=e=>{strength=Number(e.target.value);host.querySelector('output').textContent=strength+' %';render();};
  host.querySelector('[name=city]').oninput=e=>{clearTimeout(searchTimer);searchVersion++;searchController?.abort();const q=e.target.value;searchTimer=setTimeout(()=>{if(valid(v))search(q);},450);};
  host.querySelector('.weather-locate').onclick=locate;host.querySelector('.weather-reset').onclick=()=>surface.reset();host.querySelector('.weather-stop').onclick=()=>{weatherVersion++;clearTimeout(timer);fetchController?.abort();source='manual';mode='off';host.querySelector('[name=source]').value=source;host.querySelector('[name=mode]').value=mode;host.querySelector('[name=christmas]').checked=false;host.querySelector('[name=sounds]').checked=false;sound?.suspend();render();};
  host.querySelectorAll('.weather-demo button').forEach(b=>b.onclick=()=>{stage.querySelector('.weather-click-feedback').textContent='Tlačítko funguje — výzdoba nebrání ovládání.';chime();});
  render();if(source==='city'&&city)weather();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);fetchController?.abort();sound?.suspend();}else if(host&&source==='city')weather();});
 return{open,dispose,weatherType,festiveDate,get stats(){return surface?.stats||null;}};
})();
