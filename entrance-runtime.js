// Public copy only. One cancellable timer; no work while hidden, logged in or motion-reduced.
const EntranceTypewriter=(()=>{
 const scene=document.querySelector('.frontier-entrance'),line=scene?.querySelector('.entrance-typed'),wrapper=scene?.querySelector('.entrance-typewriter');
 if(!line)return;
 const phrases=['Jak začneš dnešní příběh ty?','Některé cesty začínají jediným rozhodnutím.','Komu dnes svěříš své tajemství?','Minulost už nezměníš. Další kapitolu ano.','Za obzorem čeká příběh, který ještě nikdo nenapsal.'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let timer=0,index=0,position=0,phase='typing';
 const stop=()=>{clearTimeout(timer);timer=0;};
 const active=()=>!document.hidden&&!scene.hidden&&!document.body.classList.contains('signed-in');
 function later(delay){stop();if(active()&&!reduced.matches)timer=setTimeout(tick,delay);}
 function tick(){
  timer=0;if(!active()||reduced.matches)return;
  if(phase==='typing'){
   line.textContent=phrases[index].slice(0,++position);
   if(position>=phrases[index].length){phase='hold';later(4200);}
   else later(/[.,?]/.test(phrases[index][position-1])?200:48+(position%4)*11);
  }else if(phase==='hold'){wrapper.classList.add('is-fading');phase='next';later(600);}
  else{index=(index+1)%phrases.length;position=0;phase='typing';line.textContent='';wrapper.classList.remove('is-fading');later(250);}
 }
 function sync(){
  stop();scene.classList.toggle('is-paused',!active());
  if(reduced.matches){wrapper.classList.remove('is-fading');line.textContent=phrases[index];position=phrases[index].length;phase='hold';return;}
  if(active())later(phase==='hold'?4200:phase==='next'?600:150);
 }
 line.textContent=reduced.matches?phrases[0]:'';
 new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);reduced.addEventListener('change',sync);
 sync();return {sync};
})();
