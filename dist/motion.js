(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const selection=document.getElementById('selection');
 const cards=[...document.querySelectorAll('.medallion-card')];
 const gallery=document.querySelector('.medallion-cast');
 const controls=document.querySelector('.cast-gallery-controls');
 if(controls){
  const previous=controls.querySelector('.cast-gallery-prev'),next=controls.querySelector('.cast-gallery-next');
  const updateControls=()=>{
   controls.hidden=gallery.scrollWidth<=gallery.clientWidth+2;
   previous.disabled=gallery.scrollLeft<=2;
   next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-2;
  };
  const advance=direction=>gallery.scrollBy({left:direction*(cards[0].getBoundingClientRect().width+25),behavior:reduced.matches?'instant':'smooth'});
  previous.addEventListener('click',()=>advance(-1));next.addEventListener('click',()=>advance(1));
  gallery.addEventListener('scroll',updateControls,{passive:true});
  new ResizeObserver(updateControls).observe(gallery);
  updateControls();
 }
 let frame=0,latest=null;
 const reset=()=>{
  cancelAnimationFrame(frame);frame=0;latest=null;
  selection.style.removeProperty('--backdrop-x');selection.style.removeProperty('--backdrop-y');
  cards.forEach(card=>{card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');});
 };
 selection.addEventListener('pointermove',event=>{
  if(reduced.matches||!fine.matches||event.pointerType==='touch'||selection.hidden)return;
  latest={x:event.clientX,y:event.clientY,target:event.target};
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;if(!latest)return;
   selection.style.setProperty('--backdrop-x',((latest.x/innerWidth-.5)*12).toFixed(2)+'px');
   selection.style.setProperty('--backdrop-y',((latest.y/innerHeight-.5)*8).toFixed(2)+'px');
   const card=latest.target.closest('.medallion-card');
   if(card){const r=card.querySelector('.medallion-art').getBoundingClientRect();
    card.style.setProperty('--tilt-x',Math.max(-4,Math.min(4,-(latest.y-r.top-r.height/2)/r.height*8)).toFixed(2)+'deg');
    card.style.setProperty('--tilt-y',Math.max(-4,Math.min(4,(latest.x-r.left-r.width/2)/r.width*8)).toFixed(2)+'deg');
   }
  });
 },{passive:true});
 cards.forEach(card=>card.addEventListener('pointerleave',()=>{card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');}));
 selection.addEventListener('pointerleave',reset);
 reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
 addEventListener('hashchange',reset);
})();
