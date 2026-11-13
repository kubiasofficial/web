const Holiday=(()=>{
 let root=null,enabled=true,previewing=false,active=false;
 function update(){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{month:'numeric',day:'numeric',timeZone:'Europe/Prague'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  if(!identity?.admin?.owner)previewing=false;
  active=!/^#manage(?:\/|$)/.test(location.hash)&&enabled&&SeasonAtmosphere.mode!=='off'&&!identity?.restricted&&(previewing||(Number(parts.month)===12&&Number(parts.day)>=20&&Number(parts.day)<=26));
  document.body.classList.toggle('christmas-week',active);if(root){root.hidden=!active;root.classList.toggle('holiday-paused',document.hidden);}
  SeasonAtmosphere.festive(active);
 }
 function init(){
  if(root)return;try{enabled=localStorage.getItem('nh-holiday')!=='off';}catch{}
  root=document.createElement('div');root.className='holiday-decoration';root.setAttribute('aria-hidden','true');root.innerHTML='<div class="holiday-garland">'+Array.from({length:12},(_,i)=>'<i class="holiday-bulb" style="--n:'+i+'"></i>').join('')+'</div>'+[0,1,2].map(i=>'<span class="holiday-bauble bauble-'+i+'"><b>✦</b></span>').join('')+'<div class="holiday-flakes">'+Array.from({length:14},(_,i)=>'<i style="--n:'+i+'">✧</i>').join('')+'</div><span class="holiday-frost"></span>';document.body.append(root);document.addEventListener('visibilitychange',update);window.addEventListener('hashchange',update);setInterval(update,60000);update();
 }
 function controls(host){
  const section=document.createElement('section');section.className='holiday-settings';section.innerHTML='<span class="eyebrow">20.–26. PROSINCE · EVROPA / PRAHA</span><h2>Vánoce na horizontu</h2><p>Jehličí, teplá světýlka, ozdoby a jemný sníh. Výzdoba se objeví automaticky na vánoční týden.</p><label><input type="checkbox" '+(enabled?'checked':'')+'> Povolit vánoční výzdobu</label><div class="holiday-preview-actions"></div><a href="#calendar" class="web-button">Prosincová pošta ↗</a>';
  section.querySelector('input').onchange=e=>{enabled=e.target.checked;try{localStorage.setItem('nh-holiday',enabled?'on':'off');}catch{}update();};
  if(identity?.admin?.owner){const b=document.createElement('button');b.type='button';b.className='web-button';b.textContent='Přepnout správcovský náhled Vánoc';b.onclick=()=>preview(!previewing);section.querySelector('.holiday-preview-actions').append(b);const hint=document.createElement('p');hint.className='web-muted';hint.textContent='Náhled mění vzhled pouze tobě. Neposouvá datum ani nepřipisuje dárky.';section.append(hint);}host.append(section);
 }
 function preview(value){if(!identity?.admin?.owner)return;previewing=!!value;if(value)enabled=true;update();}
 return{init,update,controls,preview,get active(){return active;}};
})();
