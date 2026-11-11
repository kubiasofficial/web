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
 function apply(){if(!host)return;season=(suspended||festive||identity?.restricted)?'off':mode==='auto'?current():mode;host.dataset.season=season;document.documentElement.dataset.season=season;holes=[];frost();paint(performance.now());}
 function configure(next,level){mode=modes.includes(next)?next:'auto';strength=Math.min(100,Math.max(10,Number(level)||45));try{localStorage.setItem('nh-season',JSON.stringify({mode,strength}));}catch{}apply();Holiday.update();}
 function init(){
  if(host)return;try{const saved=JSON.parse(localStorage.getItem('nh-season'));if(saved&&modes.includes(saved.mode)){mode=saved.mode;strength=Math.min(100,Math.max(10,Number(saved.strength)||45));}}catch{}
  reduced=matchMedia('(prefers-reduced-motion: reduce)');host=document.createElement('div');host.className='season-global';host.setAttribute('aria-hidden','true');host.innerHTML='<span class="season-global-light"></span><canvas></canvas>';document.body.append(host);canvas=host.querySelector('canvas');ctx=canvas.getContext('2d');
  const melt=event=>{if(season!=='winter'||document.hidden)return;const p={x:event.clientX/innerWidth,y:event.clientY/innerHeight,t:performance.now()},last=holes.at(-1);if(last&&Math.hypot((last.x-p.x)*innerWidth,(last.y-p.y)*innerHeight)<10)return;holes.push(p);if(holes.length>70)holes.shift();if(reduced.matches)paint(p.t);else schedule();};
  window.addEventListener('pointermove',melt,{passive:true});window.addEventListener('pointerdown',melt,{passive:true});window.addEventListener('resize',fit,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():apply());reduced.addEventListener('change',()=>paint(performance.now()));fit();apply();
 }
 function syncSession(){const next=(suspended||festive||identity?.restricted)?'off':mode==='auto'?current():mode;if(host&&season!==next)apply();}
 return{init,configure,syncSession,festive(value){if(festive===!!value)return;festive=!!value;apply();},suspend(value){suspended=!!value;apply();},get mode(){return mode;},get strength(){return strength;}};
})();
