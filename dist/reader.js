/* Presentation enhancements: original biography content remains in app.js/lore files. */
(() => {
 const profile=document.getElementById('profile');
 const toolbar=document.querySelector('.reader-toolbar');
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const icons={
  rail:'M13 5v38M35 5v38M9 11h30M9 21h30M9 31h30M9 41h30',
  stable:'M14 8C4 17 6 35 15 40h18c9-5 11-23 1-32l-6 6c7 10 5 17 1 20H19c-4-3-6-10 1-20zM13 20h3M32 20h3M14 29h3M31 29h3',
  letter:'M6 13h36v25H6zM6 13l18 15 18-15M6 38l14-13M42 38L28 25M31 7l7 4',
  ranch:'M6 40h36M10 40V21l14-13 14 13v19M7 24h34M19 40V28h10v12M18 17h12',
  woods:'M13 40V23M35 40V27M13 6L4 24h18zM35 12L25 29h20zM20 42h10',
  law:'M24 5l5 11 12 1-8 10 3 12-12-6-12 6 3-12-8-10 12-1zM19 22h10M24 17v11'
 };
 let activeKey=null,lastChapter=null,frame=0,transitionLayer=null;
 let chapterObserver=null;
 const cleanTitle=title=>title.replace(/^[IVXLCDM]+\.\s*/,'').replace(/\s*\([^)]*\)\s*$/,'');
 function figure(key,scene,escape){
  return `<figure class="scene-figure${scene.side?' scene-side':''}"><div class="scene-media" style="--scene-row:${scene.row}"><img src="${mediaURL(key+'-scenes.png',1600)}" srcset="${mediaSrcset(key+'-scenes.png')}" sizes="(max-width:700px) 95vw, 800px" alt="${escape(scene.title)}" loading="lazy" decoding="async" width="1254" height="1254"></div><figcaption>${escape(scene.title)}<span>ILUSTRACE K PŘÍBĚHU</span></figcaption></figure>`;
 }
 function update(){
  frame=0;
  if(!activeKey||profile.hidden){toolbar.hidden=true;return;}
  const story=document.getElementById('story');
  const rect=story.getBoundingClientRect();
  const position=innerHeight*.29;
  const amount=Math.max(0,Math.min(100,Math.round((position-rect.top)/Math.max(1,rect.height)*100)));
  const meter=document.querySelector('.reading-meter');
  meter.setAttribute('aria-valuenow',String(amount));
  meter.querySelector('b').textContent=amount+' %';
  meter.querySelector('.meter-track>span').style.width=amount+'%';
  const chapters=[...story.querySelectorAll('.chapter')];
  let current=chapters[0];
  chapters.forEach(chapter=>{if(chapter.getBoundingClientRect().top<=position)current=chapter;});
  document.querySelectorAll('#chapter-nav a').forEach(a=>{
   const selected=!!current&&a.hash==='#'+current.id;
   a.classList.toggle('active',selected);
   if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
  if(current&&lastChapter!==current.id){
   lastChapter=current.id;
   const nav=document.getElementById('chapter-nav');
   const link=nav.querySelector('a[aria-current]');
   if(link&&nav.scrollHeight>nav.clientHeight){
    const itemRect=link.getBoundingClientRect(),navRect=nav.getBoundingClientRect();
    if(itemRect.top<navRect.top||itemRect.bottom>navRect.bottom)nav.scrollTop+=itemRect.top-navRect.top-nav.clientHeight/2;
   }
  }
  toolbar.hidden=document.querySelector('.story-shell').getBoundingClientRect().top>Math.min(240,innerHeight*.25);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 window.VisualReading={
  render(key,person,helpers){
   activeKey=key;lastChapter=null;
   chapterObserver?.disconnect();
   const theme=person.visualTheme,escape=helpers.escapeHTML;
   profile.querySelectorAll('.chronicle-seal,.chronicle-atmosphere,.relation-medallion').forEach(node=>node.remove());
   {
    profile.querySelector('.profile-hero').insertAdjacentHTML('afterbegin','<div class="chronicle-atmosphere" aria-hidden="true"><div class="chronicle-fog"></div>'+Array.from({length:12},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</div>');
    profile.querySelector('.profile-heading').insertAdjacentHTML('afterbegin','<div class="chronicle-seal"><img src="'+mediaURL('icon-'+key+'.png',320)+'" alt="" width="96" height="96"><span>NEW HORIZON ARCHIVES<small>'+escape(theme.world.toUpperCase())+'</small></span></div>');
    profile.querySelectorAll('.family-members>div').forEach((card,index)=>{
     const member=person.family[index];
     if(member.href)card.insertAdjacentHTML('afterbegin','<a class="relation-medallion" href="'+member.href+'" aria-label="'+escape(member.name)+'"><img src="'+mediaURL('icon-'+member.href.slice(1)+'.png',320)+'" alt="" width="100" height="100" loading="lazy"></a>');
    });
   }
   const photo=profile.querySelector('.sidebar-portrait img');mediaImage(photo,'icon-'+key+'.png','180px',320);
   photo.alt='Portrét: '+person.name;
   profile.querySelector('.sidebar-signature').textContent=person.nickname;
   profile.querySelector('.sidebar-identity>.eyebrow').textContent='OSOBNÍ SPIS № '+person.number;
   profile.querySelector('.sidebar-identity h2').textContent=person.name;
   profile.querySelector('.sidebar-world').textContent=theme.world;
   const mainCount=person.storyChapterCount||6;
   document.getElementById('chapter-nav').innerHTML=person.chapters.map((chapter,index)=>{
    const year=chapter.title.match(/\(([^)]*\d[^)]*)\)/)?.[1]||(index<mainCount?'PŘÍBĚH':'OSOBNÍ SPIS');
    return `<a href="#${helpers.chapterID(key,index)}"><span class="nav-step">${String(index+1).padStart(2,'0')}</span><span class="nav-copy"><small>${escape(year)}</small><span>${escape(cleanTitle(chapter.title))}</span></span></a>`;
   }).join('');
   const chapters=[...document.querySelectorAll('#story>.chapter')];
   if(!reduced()&&'IntersectionObserver' in window){
    chapterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     entry.target.animate([{opacity:.65,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'ease-out'});
     chapterObserver.unobserve(entry.target);
    }),{threshold:.05});
    chapters.forEach(chapter=>chapterObserver.observe(chapter));
   }
   theme.scenes.forEach(scene=>{
    const chapter=chapters[scene.at];if(!chapter)return;
    if(scene.side)chapter.querySelector('h2').insertAdjacentHTML('afterend',figure(key,scene,escape));
    else chapter.insertAdjacentHTML('afterbegin',figure(key,scene,escape));
   });
   const note=`<aside class="identity-note note-${theme.kind}" aria-label="Svět postavy"><div class="note-heading"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="${icons[theme.kind]}"/></svg><div><small>SVĚT POSTAVY</small><h3>${escape(theme.title)}</h3></div></div><p>${escape(theme.note)}</p><div class="note-tags">${theme.tags.map(tag=>'<span>'+escape(tag)+'</span>').join('')}</div></aside>`;
   if(chapters[mainCount])chapters[mainCount].insertAdjacentHTML('beforebegin',note);else document.getElementById('story').insertAdjacentHTML('beforeend',note);
   const details=document.querySelector('.chapter-list');details.open=!matchMedia('(max-width:900px)').matches;
   document.querySelector('.toolbar-name').textContent=person.name;
   document.querySelector('.toolbar-top').href='#'+key;
   toolbar.style.setProperty('--gold',getComputedStyle(profile).getPropertyValue('--gold'));
   document.querySelectorAll('#chapter-nav a').forEach(a=>a.addEventListener('click',()=>{if(matchMedia('(max-width:900px)').matches)details.open=false;}));
   schedule();
  },
  syncVisibility(key){activeKey=key;if(!key){toolbar.hidden=true;chapterObserver?.disconnect();lastChapter=null;}schedule();}
 };
 document.querySelectorAll('.medallion-card').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced())return;
  requestAnimationFrame(()=>profile.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'}));
 }));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
})();
