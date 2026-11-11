// Audio belongs to the application, never to a route's DOM tree.
const Gramophone=(()=>{
 let root=null,audio=null,dock=null,tracks=[],selected=null,busy=false,volume=.65,viewVersion=0,action=0,message='',owner=null;
 const flights=new Set(),authorized=()=>!!identity&&!identity.restricted;
 let pendingEnd=false;
 function advance(){if(!selected||!authorized())return;if(busy){pendingEnd=true;return;}pendingEnd=false;const next=MusicPlaylists.next(selected);if(next){if(next.id===selected.id){audio.currentTime=0;const t=action;audio.play().catch(()=>{if(t===action)status('Pro pokračování klikni na Přehrát.');});}else select(next,true);}else if(root?.isConnected)putAway();else stop();}
 const label=track=>'<span class="vinyl"><span class="vinyl-label"><b>'+escapeHTML(track.title)+'</b></span></span>';
 const time=value=>Number.isFinite(value)?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'0:00';
 function status(text){message=text;update();}
 function cancelFlights(){for(const animation of flights)animation.cancel();flights.clear();document.querySelectorAll('.record-flight').forEach(e=>e.remove());}
 function detach(){MusicPlaylists.detach();MusicCommunity.dispose();viewVersion++;cancelFlights();root=null;update();}
 function stop(){pendingEnd=false;MusicPlaylists.clearQueue();action++;busy=false;selected=null;message='Deska je zpátky ve sbírce.';if(audio){audio.pause();audio.removeAttribute('src');audio.load();}update();}
 function dispose(){detach();stop();MusicPlaylists.reset();audio?.remove();audio=null;dock?.remove();dock=null;owner=null;tracks=[];if('mediaSession' in navigator){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}}
 function syncSession(){if(!authorized()||owner&&owner!==identity.user.id)dispose();}
 function initAudio(){
  if(audio)return;owner=identity.user.id;audio=document.createElement('audio');audio.preload='metadata';audio.hidden=true;audio.className='gramophone-audio';audio.volume=volume;document.body.append(audio);
  dock=document.createElement('aside');dock.className='gramophone-dock';dock.hidden=true;dock.setAttribute('aria-label','Hudba na pozadí');
  dock.innerHTML='<a href="#gramophone" class="dock-open"><span aria-hidden="true">♫</span><span class="dock-title"></span></a><button type="button" class="dock-pause" aria-label="Pozastavit hudbu">Ⅱ</button><button type="button" class="dock-stop" aria-label="Vypnout hudbu">×</button>';
  document.body.append(dock);dock.querySelector('.dock-pause').onclick=playPause;dock.querySelector('.dock-stop').onclick=stop;
  for(const event of ['loadedmetadata','durationchange','timeupdate','play','pause','playing','waiting'])audio.addEventListener(event,update);
  audio.addEventListener('ended',advance);
  audio.addEventListener('error',()=>{if(selected)status('Skladbu se nepodařilo přehrát. Zkus ji spustit znovu.');});
  if('mediaSession' in navigator){for(const [name,handler]of [['play',()=>{if(audio?.paused)playPause();}],['pause',()=>audio?.pause()],['stop',stop],['seekto',event=>{if(audio&&Number.isFinite(audio.duration)&&Number.isFinite(event.seekTime))audio.currentTime=Math.min(audio.duration,Math.max(0,event.seekTime));}]])try{navigator.mediaSession.setActionHandler(name,handler);}catch{}}
 }
 function update(){
  if(!audio)return;const playing=!!selected&&!audio.paused&&!audio.ended;
  if(dock){dock.hidden=!selected||!!root?.isConnected||!authorized();dock.querySelector('.dock-title').textContent=selected?.title||'';dock.querySelector('.dock-pause').textContent=playing?'Ⅱ':'▶';dock.querySelector('.dock-pause').setAttribute('aria-label',playing?'Pozastavit hudbu':'Přehrát hudbu');}
  if('mediaSession' in navigator)navigator.mediaSession.playbackState=selected?(playing?'playing':'paused'):'none';
  document.body.classList.toggle('has-background-music',!!dock&&!dock.hidden);
  if(!root?.isConnected)return;
  root.querySelector('.gramophone-now-title').textContent=selected?.title||'Vyber si desku';root.querySelector('.gramophone-artist').textContent=selected?.artist||'Hudební místnost New Horizon';
  const deck=root.querySelector('.deck-record');deck.hidden=!selected||busy;deck.classList.toggle('is-spinning',playing&&!document.hidden);if(selected&&deck.dataset.id!==selected.id){deck.innerHTML=label(selected);deck.dataset.id=selected.id;}
  root.querySelector('.tonearm').classList.toggle('is-lowered',!!selected);
  const play=root.querySelector('.gramophone-play');play.textContent=playing?'Pozastavit':'Přehrát';play.disabled=!selected||busy;root.querySelector('.gramophone-stop').disabled=!selected||busy;
  const seek=root.querySelector('.gramophone-position');seek.disabled=!selected||!Number.isFinite(audio.duration)||busy;seek.value=Number.isFinite(audio.duration)&&audio.duration>0?String(audio.currentTime/audio.duration*1000):'0';root.querySelector('.gramophone-current').textContent=time(audio.currentTime);root.querySelector('.gramophone-duration').textContent=time(audio.duration);
  root.querySelector('.gramophone-status').textContent=message||'Klikni na desku a nech kroniku rozeznít.';
  root.querySelectorAll('.record-card').forEach(card=>{card.classList.toggle('is-selected',selected?.id===card.dataset.id);card.querySelector('button').disabled=busy;});
 }
 async function fly(track,toDeck){
  if(!root?.isConnected||!motionAllowed()||document.hidden)return;
  const stage=root.querySelector('.gramophone-stage').getBoundingClientRect(),token=root.querySelector('.record-card[data-id="'+track.id+'"] .record-token')?.getBoundingClientRect();if(!token)return;
  const size=stage.width*.32,deck={x:stage.left+stage.width*.555,y:stage.top+stage.height*.612},shelf={x:token.left+token.width/2,y:token.top+token.height/2};
  const transform=(p,sx,sy)=>'translate('+(p.x-size/2)+'px,'+(p.y-size/2)+'px) scale('+sx+','+sy+')';
  const start=transform(shelf,token.width/size,token.height/size),end=transform(deck,1,.28),flight=document.createElement('div');flight.className='record-flight';flight.style.width=size+'px';flight.innerHTML=label(track);document.body.append(flight);
  const animation=flight.animate(toDeck?[{transform:start,opacity:1},{transform:end,opacity:1}]:[{transform:end,opacity:1},{transform:start,opacity:1}],{duration:720,easing:'cubic-bezier(.22,.68,.25,1)',fill:'both'});flights.add(animation);try{await animation.finished;}catch{}finally{flights.delete(animation);flight.remove();}
 }
 async function select(track,fromQueue=false){
  if(busy||!authorized())return;if(!fromQueue)MusicPlaylists.pick(track);if(selected?.id===track.id){await playPause();return;}
  initAudio();const t=++action;busy=true;selected=track;message='Pokládám desku na gramofon…';audio.src=track.url;audio.load();
  if('mediaSession' in navigator&&typeof MediaMetadata!=='undefined')navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:'New Horizon RP'});
  // play() runs in the click gesture, before asynchronous animation work.
  const playback=audio.play().then(()=>{if(t===action)status('Právě hraje · '+track.title);},error=>{if(t===action)status(error.name==='NotAllowedError'?'Deska je připravená. Klikni na Přehrát.':'Zvuk není dostupný. Zkus skladbu spustit znovu.');});
  update();if(root){const stage=root.querySelector('.gramophone-stage'),r=stage.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)stage.scrollIntoView({block:'center',behavior:'instant'});}
  await fly(track,true);if(t===action){busy=false;update();if(pendingEnd)advance();}await playback;
 }
 async function playPause(){
  if(!audio||!selected||busy||!authorized())return;if(!audio.paused){audio.pause();status('Pozastaveno · '+selected.title);return;}
  const t=action;try{if(audio.error){audio.src=selected.url;audio.load();}await audio.play();if(t===action&&selected)status('Právě hraje · '+selected.title);}catch{if(t===action)status('Přehrávání se nepodařilo spustit. Zkus Přehrát znovu.');}
 }
 async function putAway(){
  if(!selected||busy)return;const t=++action,track=selected;busy=true;audio.pause();status('Zvedám raménko a uklízím desku…');if(root)root.querySelector('.tonearm').classList.remove('is-lowered');await fly(track,false);if(t===action)stop();
 }
 async function open(container){
  detach();if(!authorized())throw Error('Pro poslech se přihlas přes Discord.');const v=viewVersion,user=identity.user.id;
  const response=await fetch('/music-library.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Hudební sbírku se nepodařilo načíst.');const library=await response.json();
  if(v!==viewVersion||!authorized()||identity.user.id!==user||!container.isConnected)return;
  tracks=Array.isArray(library.tracks)?library.tracks.filter(t=>/^[a-f0-9]{20}$/.test(t.id)&&/^\/music\/[a-f0-9]{20}\.[a-f0-9]{16}\.(mp3|wav|m4a|ogg)$/.test(t.url)&&typeof t.title==='string'):[];initAudio();root=container;
  root.innerHTML='<section class="gramophone-page"><div class="gramophone-intro"><div><span class="eyebrow">HUDEBNÍ MÍSTNOST · NEW HORIZON</span><h2>Nech kroniku rozeznít.</h2></div></div><div class="gramophone-player"><div class="gramophone-stage"><img class="gramophone-art" src="'+mediaURL('gramophone.png',1600)+'" srcset="'+mediaSrcset('gramophone.png')+'" sizes="(max-width:700px) 95vw, 850px" alt="Starožitný mosazný gramofon na dřevěném podstavci" width="1536" height="1024"><div class="deck-record" hidden></div><span class="tonearm" aria-hidden="true"></span></div><section class="gramophone-controls" aria-label="Ovládání gramofonu"><h3 class="gramophone-now-title"></h3><p class="gramophone-artist"></p><div class="gramophone-buttons"><button type="button" class="web-button primary gramophone-play" disabled>Přehrát</button><button type="button" class="web-button gramophone-stop" disabled>Vypnout a uklidit</button></div><div class="gramophone-seek"><span class="gramophone-current">0:00</span><input type="range" class="gramophone-position" min="0" max="1000" value="0" aria-label="Pozice ve skladbě" disabled><span class="gramophone-duration">0:00</span></div><label class="gramophone-volume">Hlasitost<input type="range" min="0" max="100" value="'+Math.round(volume*100)+'" aria-label="Hlasitost"></label><p class="gramophone-status" role="status"></p></section></div><div class="section-heading"><h2>Naše sbírka</h2><span class="gramophone-count"></span></div><p class="music-community-message" role="status" aria-live="polite"></p><div class="record-shelf"></div><p class="web-muted">Hudba hraje dál i při čtení příběhů nebo po přepnutí záložky. Zastavíš ji tady nebo malým přehrávačem na pozadí.</p></section>';
  root.querySelector('.gramophone-count').textContent=tracks.length+' '+(tracks.length===1?'deska':tracks.length>=2&&tracks.length<=4?'desky':'desek');
  const shelf=root.querySelector('.record-shelf');if(!tracks.length)shelf.innerHTML='<p class="gramophone-empty">První desky už jsou na cestě.</p>';
  for(const track of tracks){const card=document.createElement('article');card.className='record-card';card.dataset.id=track.id;card.innerHTML='<button type="button" class="record-pick" aria-label="Přehrát: '+escapeHTML(track.title)+'"><span class="record-token">'+label(track)+'</span><span class="record-title">'+escapeHTML(track.title)+'</span></button><p class="record-author">'+escapeHTML(track.artist||'New Horizon RP')+'</p>';card.querySelector('button').onclick=()=>select(track);shelf.append(card);}
  MusicCommunity.attach(root,tracks);MusicPlaylists.attach(root,tracks,select);
  root.querySelector('.gramophone-play').onclick=playPause;root.querySelector('.gramophone-stop').onclick=putAway;
  root.querySelector('.gramophone-position').oninput=event=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(event.target.value)/1000*audio.duration;update();}};
  root.querySelector('.gramophone-volume input').oninput=event=>{volume=Number(event.target.value)/100;audio.volume=volume;};update();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelFlights();update();});
 return{open,detach,dispose,syncSession};
})();
