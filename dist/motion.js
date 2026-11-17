(()=>{
 const entrance=document.querySelector('.frontier-entrance');if(!entrance)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine) and (min-width: 1101px)');
 let frame=0,x=0,y=0;
 function reset(){cancelAnimationFrame(frame);frame=0;x=y=0;entrance.style.removeProperty('--poster-x');entrance.style.removeProperty('--poster-y');}
 entrance.addEventListener('pointermove',event=>{
  if(reduced.matches||!fine.matches||entrance.hidden)return;
  x=(event.clientX/innerWidth-.5)*8;y=(event.clientY/innerHeight-.5)*6;
  if(!frame)frame=requestAnimationFrame(()=>{frame=0;entrance.style.setProperty('--poster-x',x.toFixed(2)+'px');entrance.style.setProperty('--poster-y',y.toFixed(2)+'px');});
 },{passive:true});
 entrance.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
