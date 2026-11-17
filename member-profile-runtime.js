const MemberProfile=(()=>{
 let generation=0,host=null;
 function dispose(){generation++;host=null;}
 async function open(container,route){
  dispose();host=container;const version=generation,user=identity.user.id,id=route.split('/')[1]||user;
  host.innerHTML='<p role="status">Načítám vizitku…</p>';
  try{
   const member=await api('/archive/player/'+encodeURIComponent(id));if(version!==generation||identity?.user.id!==user||!host?.isConnected)return;
   host.innerHTML='<article class="member-visiting-card"><span class="eyebrow">OBYVATEL ÚSTAVU</span><img class="member-avatar" src="'+escapeHTML(member.avatar||mediaURL('NH.png',160))+'" width="96" height="96" alt=""><h2>'+escapeHTML(member.name)+'</h2>'+(member.character?'<div class="member-character"><img src="'+mediaURL('icon-'+member.character+'.png',320)+'" width="112" height="112" alt=""><span>POSTAVA</span><h3>'+escapeHTML(member.characterName)+'</h3><a class="web-button" href="#'+member.character+'">Otevřít příběh ↗</a></div>':'<p>K tomuto účtu není přiřazená postava.</p>')+'<p class="web-muted">Soukromý příběh se otevírá pouze se souhlasem jeho vlastníka.</p></article>';
  }catch(error){if(version===generation&&identity?.user.id===user&&host?.isConnected){host.replaceChildren();const p=document.createElement('p');p.setAttribute('role','status');p.textContent=error.message;host.append(p);}}
 }
 return{open,dispose};
})();
