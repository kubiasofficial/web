// MEDIA_ASSETS is injected by the deterministic web build.
function mediaURL(name,width=640){const variants=MEDIA_ASSETS[name];if(!variants)return 'assets/'+name;return (variants.find(v=>v.width>=width)||variants.at(-1)).url;}
function mediaSrcset(name){return (MEDIA_ASSETS[name]||[]).map(v=>v.url+' '+v.width+'w').join(',');}
function mediaImage(image,name,sizes='220px',width=640){image.decoding='async';image.sizes=sizes;const set=mediaSrcset(name);if(set)image.srcset=set;image.src=mediaURL(name,width);}
function mediaBackground(name){return 'var(--asset-'+name.replace(/\.png$/,'').replace(/[^a-zA-Z0-9-]/g,'-')+')';}
let diaryFonts;
function loadDiaryFonts(){if(diaryFonts)return;diaryFonts=document.createElement('link');diaryFonts.rel='stylesheet';diaryFonts.href='https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Special+Elite&display=swap';document.head.append(diaryFonts);}

// Pausing decorative motion never affects route transitions or permission checks.
(()=>{
 const updateVisibility=()=>document.documentElement.classList.toggle('tab-hidden',document.hidden);
 document.addEventListener('visibilitychange',updateVisibility);updateVisibility();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('motion-offscreen',!e.isIntersecting)),{rootMargin:'100px'});
 const watched=new WeakSet();const watch=root=>{for(const e of root.querySelectorAll('.personal-scene,.frontier-atmosphere,.chronicle-atmosphere'))if(!watched.has(e)){watched.add(e);observer.observe(e);}};
 watch(document);new MutationObserver(list=>{for(const item of list)for(const node of item.addedNodes)if(node.nodeType===1){if(node.matches('.personal-scene,.frontier-atmosphere,.chronicle-atmosphere')&&!watched.has(node)){watched.add(node);observer.observe(node);}watch(node);}}).observe(document.body,{childList:true,subtree:true});
})();
