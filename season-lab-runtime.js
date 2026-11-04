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
 function change(value){season=value==='auto'?currentSeason():value;holes=[];stage.dataset.season=season;feedback.textContent=season==='winter'?'Přejeď myší nebo se dotkni skla. Vyčištěná stopa později znovu namrzne.':season==='off'?'Náhled je vypnutý.':'Soukromý náhled: '+seasons[season]+'.';stop();paint(performance.now());}
 async function open(container){
  dispose();const user=identity?.user.id;await api('/manage/experiments');if(identity?.user.id!==user||!container.isConnected||identity?.restricted)return;
  disposed=false;season='off';strength=65;visible=true;reduced=matchMedia('(prefers-reduced-motion: reduce)');
  container.innerHTML='<div class="section-heading"><h2>Sezónní laboratoř</h2><span class="status-pill">JEN TVŮJ NÁHLED</span></div><p class="web-muted">Zkoušej atmosféru přímo na skle kroniky. Ostatním hráčům se vzhled nemění.</p><div class="season-controls"><label>Roční období<select class="season-choice"><option value="off">Bez efektu</option><option value="auto">Podle aktuálního období</option><option value="spring">Jaro</option><option value="summer">Léto</option><option value="autumn">Podzim</option><option value="winter">Zima · zamrzlé sklo</option></select></label><label>Síla efektu <output class="season-level">65 %</output><input class="season-strength" type="range" min="10" max="100" value="65"></label><button class="web-button frost-reset" type="button">Obnovit námrazu</button><button class="web-button season-off" type="button">Vypnout náhled</button></div><section class="season-stage" data-season="off" aria-label="Náhled sezónní atmosféry"><div class="season-landscape" aria-hidden="true"></div><div class="season-sunlight" aria-hidden="true"></div><div class="season-preview-copy"><span class="eyebrow">SEDM OSUDŮ · JEDEN HORIZONT</span><h3>Příběhy pod<br>stejným nebem.</h3><p class="season-greeting">Tvoje kronika. Tvoje atmosféra.</p><button type="button" class="web-button season-click-test">Zkusit tlačítko ↗</button><span class="season-click-result" role="status"></span></div><canvas class="season-canvas" aria-hidden="true"></canvas></section><p class="season-feedback" role="status"></p>';
  stage=container.querySelector('.season-stage');canvas=stage.querySelector('canvas');ctx=canvas.getContext('2d');feedback=container.querySelector('.season-feedback');
  const greetings={spring:'Ráno voní novým začátkem.',summer:'Slunce zlátne nad cestami kroniky.',autumn:'Za okny padá listí. Tvůj příběh pokračuje.',winter:'Za zamrzlým sklem příběhy neutichají.',off:'Tvoje kronika. Tvoje atmosféra.'};
  container.querySelector('select').onchange=event=>{change(event.target.value);stage.querySelector('.season-greeting').textContent=greetings[season];};
  container.querySelector('.season-strength').oninput=event=>{strength=Number(event.target.value);container.querySelector('output').textContent=strength+' %';drawFrost();stop();paint(performance.now());};
  container.querySelector('.frost-reset').onclick=()=>{container.querySelector('select').value='winter';change('winter');};container.querySelector('.season-off').onclick=()=>{container.querySelector('select').value='off';change('off');};
  stage.querySelector('.season-click-test').onclick=()=>stage.querySelector('.season-click-result').textContent='Klikání funguje i přes námrazu.';
  const melt=event=>{if(season!=='winter')return;const r=stage.getBoundingClientRect(),p={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height,time:performance.now()},last=holes.at(-1);if(last&&Math.hypot((last.x-p.x)*r.width,(last.y-p.y)*r.height)<9)return;holes.push(p);if(holes.length>100)holes.shift();paint(p.time);};stage.addEventListener('pointermove',melt,{passive:true});stage.addEventListener('pointerdown',melt,{passive:true});
  observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)paint(performance.now());else stop();});observer.observe(stage);resize=new ResizeObserver(fit);resize.observe(stage);watchVisibility=()=>{if(document.hidden)stop();else if(visible)paint(performance.now());};document.addEventListener('visibilitychange',watchVisibility);watchReduced=()=>{stop();paint(performance.now());};reduced.addEventListener('change',watchReduced);fit();change('off');
 }
 return{open,dispose};
})();
