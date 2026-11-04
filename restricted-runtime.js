const RestrictedAccess=(()=>{
 let page;
 function show(){
  PortalPolish.closeCast();PortalPolish.cancelConfirmation();PortalPolish.loading('',false);purgeProfile();Journal.purge();Community.purge();UserChrome.clearPrivate();resetTrust();if(denial.open)denial.close();
  selection.hidden=true;portal.hidden=true;welcome.hidden=true;rail.hidden=true;rail.replaceChildren();portal.replaceChildren();setNotice('');
  if(!page){page=document.createElement('main');page.id='restricted-page';page.setAttribute('aria-labelledby','restricted-title');page.innerHTML='<section class="restricted-card"><div class="restricted-orbit" aria-hidden="true"><span></span><svg viewBox="0 0 100 100"><path d="M50 10 80 23v24c0 23-30 39-30 39S20 70 20 47V23Z"/><rect x="35" y="42" width="30" height="25" rx="4"/><path d="M40 42v-7a10 10 0 0 1 20 0v7M50 52v6"/></svg></div><span class="eyebrow">ÚSTAV BEZ DOZORU · SPRÁVA KRONIKY</span><h1 id="restricted-title">Tato kapitola je<br>pro tebe uzavřená.</h1><div class="restricted-divider" aria-hidden="true">✦</div><p class="restricted-message">Byl ti odebrán přístup k webovým funkcím. Pro jeho obnovení kontaktuj vedení Ústavu.</p><p class="restricted-account"></p><div class="restricted-actions"><a class="web-button primary" href="https://discord.com/channels/1561680787676467230" target="_blank" rel="noopener noreferrer">Kontaktovat vedení ↗</a><button type="button" class="web-button restricted-recheck">Zkontrolovat přístup</button></div><p class="restricted-status" role="status" aria-live="polite"></p><footer>NEW HORIZON · SOUKROMÁ KRONIKA</footer></section>';document.body.append(page);
   page.querySelector('button').onclick=async event=>{const b=event.currentTarget;b.disabled=true;await refreshSession(true);if(identity?.restricted)page.querySelector('.restricted-status').textContent='Přístup je stále omezený. Kontaktuj vedení Ústavu.';b.disabled=false;};
  }
  page.hidden=false;page.querySelector('.restricted-account').textContent='Přihlášen jako '+identity.user.name;document.title='Přístup k webu byl odebrán · New Horizon';
 }
 function hide(){if(page){page.hidden=true;page.querySelector('.restricted-status').textContent='';page.querySelector('.restricted-account').textContent='';}}
 return {show,hide};
})();
