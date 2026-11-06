// Shared public rulebook. Secret assignments are never part of this file.
const SALOON_RULES={
 roles:{
  citizen:{name:'Obyvatel',team:'town',tag:'Hlas města',quote:'Tohle město je můj domov.',story:'Přišel jsi hledat nový začátek. Teď musíš poznat, komu u saloonového stolu můžeš věřit.',power:'Nemáš noční akci. Přes den diskutuješ a hlasuješ. Vyhráváš s městem po odstranění všech banditů.',color:'#c7a66c'},
  bandit:{name:'Bandita',team:'bandits',tag:'Stín pohraničí',quote:'Za úsměvem se nejlépe schová revolver.',story:'Přes den jsi obyčejný soused. Po setmění patří ulice tvému gangu.',power:'Znáš ostatní bandity. V noci hlasujete o oběti a máte vlastní chat. Při shodě více cílů se neútočí. Vyhráváte, když vás je alespoň tolik jako všech ostatních žijících.',color:'#cf6254'},
  sheriff:{name:'Šerif',team:'town',tag:'Oko zákona',quote:'Odznak není důkaz. Pravdu musíš najít.',story:'Přísahal jsi chránit město. Jenže špatné obvinění může stát život nevinného.',power:'Každou noc prověříš jednoho jiného žijícího hráče. Po noci soukromě zjistíš, zda je bandita. Padělatel první prověrku oklame.',color:'#e2bb65'},
  doctor:{name:'Doktor',team:'town',tag:'Poslední naděje',quote:'Někdy stačí zachránit jediného člověka.',story:'Znáš zranění i tajemství těch, kteří klepou na dveře až po setmění.',power:'V noci ochráníš jednoho žijícího hráče, klidně sebe. Nesmíš chránit stejnou osobu dvě noci po sobě. Pokud se tvůj cíl stane obětí útoku, přežije.',color:'#83b9a7'},
  telegraphist:{name:'Telegrafista',team:'town',tag:'Tajemství na drátě',quote:'Dráty si pamatují to, co lidé zapírají.',story:'Celý den posloucháš cizí zprávy. Jednou za noc svého života můžeš poslat tu nejdůležitější.',power:'Jednou za partii odešleš v noci jinému hráči anonymní telegram do 200 znaků. Ráno dorazí, pokud adresát přežije. Je to hráčská zpráva, nikoli důkaz od hry.',color:'#87accb'},
  dispatcher:{name:'Výpravčí',team:'town',tag:'Poslední vlak',quote:'Poslední vlak nečeká ani na spravedlnost.',story:'Jediné zapískání může přerušit hádku, která se právě mění v rozsudek.',power:'Jednou za partii během diskuse vyhlásíš Odjezd posledního vlaku. Ten den se nehlasuje a nastane noc. Použití je veřejné a nelze ho spustit až při hlasování.',color:'#ba91c4'},
  saloonkeeper:{name:'Majitel saloonu',team:'town',tag:'Ještě jednu rundu',quote:'Nejdřív si sedněte. Pak někoho pověste.',story:'Znáš každý dluh a každý stůl. Víš, kdy město potřebuje ještě chvíli přemýšlet.',power:'Jednou za partii během diskuse veřejně vyhlásíš Rundu na účet podniku. Diskuse se prodlouží o 60 sekund.',color:'#d69b60'},
  forger:{name:'Padělatel',team:'bandits',tag:'Dokonalé alibi',quote:'Správné papíry udělají slušného člověka z kohokoliv.',story:'Čisté doklady, přesvědčivá minulost a velmi špinavé ruce.',power:'Jsi bandita a účastníš se útoků gangu. První prověření šerifem ukáže Není bandita. Další už odhalí pravdu. Počítáš se do počtu banditů.',color:'#b67d8c'}
 },
 phases:{lobby:'Čekárna',intro:'Tajné karty',night:'Noc',discussion:'Denní diskuse',vote:'Hlasování',finished:'Konec partie'},
 counts:{4:[1,0,1],5:[1,1,0],6:[2,1,1],7:[2,1,1],8:[2,1,1],9:[2,1,1],10:[3,1,1]},
 lineup(n,mode='basic'){
  if(!this.counts[n])return [];const [bandits,sheriff,doctor]=this.counts[n],roles=[...Array(bandits).fill('bandit'),...Array(sheriff).fill('sheriff'),...Array(doctor).fill('doctor')];while(roles.length<n)roles.push('citizen');
  if(mode==='extended'&&n>=6){const extras={6:['telegraphist'],7:['saloonkeeper'],8:['telegraphist','saloonkeeper'],9:['telegraphist','dispatcher'],10:['saloonkeeper','dispatcher']}[n];for(const role of extras){const at=roles.indexOf('citizen');if(at>=0)roles[at]=role;}if(n>=8)roles[roles.indexOf('bandit')]='forger';}return roles;
 }
};
