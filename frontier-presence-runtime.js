// Design preview only. No presence is inferred from Discord activity or login.
const FrontierPresence=(()=>{
 const labels={awake:'Vzhůru',asleep:'Spí',unknown:'Stav není dostupný'};
 function card(state,total){
  const element=document.createElement('aside');element.className='frontier-presence';element.dataset.state=state;
  element.setAttribute('aria-label','Život v pohraničí');
  element.innerHTML='<header><img src="'+mediaURL('NH.png',160)+'" alt="" width="46" height="46"><div><span class="eyebrow">ŽIVOT V POHRANIČÍ</span><strong>New Horizon RP</strong></div></header><p class="frontier-state"><span aria-hidden="true"></span>'+labels[state]+'</p><div class="frontier-total"><span>Celkový odehraný čas</span><b></b></div>';
  element.querySelector('b').textContent=total;return element;
 }
 function preview(root){
  root.innerHTML='<section class="frontier-preview"><span class="eyebrow">NÁHLED · BEZ ŽIVÉHO PROPOJENÍ</span><h2>Život v pohraničí</h2><p>Malé logo, stav postavy a celkový čas na New Horizon RP. Ukázkové stavy níže nejsou údaje o hráčích.</p><div class="frontier-previews"></div><div class="web-callout"><p>Čekáme na domluvu s majitelkou serveru. Na profilech se zatím nic neměří ani nezobrazuje. Bez čerstvého ověření zobrazíme nedostupný stav, nikoli „Spí“.</p></div></section>';
  root.querySelector('.frontier-previews').append(card('awake','38 h 45 min'),card('asleep','38 h 45 min'),card('unknown','Zatím se neměří'));
 }
 return {preview};
})();
