const APP_VERSION='5.2';
const CACHE_VERSION='14';
const BUDGET_PERIOD_DAYS=30;

const DEFAULT_CATEGORIES=[
  {id:'food',name:'Jedlo',icon:'🍔',limit:300,type:'spend',keywords:['lidl','tesco','kaufland','billa','fresh','coop','mcdonald','kfc','burger','restaurant','restauracia','pizza','obed','jedlo','wolt','wolt.com','wolt enterprises']},
  {id:'fuel',name:'Tankovanie',icon:'⛽',limit:90,type:'spend',keywords:['omv','shell','slovnaft','orlen','benzina']},
  {id:'gym',name:'Fitko',icon:'🏋️',limit:35,type:'toggle',keywords:['gym','fitness','fitko']},
  {id:'fun',name:'Zábava',icon:'🎮',limit:90,type:'spend',keywords:['steam','playstation','xbox','cinema','kino','bar','pub','nvidia','geforce']},
  {id:'car',name:'Auto / rezerva',icon:'🚗',limit:80,type:'toggle',keywords:['autodiel','servis','pneuservis','car wash','umyvarka']},
  {id:'hygiene',name:'Hygiena / lekáreň',icon:'🧴',limit:45,type:'spend',keywords:['dm drogerie','101 drogerie','dr.max','benu','lekaren']},
  {id:'other',name:'Ostatné',icon:'🛍️',limit:30,type:'spend',keywords:[]}
];

const DEFAULT_STATE={
  settings:{
    budget:800,savings:150,
    periodStart:new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime(),
    syncUrl:'',syncKey:'',lastSync:0,categories:DEFAULT_CATEGORIES
  },
  transactions:[],monthlyFlags:{},shopping:{},merchantRules:{},ignoredExternalIds:[],planned:[],version:APP_VERSION
};

// 31 večerí: minimum zeleniny, väčšinou len voliteľná príloha.
const RECIPES=[
  {n:'Krémové syrové penne',i:'🍝',c:2.35,k:690,p:27,t:20,chicken:false,ing:['120 g penne','80 ml smotany na varenie','55 g eidamu alebo goudy','10 g parmezánu','cesnak, soľ, čierne korenie'],s:['Cestoviny uvar v osolenej vode al dente.','Na miernom ohni zohrej smotanu a pridaj nastrúhaný syr.','Miešaj, kým sa syr neroztopí a omáčka nebude hladká.','Vmiešaj scedené cestoviny a podľa potreby pridaj lyžicu vody z varenia.'],tip:'Jednoduché, sýte a bez mäsa. Ak chceš viac bielkovín, daj k tomu cottage.'},
  {n:'Domáca syrová pizza',i:'🍕',c:2.75,k:760,p:32,t:40,chicken:false,ing:['250 g pizzového cesta alebo múky na cesto','90 g paradajkovej passaty','100 g mozzarelly','35 g eidamu','oregano, soľ'],s:['Rúru rozohrej na 230 °C.','Cesto vytvaruj na tenšiu pizzu.','Potri passatou, posyp oreganom a pridaj oba syry.','Peč približne 10–14 minút podľa hrúbky cesta.'],tip:'Ak sa ti nechce robiť cesto, použi hotový pizza základ alebo tortillu.'},
  {n:'Americké zemiaky so syrovým dipom',i:'🥔',c:2.10,k:640,p:22,t:35,chicken:false,ing:['450 g zemiakov','1 PL oleja','50 g eidamu','80 g gréckeho jogurtu','cesnak, soľ, paprika'],s:['Zemiaky nakrájaj na mesiačiky a premiešaj s olejom a korením.','Peč pri 210 °C približne 28–32 minút.','Jogurt zmiešaj s cesnakom a soľou.','Na horúce zemiaky nasyp syr a nechaj ho roztopiť.','Podávaj s dipom.'],tip:'Veľká porcia za málo peňazí. Zeleninu vôbec nepotrebuješ.'},
  {n:'Praženica so syrom a toastami',i:'🍳',c:2.20,k:610,p:33,t:12,chicken:false,ing:['4 vajcia','45 g syra','3 plátky toastového chleba','5 g masla','soľ, čierne korenie'],s:['Na panvici rozpusti trochu masla.','Vajcia rozšľahaj so soľou a vlej na panvicu.','Miešaj na miernom ohni a tesne pred koncom pridaj syr.','Toast opeč v hriankovači alebo na suchej panvici.'],tip:'Rýchle jedlo na deň, keď sa ti nechce variť.'},
  {n:'Kuracie prsia s ryžou a cesnakovým dipom',i:'🍗',c:3.20,k:670,p:56,t:30,chicken:true,ing:['200 g kuracích pŕs','90 g ryže','80 g gréckeho jogurtu','1 strúčik cesnaku','1 ČL oleja','soľ, paprika'],s:['Ryžu uvar podľa návodu.','Kuracie nakrájaj na kúsky, osoľ a okoreň.','Opekaj na oleji 7–9 minút, kým nie je hotové.','Jogurt zmiešaj s cesnakom a štipkou soli.','Podávaj mäso s ryžou a dipom.'],tip:'Kuracie je tu len občas; toto je jeden z jednoduchších proteínových dní.'},
  {n:'Mac & cheese po domácky',i:'🧀',c:2.55,k:780,p:31,t:25,chicken:false,ing:['120 g kolienok alebo penne','90 ml mlieka','70 g cheddaru alebo eidamu','10 g masla','1 ČL múky','soľ, korenie'],s:['Cestoviny uvar al dente.','V hrnci rozpusti maslo a krátko rozmiešaj múku.','Postupne vlej mlieko a miešaj do zhustnutia.','Pridaj syr a miešaj, kým sa neroztopí.','Vmiešaj cestoviny.'],tip:'Nie je to fitness jedlo, ale práve preto je plán jedál realistickejší.'},
  {n:'Syrová tortilla s vajíčkom',i:'🌯',c:2.40,k:650,p:31,t:15,chicken:false,ing:['2 tortilly','2 vajcia','60 g syra','30 g gréckeho jogurtu','soľ, paprika'],s:['Vajcia priprav ako jemnú praženicu.','Na tortillu daj syr a vajcia.','Prelož ju napoly a opeč na suchej panvici 2–3 minúty z každej strany.','Podávaj s trochou jogurtu ako dipom.'],tip:'Dobrá zmena od cestovín bez potreby zeleniny.'},
  {n:'Kuracie penne v syrovej omáčke',i:'🍝',c:3.45,k:750,p:59,t:25,chicken:true,ing:['190 g kuracích pŕs','110 g penne','70 ml smotany','45 g eidamu','cesnak, soľ, korenie'],s:['Penne uvar podľa návodu.','Kuracie nakrájaj a opeč 7–9 minút.','Stíš teplotu, pridaj smotanu a nastrúhaný syr.','Miešaj, kým vznikne hladká omáčka.','Vmiešaj cestoviny.'],tip:'Jedno z kuracích jedál, ktoré sedí k tomu, že máš rád cestoviny a syr.'},
  {n:'Zapekané cestoviny s mozzarellou',i:'🧀',c:2.85,k:720,p:30,t:35,chicken:false,ing:['120 g cestovín','100 g mozzarelly','100 g passaty','25 g eidamu','oregano, soľ'],s:['Cestoviny uvar o 2 minúty kratšie než uvádza obal.','Zmiešaj ich s passatou a polovicou syra.','Daj do zapekacej nádoby a navrch pridaj zvyšok syra.','Peč 15–18 minút pri 200 °C.'],tip:'Pizza chuť bez samotnej pizze.'},
  {n:'Gnocchi v smotanovo-syrovej omáčke',i:'🥟',c:2.95,k:740,p:25,t:18,chicken:false,ing:['300 g gnocchi','80 ml smotany','45 g parmezánu alebo eidamu','cesnak, soľ, korenie'],s:['Gnocchi uvar podľa obalu.','Na panvici zohrej smotanu s cesnakom.','Pridaj syr a miešaj do rozpustenia.','Vmiešaj gnocchi a nechaj minútu spolu prehriať.'],tip:'Hotové rýchlo a bez mäsa.'},
  {n:'Kuracie so zemiakmi a roztopeným syrom',i:'🍗',c:3.35,k:700,p:57,t:35,chicken:true,ing:['200 g kuracích pŕs','380 g zemiakov','45 g syra','1 ČL oleja','soľ, paprika, cesnak'],s:['Zemiaky nakrájaj a daj piecť pri 210 °C.','Kuracie ochuť a opeč na panvici.','Na hotové mäso nasyp syr a nechaj ho roztopiť.','Podávaj s pečenými zemiakmi.'],tip:'Klasika, ale nie každý deň.'},
  {n:'Pizza bagetky so syrom',i:'🥖',c:2.45,k:680,p:27,t:18,chicken:false,ing:['1 väčšia bageta','90 g passaty','90 g mozzarelly alebo eidamu','oregano','kečup voliteľne'],s:['Bagetu rozrež pozdĺžne.','Potri ju passatou alebo kečupom.','Pridaj syr a oregano.','Peč 8–10 minút pri 210 °C, kým sa syr neroztopí.'],tip:'Jednoduché domáce pizza bagety bez mäsa.'},
  {n:'Ryža s vajíčkom a syrom',i:'🍚',c:2.15,k:650,p:28,t:20,chicken:false,ing:['90 g ryže','3 vajcia','40 g syra','1 ČL oleja','sójová omáčka voliteľne'],s:['Ryžu uvar.','Na panvici priprav vajcia a jemne ich premiešaj.','Pridaj ryžu a krátko opeč.','Nakoniec vmiešaj nastrúhaný syr.'],tip:'Funguje aj úplne bez zeleniny.'},
  {n:'Špagety v smotanovo-parmezánovej omáčke',i:'🍝',c:2.60,k:730,p:27,t:20,chicken:false,ing:['120 g špagiet','90 ml smotany','30 g parmezánu','20 g eidamu','cesnak, soľ, korenie'],s:['Špagety uvar al dente.','Smotanu zohrej na miernom ohni.','Pridaj oba syry a miešaj do hladka.','Vmiešaj špagety a trochu vody z cestovín.'],tip:'Keď máš chuť na cestoviny, toto je čistá syrová klasika.'},
  {n:'Kuracia tortilla pizza',i:'🍕',c:3.15,k:620,p:48,t:20,chicken:true,ing:['2 tortilly','150 g kuracích pŕs','80 g passaty','70 g mozzarelly','oregano'],s:['Kuracie nakrájaj nadrobno a opeč.','Tortilly potri passatou.','Pridaj kuracie, syr a oregano.','Peč 8–10 minút pri 210 °C.'],tip:'Chrumkavá pizza verzia s kuracím.'},
  {n:'Domáce hranolky s cheddar dipom',i:'🍟',c:2.30,k:710,p:20,t:35,chicken:false,ing:['500 g zemiakov','1 PL oleja','60 g cheddaru','50 ml mlieka','soľ, paprika'],s:['Zemiaky nakrájaj na hranolky a osušíš.','Premiešaj s olejom a soľou.','Peč 30 minút pri 220 °C alebo priprav vo fritéze.','Syr s mliekom pomaly zohrej a miešaj na dip.'],tip:'Voľnejšie jedlo, nie všetko musí byť fitness.'},
  {n:'Grilované syrové toasty + chipsy',i:'🥪',c:2.85,k:790,p:28,t:12,chicken:false,ing:['4 plátky toastového chleba','80 g syra','10 g masla','60 g chipsov'],s:['Medzi dva toasty daj polovicu syra a zopakuj druhý sendvič.','Zvonka jemne potri maslom.','Opekaj na panvici z oboch strán do chrumkava.','Podávaj s menšou porciou chipsov.'],tip:'Presne typ jedla na deň, keď nechceš riešiť „fitness“.'},
  {n:'Kuracie kari s ryžou',i:'🍛',c:3.55,k:710,p:52,t:25,chicken:true,ing:['190 g kuracích pŕs','90 g ryže','90 ml smotany alebo kokosového mlieka','kari korenie','soľ, cesnak'],s:['Ryžu uvar.','Kuracie nakrájaj a opeč.','Pridaj kari a smotanu.','Povar 4–5 minút a dochuť.','Podávaj s ryžou.'],tip:'Bez zeleniny, len mäso, omáčka a ryža.'},
  {n:'Štyri syry – cestoviny',i:'🧀',c:3.05,k:790,p:34,t:20,chicken:false,ing:['120 g cestovín','25 g mozzarelly','25 g eidamu','20 g nivy alebo iného syra','15 g parmezánu','70 ml smotany'],s:['Cestoviny uvar.','Smotanu zohrej a postupne pridaj všetky syry.','Miešaj, kým sa rozpustia.','Vmiešaj cestoviny a krátko prehrej.'],tip:'Ak niektorý syr nemusíš, jednoducho ho nahraď väčším množstvom eidamu.'},
  {n:'Vajíčková opekaná ryža',i:'🍳',c:1.95,k:610,p:24,t:18,chicken:false,ing:['90 g ryže','3 vajcia','1 ČL oleja','sójová omáčka','30 g syra voliteľne'],s:['Ryžu uvar alebo použi ryžu z predchádzajúceho dňa.','Vajcia priprav na panvici.','Pridaj ryžu a krátko opekaj.','Dochut sójovou omáčkou a prípadne pridaj syr.'],tip:'Jedno z najlacnejších jedál v zozname.'},
  {n:'Domáce kuracie nugetky a hranolky',i:'🍗',c:3.65,k:760,p:55,t:40,chicken:true,ing:['200 g kuracích pŕs','40 g strúhanky','1 vajce','350 g zemiakov','1 ČL oleja','soľ, paprika'],s:['Kuracie nakrájaj na menšie kúsky.','Obaľ vo vajci a strúhanke.','Zemiaky nakrájaj na hranolky.','Nugetky aj hranolky peč pri 210 °C približne 25–30 minút.'],tip:'Domáca fast-food verzia, ale stále vieš presne, čo v nej je.'},
  {n:'Syrová quesadilla',i:'🌮',c:2.35,k:660,p:29,t:12,chicken:false,ing:['2 veľké tortilly','90 g syra','50 g gréckeho jogurtu','paprika korenie alebo chilli voliteľne'],s:['Na polovicu tortilly nasyp syr.','Prelož ju a opeč na suchej panvici.','Otoč, aby bola chrumkavá z oboch strán.','Nakrájaj na trojuholníky a podávaj s jogurtovým dipom.'],tip:'Rýchlejšie než pizza a stále poriadne syrové.'},
  {n:'Zemiakové placky so syrom',i:'🥔',c:2.25,k:690,p:25,t:30,chicken:false,ing:['450 g zemiakov','1 vajce','35 g múky','60 g syra','1 ČL oleja','soľ, cesnak'],s:['Zemiaky nastrúhaj a vytlač prebytočnú vodu.','Zmiešaj s vajcom, múkou a soľou.','Na panvici vytvor menšie placky a opeč ich z oboch strán.','Na hotové placky daj nastrúhaný syr.'],tip:'Žiadna polievka ani šalát k tomu nie sú potrebné.'},
  {n:'Kuracie Alfredo cestoviny',i:'🍝',c:3.75,k:800,p:60,t:25,chicken:true,ing:['190 g kuracích pŕs','110 g cestovín','90 ml smotany','30 g parmezánu','15 g masla','cesnak, soľ'],s:['Cestoviny uvar.','Kuracie nakrájaj a opeč.','Do panvice pridaj maslo, smotanu a parmezán.','Miešaj do zhustnutia.','Vmiešaj cestoviny a kuracie.'],tip:'Sýte jedlo; v ten deň už asi nebudeš potrebovať veľký snack.'},
  {n:'Pizza toasty s mozzarellou',i:'🍕',c:2.20,k:620,p:27,t:15,chicken:false,ing:['4 plátky toastu','80 g passaty','100 g mozzarelly','oregano'],s:['Toast polož na plech.','Potri passatou.','Pridaj mozzarellu a oregano.','Peč pri 210 °C približne 8 minút.'],tip:'Veľmi jednoduchá pizza chuť za pár eur.'},
  {n:'Syrová zemiaková kaša s volským okom',i:'🍳',c:2.30,k:680,p:29,t:30,chicken:false,ing:['400 g zemiakov','3 vajcia','50 ml mlieka','45 g syra','10 g masla','soľ'],s:['Zemiaky uvar domäkka.','Roztlač ich s mliekom, maslom a syrom.','Na panvici priprav 3 volské oká.','Podávaj vajcia na syrovej kaši.'],tip:'Jednoduché suroviny, veľká porcia.'},
  {n:'Kuracie ryžové bowl so syrom',i:'🍚',c:3.35,k:720,p:57,t:25,chicken:true,ing:['190 g kuracích pŕs','90 g ryže','45 g syra','50 g jogurtu','soľ, paprika'],s:['Ryžu uvar.','Kuracie nakrájaj a opeč.','Do misky daj ryžu, mäso a nastrúhaný syr.','Pridaj jogurtový dip a premiešaj podľa chuti.'],tip:'Bowl bez zeleniny – jednoducho ryža, kuracie, syr a dip.'},
  {n:'Nachos so syrovým dipom',i:'🧀',c:2.95,k:820,p:22,t:12,chicken:false,ing:['120 g tortilla chipsov','80 g cheddaru alebo eidamu','70 ml mlieka','40 g gréckeho jogurtu','chilli korenie voliteľne'],s:['Chipsy daj do misy.','Syr s mliekom zohrievaj na miernom ohni a miešaj.','Keď vznikne hladký dip, odstav ho.','Podávaj s chipsami a prípadne trochou jogurtu.'],tip:'Nie je to „fitness“, ale appka má byť použiteľná aj na normálny život.'},
  {n:'Cestoviny carbonara-style bez mäsa',i:'🍝',c:2.45,k:710,p:34,t:20,chicken:false,ing:['120 g špagiet','2 vajcia','35 g parmezánu','20 g eidamu','čierne korenie','soľ'],s:['Špagety uvar al dente a trochu vody odlož.','V miske zmiešaj vajcia so syrmi a korením.','Horúce cestoviny odstav z ohňa a vmiešaj vajíčkovú zmes.','Podľa potreby pridaj trochu vody z cestovín, aby bola omáčka krémová.'],tip:'Dôležité je miešať mimo priameho ohňa, aby z vajec nebola praženica.'},
  {n:'Cottage syrové cestoviny',i:'🍝',c:2.50,k:650,p:42,t:18,chicken:false,ing:['110 g cestovín','150 g cottage cheese','35 g eidamu','cesnak, soľ, korenie'],s:['Cestoviny uvar.','Cottage rozmixuj alebo len premiešaj s trochou vody z cestovín.','Pridaj syr, cesnak a korenie.','Vmiešaj horúce cestoviny a krátko prehrej.'],tip:'Viac bielkovín bez toho, aby tam muselo byť mäso.'},
  {n:'Domáca kuracia pizza',i:'🍕',c:3.55,k:790,p:52,t:45,chicken:true,ing:['250 g pizzového cesta','140 g kuracích pŕs','90 g passaty','90 g mozzarelly','oregano, soľ'],s:['Kuracie nakrájaj na malé kúsky a predpeč na panvici.','Cesto vytvaruj a potri passatou.','Pridaj kuracie, mozzarellu a oregano.','Peč pri 230 °C približne 12–15 minút.'],tip:'Kuracia pizza je v pláne len občas, nie každý deň.'}
];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clone=o=>JSON.parse(JSON.stringify(o));
const fmt=n=>new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(Number(n||0));
const parseNum=v=>Number(String(v??'').replace(',','.'))||0;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;

function migrate(raw){
  const r=raw&&typeof raw==='object'?raw:{};
  const oldCats=Array.isArray(r.settings?.categories)?r.settings.categories:DEFAULT_CATEGORIES;
  const categories=DEFAULT_CATEGORIES.map(d=>({...d,...(oldCats.find(c=>c.id===d.id)||{}),keywords:d.keywords}));
  oldCats.filter(c=>!DEFAULT_CATEGORIES.some(d=>d.id===c.id)).forEach(c=>categories.push(c));
  return {
    settings:{
      budget:Number(r.settings?.budget??800)||800,
      savings:Number(r.settings?.savings??150)||0,
      periodStart:Number(r.settings?.periodStart)||new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime(),
      syncUrl:String(r.settings?.syncUrl||''),
      syncKey:String(r.settings?.syncKey||''),
      lastSync:Number(r.settings?.lastSync||0),
      categories
    },
    transactions:(Array.isArray(r.transactions)?r.transactions:[]).filter(t=>Number(t.ts)>= (Number(r.settings?.periodStart)||new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime())),
    monthlyFlags:r.monthlyFlags||{},shopping:r.shopping||{},merchantRules:r.merchantRules||{},
    ignoredExternalIds:Array.isArray(r.ignoredExternalIds)?r.ignoredExternalIds:[],
    planned:Array.isArray(r.planned)?r.planned:[],version:APP_VERSION
  };
}
const store={get(){try{return migrate(JSON.parse(localStorage.getItem('money800')||'null'))}catch{return clone(DEFAULT_STATE)}},set(v){localStorage.setItem('money800',JSON.stringify(v))}};
let state=store.get(),recipeOffset=0,currentFilter='all',currentSearch='',currentEditTxId=null; store.set(state);
function save(){state.version=APP_VERSION;store.set(state)}
function cats(){return state.settings.categories}
function cat(id){return cats().find(c=>c.id===id)||cats().find(c=>c.id==='other')||cats()[0]}
function periodStartTs(){return Number(state.settings.periodStart)||Date.now()}
function periodKey(){return `period-${new Date(periodStartTs()).toISOString().slice(0,10)}`}
function txPeriod(){return state.transactions.filter(t=>Number(t.ts)>=periodStartTs())}
function periodFlags(){if(!state.monthlyFlags[periodKey()])state.monthlyFlags[periodKey()]={};return state.monthlyFlags[periodKey()]}
function isPaid(id){return !!periodFlags()[id]}
function txSpent(id){return txPeriod().filter(t=>t.category===id).reduce((s,t)=>s+Number(t.amount||0),0)}
function catSpent(id){const c=cat(id),actual=txSpent(id);return c?.type==='toggle'&&isPaid(id)?Math.max(actual,Number(c.limit||0)):actual}
function totalSpent(){return cats().reduce((s,c)=>s+catSpent(c.id),0)}
function daysElapsed(){return Math.max(1,Math.floor((Date.now()-periodStartTs())/86400000)+1)}
function daysLeft(){return Math.max(1,BUDGET_PERIOD_DAYS-daysElapsed()+1)}
function merchantKey(m=''){return String(m).toLowerCase().replace(/[^a-z0-9áäčďéíĺľňóôŕšťúýž ]/gi,' ').replace(/\s+/g,' ').trim()}
function autoCat(merchant=''){const key=merchantKey(merchant),rule=state.merchantRules?.[key],m=merchant.toLowerCase();if(rule&&cats().some(c=>c.id===rule))return rule;return cats().find(c=>(c.keywords||[]).some(k=>m.includes(k)))?.id||'other'}
function fingerprint(amount,merchant,text=''){return `${Number(amount).toFixed(2)}|${merchantKey(merchant)}|${String(text).slice(0,90).toLowerCase().replace(/\s+/g,' ')}`}
function pendingPlanned(){return state.planned.filter(p=>!p.paid).reduce((s,p)=>s+Number(p.amount||0),0)}
function addTx(amount,merchant,category,source='manual',fp=''){
  const a=Number(amount); if(!a||!merchant)return false; const f=fp||fingerprint(a,merchant);
  if(state.transactions.some(t=>t.fingerprint&&t.fingerprint===f)){toast('Táto platba už je pridaná.');return false}
  state.transactions.push({id:uid(),amount:a,merchant,category:category||autoCat(merchant),source,ts:Date.now(),period:periodKey(),fingerprint:f});
  save();render();toast('Výdavok pridaný.');return true;
}
function addCloudTx(row){
  const externalId=String(row?.id||''); if(!externalId)return false;
  if(state.ignoredExternalIds.includes(externalId)||state.transactions.some(t=>String(t.externalId||'')===externalId))return false;
  const ts=Date.parse(row.date)||Date.now(); if(ts<periodStartTs())return false;
  const amount=Number(row.amount||0),merchant=String(row.merchant||'Neznámy obchod').trim(); if(!amount||!merchant)return false;
  state.transactions.push({id:uid(),externalId,amount,merchant,category:autoCat(merchant),source:'Tatra B-mail cloud',ts,period:periodKey(),fingerprint:`cloud|${externalId}`});
  return true;
}

function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1900)}
function navigate(name){$$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===name));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));window.scrollTo({top:0,behavior:'smooth'});if(name==='food')renderFood();if(name==='settings')renderSettings();if(name==='expenses')renderExpenses();if(name==='tatra')renderTatraSync()}

function setCloudStatus(text,kind=''){
  const dot=$('#cloudStatusDot'),meta=$('#syncMeta');
  if(dot){dot.textContent=`● ${text}`;dot.className=`status-dot ${kind}`.trim()}
  if(meta&&kind==='error')meta.textContent=text;
}
function renderTatraSync(){
  const s=state.settings;
  if($('#syncUrlInput'))$('#syncUrlInput').value=s.syncUrl||'';
  if($('#syncKeyInput'))$('#syncKeyInput').value=s.syncKey||'';
  if($('#syncMeta'))$('#syncMeta').textContent=s.lastSync?`Posledná synchronizácia: ${new Date(s.lastSync).toLocaleString('sk-SK')}`:'Zatiaľ nesynchronizované.';
  if(s.syncUrl&&s.syncKey)setCloudStatus('pripojené','ok'); else setCloudStatus('nepripojené');
}
function syncTatraCloud(silent=false){
  const url=(state.settings.syncUrl||'').trim(),key=(state.settings.syncKey||'').trim();
  if(!url||!key){if(!silent)toast('Najprv ulož Apps Script URL a Sync kľúč.');renderTatraSync();return Promise.resolve(false)}
  setCloudStatus('synchronizujem…');
  return new Promise(resolve=>{
    const cb=`__money800_${Date.now()}_${Math.floor(Math.random()*100000)}`,script=document.createElement('script');let done=false;
    const cleanup=()=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch{}script.remove()};
    const timer=setTimeout(()=>{cleanup();setCloudStatus('chyba pripojenia','error');if(!silent)toast('Synchronizácia zlyhala.');resolve(false)},15000);
    window[cb]=(payload)=>{cleanup();if(!payload||payload.ok!==true){setCloudStatus(payload?.error==='unauthorized'?'zlý Sync kľúč':'chyba','error');if(!silent)toast(payload?.error==='unauthorized'?'Nesprávny Sync kľúč.':'Synchronizácia zlyhala.');resolve(false);return}
      let added=0;for(const row of (payload.transactions||[]))if(addCloudTx(row))added++;state.settings.lastSync=Date.now();save();render();setCloudStatus('pripojené','ok');if(!silent)toast(added?`Pridané nové platby: ${added}`:'Žiadne nové platby.');resolve(true)};
    const sep=url.includes('?')?'&':'?';script.src=`${url}${sep}key=${encodeURIComponent(key)}&callback=${encodeURIComponent(cb)}&_=${Date.now()}`;
    script.onerror=()=>{cleanup();setCloudStatus('chyba pripojenia','error');if(!silent)toast('Nepodarilo sa spojiť s Apps Scriptom.');resolve(false)};document.head.appendChild(script);
  });
}

function categoryCard(c){
  const sp=catSpent(c.id),lim=Number(c.limit||0),pct=lim?Math.min(100,sp/lim*100):0,paid=c.type==='toggle'&&isPaid(c.id),warn=pct>=100?'danger':pct>=75?'warn':'';
  let badge='V poriadku'; if(pct>=100)badge='🔴 Limit vyčerpaný'; else if(pct>=90)badge='🟠 Nad 90 %'; else if(pct>=75)badge='🟡 Nad 75 %'; if(c.type==='toggle')badge=paid?'🔴 Zaplatené':'⚪ Nezaplatené';
  const remain=Math.max(0,lim-sp), advice=c.type==='spend'&&lim?`${fmt(remain/Math.max(1,daysLeft()))}/deň do konca obdobia`:'Jednorazová / rezervná položka';
  return `<div class="category"><div class="category-top"><div class="category-left"><div class="cat-icon">${esc(c.icon)}</div><div><div class="category-name">${esc(c.name)}</div><div class="category-meta">${fmt(sp)} z ${fmt(lim)}</div></div></div><div class="category-right"><strong>${Math.round(pct)}%</strong><div class="remain">${fmt(remain)} ostáva</div></div></div><div class="bar"><div class="${warn}" style="width:${pct}%"></div></div><div class="category-advice">${advice}</div><div class="category-footer"><span class="category-badge">${badge}</span>${c.type==='toggle'?`<button class="quick-btn ${paid?'paid':''}" data-paid="${c.id}">${paid?'Zrušiť':'Označiť zaplatené'}</button>`:''}</div></div>`;
}
function bindToggleButtons(){$$('[data-paid]').forEach(b=>b.onclick=()=>{periodFlags()[b.dataset.paid]=!isPaid(b.dataset.paid);save();render();toast(isPaid(b.dataset.paid)?'Označené ako zaplatené.':'Platba zrušená.')})}

function forecastReady(){return daysElapsed()>=3&&txPeriod().length>=5}
function forecast(){
  const variable=cats().filter(c=>c.type!=='toggle').reduce((s,c)=>s+txSpent(c.id),0);
  const togglesPaid=cats().filter(c=>c.type==='toggle').reduce((s,c)=>s+catSpent(c.id),0);
  return (variable/Math.max(1,daysElapsed()))*BUDGET_PERIOD_DAYS+togglesPaid;
}
function topMerchants(){
  const map={};txPeriod().forEach(t=>{const k=t.merchant||'Neznáme';if(!map[k])map[k]={sum:0,count:0};map[k].sum+=Number(t.amount||0);map[k].count++});
  return Object.entries(map).map(([name,v])=>({name,...v})).sort((a,b)=>b.sum-a.sum).slice(0,5);
}
function renderPlannedOverview(){
  const el=$('#plannedOverview'),list=state.planned;
  if(!list.length){el.innerHTML='<div class="planned-empty">Zatiaľ nemáš plánované platby. Pridáš ich v Nastaveniach.</div>';return}
  el.innerHTML=list.map(p=>`<div class="planned-item"><div class="planned-left"><div class="planned-icon">${esc(cat(p.category)?.icon||'📌')}</div><div><div class="planned-title">${esc(p.name)}</div><div class="planned-sub">${fmt(p.amount)} · deň ${p.day||'—'} · ${esc(cat(p.category)?.name||'Ostatné')}</div></div></div><div class="planned-actions"><span class="category-badge">${p.paid?'✅ zaplatené':'⏳ rezervované'}</span><button class="quick-btn ${p.paid?'paid':''}" data-plan-toggle="${p.id}">${p.paid?'Vrátiť':'Zaplatené'}</button></div></div>`).join('');
  $$('[data-plan-toggle]').forEach(b=>b.onclick=()=>{const p=state.planned.find(x=>x.id===b.dataset.planToggle);if(!p)return;p.paid=!p.paid;save();render();toast(p.paid?'Plánovaná platba označená ako zaplatená.':'Platba znova rezervovaná.')});
}
function renderOverview(){
  const budget=state.settings.budget,spent=totalSpent(),planned=pendingPlanned(),remaining=budget-spent,realFree=budget-state.settings.savings-spent-planned;
  $('#todayLabel').textContent=`Dnes ${new Intl.DateTimeFormat('sk-SK',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}`;
  $('#periodLabel').textContent=`Obdobie od ${new Date(periodStartTs()).toLocaleDateString('sk-SK')} · ${daysLeft()} dní do plánovaného resetu`;
  $('#remainingAmount').textContent=fmt(remaining);$('#spentPill').textContent=`Minuté ${fmt(spent)}`;$('#txCountPill').textContent=`${txPeriod().length} platieb`;
  $('#budgetProgress').style.width=`${Math.min(100,Math.max(0,spent/Math.max(1,budget)*100))}%`;
  $('#dailyLimit').textContent=fmt(Math.max(0,realFree)/daysLeft());$('#savingsGoal').textContent=fmt(state.settings.savings);$('#realFree').textContent=fmt(realFree);$('#plannedSummaryMini').textContent=planned?`${fmt(planned)} ešte rezervované`:'žiadne čakajúce plánované platby';
  if(forecastReady()){
    const f=forecast(),pct=Math.round(f/Math.max(1,budget)*100);$('#forecastValue').textContent=fmt(f);$('#forecastPct').textContent=`${pct}%`;$('#forecastRing').classList.remove('disabled');$('#forecastRing').style.background=`conic-gradient(${pct>100?'var(--danger)':pct>90?'var(--warn)':'var(--accent)'} ${Math.min(360,pct*3.6)}deg,rgba(255,255,255,.08) 0deg)`;$('#forecastCopy').textContent=f>budget?`Pri tomto tempe by si mohol prekročiť rozpočet asi o ${fmt(f-budget)}.`:`Pri tomto tempe by ti na konci obdobia mohlo zostať približne ${fmt(budget-f)}.`;
  }else{
    $('#forecastValue').textContent='Zatiaľ málo dát';$('#forecastPct').textContent='—';$('#forecastRing').classList.add('disabled');$('#forecastRing').style.background='conic-gradient(rgba(255,255,255,.15) 0deg,rgba(255,255,255,.08) 0deg)';$('#forecastCopy').textContent=`Potrebujeme aspoň 3 dni a 5 transakcií. Teraz: ${daysElapsed()} deň/dní a ${txPeriod().length} platieb.`;
  }
  $('#categoryList').innerHTML=cats().map(categoryCard).join('');bindToggleButtons();renderPlannedOverview();
  const merchants=topMerchants();$('#topMerchants').innerHTML=merchants.length?merchants.map((m,i)=>`<div class="rank-row"><div><div class="rank-name">${i+1}. ${esc(m.name)}</div><div class="rank-sub">${m.count} ${m.count===1?'platba':'platieb'}</div></div><b>${fmt(m.sum)}</b></div>`).join(''):'<div class="planned-empty">Zatiaľ málo platieb.</div>';
  const dayMap={};txPeriod().forEach(t=>{const d=new Date(t.ts).toLocaleDateString('sk-SK');if(!dayMap[d])dayMap[d]={sum:0,count:0};dayMap[d].sum+=Number(t.amount||0);dayMap[d].count++});const best=Object.entries(dayMap).map(([date,v])=>({date,...v})).sort((a,b)=>b.sum-a.sum)[0],highlight=$('#currentPeriodHighlight');if(!best){highlight.innerHTML='<div class="trend-muted">Zatiaľ tu nie sú žiadne výdavky.</div>'}else{highlight.innerHTML=`<div class="trend-big">${fmt(best.sum)}</div><div class="trend-muted">${esc(best.date)} · ${best.count} ${best.count===1?'platba':'platieb'} v najdrahšom dni tohto obdobia.</div>`}
  const pair=getMealPair();$('#recipeActionText').textContent=`Obed + večera ~${fmt(pair.lunch.c+pair.dinner.c)}`;
}

function openEditTx(id){const t=state.transactions.find(x=>x.id===id);if(!t)return;currentEditTxId=id;$('#editTxAmount').value=String(t.amount).replace('.',',');$('#editTxMerchant').value=t.merchant;$('#editTxCategory').innerHTML=cats().map(c=>`<option value="${c.id}" ${c.id===t.category?'selected':''}>${esc(c.icon)} ${esc(c.name)}</option>`).join('');$('#editTxRemember').checked=false;$('#editTxSource').textContent=`Zdroj: ${t.source||'manual'} · ${new Date(t.ts).toLocaleString('sk-SK')}`;$('#editTxDialog').showModal()}
function renderExpenses(){
  let list=txPeriod(); if(currentFilter!=='all')list=list.filter(t=>t.category===currentFilter); if(currentSearch)list=list.filter(t=>String(t.merchant).toLowerCase().includes(currentSearch.toLowerCase()));
  $('#txCategoryFilter').innerHTML=`<option value="all">Všetky kategórie</option>`+cats().map(c=>`<option value="${c.id}" ${currentFilter===c.id?'selected':''}>${esc(c.icon)} ${esc(c.name)}</option>`).join('');
  $('#expenseSummary').textContent=`Zobrazené: ${list.length} · spolu ${fmt(list.reduce((s,t)=>s+t.amount,0))}`;$('#emptyState').style.display=list.length?'none':'block';
  $('#transactions').innerHTML=list.sort((a,b)=>b.ts-a.ts).map(t=>{const c=cat(t.category);return `<div class="tx"><div class="tx-left"><div class="tx-icon">${esc(c.icon)}</div><div><div class="tx-title">${esc(t.merchant)}</div><div class="tx-sub">${esc(c.name)} · ${new Date(t.ts).toLocaleString('sk-SK',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}<br>${esc(t.source||'manual')}</div></div></div><div class="tx-right"><span class="tx-amt">−${fmt(t.amount)}</span><button class="edit-btn" data-edit-tx="${t.id}">Upraviť</button><button class="delete-btn" data-del="${t.id}">✕</button></div></div>`}).join('');
  $$('[data-edit-tx]').forEach(b=>b.onclick=()=>openEditTx(b.dataset.editTx));$$('[data-del]').forEach(b=>b.onclick=()=>deleteTx(b.dataset.del));
}
function deleteTx(id){const t=state.transactions.find(x=>x.id===id);if(!t)return;if(!confirm(`Vymazať ${t.merchant} ${fmt(t.amount)}?`))return;if(t.externalId&&!state.ignoredExternalIds.includes(t.externalId))state.ignoredExternalIds.push(t.externalId);state.transactions=state.transactions.filter(x=>x.id!==id);save();render();toast('Výdavok vymazaný.')}

function mealSeed(offset=0){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`)}
function seededRecipe(seed,salt=0){let x=(seed*9301+49297+salt*233)%233280;if(x<0)x+=233280;return RECIPES[Math.floor((x/233280)*RECIPES.length)%RECIPES.length]}
function getMealPair(offset=recipeOffset){const seed=mealSeed(offset),lunch=seededRecipe(seed,3);let dinner=seededRecipe(seed,11),tries=0;while((dinner===lunch||(lunch.chicken&&dinner.chicken))&&tries<RECIPES.length){dinner=RECIPES[(RECIPES.indexOf(dinner)+5)%RECIPES.length];tries++}return {lunch,dinner}}
function shoppingKey(){return `${periodKey()}|meal-${mealSeed(recipeOffset)}`}
function combinedIngredients(lunch,dinner){const all=[...lunch.ing.map(x=>`Obed: ${x}`),...dinner.ing.map(x=>`Večera: ${x}`)];return all}
function renderShopping(lunch,dinner){const key=shoppingKey();if(!state.shopping[key])state.shopping[key]={};const items=combinedIngredients(lunch,dinner);$('#shoppingList').innerHTML=items.map((x,i)=>`<label class="shopping-item ${state.shopping[key][i]?'checked':''}"><input type="checkbox" data-shop="${i}" ${state.shopping[key][i]?'checked':''}><span>${esc(x)}</span></label>`).join('');$$('[data-shop]').forEach(ch=>ch.onchange=()=>{state.shopping[key][ch.dataset.shop]=ch.checked;save();renderShopping(lunch,dinner)})}
function renderMealCard(prefix,r,daily){
  $(`#${prefix}Icon`).textContent=r.i;$(`#${prefix}Name`).textContent=r.n;$(`#${prefix}Macros`).textContent=`Odhad ceny porcie ~${fmt(r.c)} · ${r.k} kcal · ${r.p} g bielkovín · ${r.t} min`;
  $(`#${prefix}Ingredients`).innerHTML=r.ing.map(x=>`<li>${esc(x)}</li>`).join('');$(`#${prefix}Steps`).innerHTML=r.s.map(x=>`<li>${esc(x)}</li>`).join('');$(`#${prefix}Tip`).textContent=`💡 ${r.tip}`;
  $(`#${prefix}BudgetLine`).innerHTML=`Táto porcia stojí odhadom <b>${fmt(r.c)}</b>. Denný limit na jedlo je teraz <b>${fmt(daily)}</b>.`;
  const badge=$(`#${prefix}FitBadge`),ok=daily<=0||r.c<=daily;badge.textContent=ok?'V limite':'Nad denný limit';badge.className=`fit-badge ${ok?'good':'bad'}`;
}
function renderFood(){
  const fc=cat('food')||{limit:0},spent=catSpent('food'),remain=Math.max(0,Number(fc.limit||0)-spent),daily=remain/daysLeft(),pair=getMealPair(),lunch=pair.lunch,dinner=pair.dinner,total=lunch.c+dinner.c;
  $('#foodRemaining').textContent=fmt(remain);$('#foodDaily').textContent=fmt(daily);$('#foodSpent').textContent=fmt(spent);$('#foodDailyBadge').textContent=`${fmt(daily)}/deň`;
  $('#mealDateLabel').textContent=new Date(Date.now()+recipeOffset*86400000).toLocaleDateString('sk-SK',{weekday:'long',day:'numeric',month:'long'});
  renderMealCard('lunch',lunch,daily);renderMealCard('dinner',dinner,daily);
  $('#mealPairCost').textContent=fmt(total);$('#mealPairLimit').textContent=fmt(daily);const ok=daily===0||total<=daily;$('#mealPairStatus').innerHTML=ok?`✅ Obe domáce jedlá spolu sa zmestia do dnešného limitu.`:`⚠️ Obe domáce jedlá spolu sú približne o <b>${fmt(total-daily)}</b> nad dnešným limitom. Wolt alebo iné reálne platby sa do rozpočtu zapisujú automaticky cez Tatra Sync.`;
  renderShopping(lunch,dinner);
  const plan=Array.from({length:5},(_,i)=>({pair:getMealPair(recipeOffset+i),date:new Date(Date.now()+(recipeOffset+i)*86400000)}));const sum=plan.reduce((s,x)=>s+x.pair.lunch.c+x.pair.dinner.c,0);$('#fiveDayPlan').innerHTML=plan.map((x,i)=>`<div class="plan-day-row"><div><b>${i===0?'Dnes':x.date.toLocaleDateString('sk-SK',{weekday:'short',day:'numeric',month:'numeric'})}</b><small>☀️ ${esc(x.pair.lunch.n)} · ${fmt(x.pair.lunch.c)}<br>🌙 ${esc(x.pair.dinner.n)} · ${fmt(x.pair.dinner.c)}</small></div><strong>${fmt(x.pair.lunch.c+x.pair.dinner.c)}</strong></div>`).join('')+`<div class="plan-total">5 dní (obed + večera) spolu približne: ${fmt(sum)}</div>`;
}
function findCheaperDay(){const current=getMealPair(),currentCost=current.lunch.c+current.dinner.c,daily=Math.max(0,(Number(cat('food')?.limit||0)-catSpent('food'))/daysLeft());let bestOff=recipeOffset,bestCost=currentCost;for(let off=-16;off<=16;off++){const p=getMealPair(off),cost=p.lunch.c+p.dinner.c;if(cost<bestCost&&(daily<=0||cost<=daily)){bestCost=cost;bestOff=off}}recipeOffset=bestOff;renderFood();toast(bestCost<currentCost?`Lacnejšia dvojica: ${fmt(bestCost)}`:'Lacnejšiu dvojicu som nenašiel.')}

function parseAmount(txt){for(const p of [/(?:znizeny|znížený)\s+o\s+(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(?:EUR|€)\s*(-?\d{1,5}[\.,]\d{2})/i]){const m=txt.match(p);if(m)return Math.abs(Number(m[1].replace(',','.')))}return null}
function cleanMerchant(v=''){return String(v).trim().replace(/[.\s]+$/,'').replace(/\s+/g,' ')}
function parseMerchant(txt){const exact=txt.match(/Popis\s+transakcie\s*:\s*Platba\s+kartou[^,\n]*,\s*([^\n]+)/i);if(exact)return cleanMerchant(exact[1]);const lines=txt.split(/\n+/).map(s=>s.trim()).filter(Boolean);return cleanMerchant(lines.find(l=>!/eur|€|tatra|banka|platba|karta|debet|vazeny klient|vážený klient|zostatok|uctovny|aktualny|disponibilny/i.test(l))||'Neznámy obchod')}
function showParsed(txt,autoImport=false){const a=parseAmount(txt),m=parseMerchant(txt);if(!txt){$('#parseResult').textContent='Vlož text e-mailu.';return}if(!a){$('#parseResult').textContent='Suma sa nedala rozpoznať.';return}const c=autoCat(m),fp=fingerprint(a,m,txt),duplicate=state.transactions.some(t=>t.fingerprint===fp);$('#parseResult').innerHTML=`<div><b>${duplicate?'⚠️ Už pridané':'✅ Rozpoznané'}</b><br>${fmt(a)} · ${esc(m)} · ${esc(cat(c).name)}${duplicate?'':`<br><button id="importParsed" class="primary compact" style="margin-top:10px">Pridať platbu</button>`}</div>`;if(autoImport&&!duplicate){addTx(a,m,c,'Tatra B-mail test',fp);return}setTimeout(()=>$('#importParsed')?.addEventListener('click',()=>addTx(a,m,c,'Tatra B-mail',fp)),0)}
function testEmail(){const samples=[`Vazeny klient,\n\n4.10.2026 15:12 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 3,64 EUR.\nuctovny zostatok: 33,86 EUR\n\nPopis transakcie: Platba kartou 4405**9260, NVIDIA CORPORATION.`,`Vazeny klient,\n\n4.10.2026 15:20 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 18,47 EUR.\n\nPopis transakcie: Platba kartou 4405**9260, WOLT.`,`Vazeny klient,\n\n4.10.2026 15:25 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 40,00 EUR.\n\nPopis transakcie: Platba kartou 4405**9260, OMV KOSICE.`];return samples[Math.floor(Math.random()*samples.length)]}

function renderCategoryEditor(){
  $('#categoryEditor').innerHTML=cats().map(c=>`<div class="cat-edit-card"><div class="cat-edit-head"><div class="cat-edit-title"><span>${esc(c.icon)}</span><span>${esc(c.name)}</span></div>${!DEFAULT_CATEGORIES.some(d=>d.id===c.id)?`<button class="mini-delete" data-delcat="${c.id}">Vymazať</button>`:''}</div><div class="cat-edit-grid"><label>Názov<input data-cat-name="${c.id}" value="${esc(c.name)}"></label><label>Limit (€)<input inputmode="decimal" data-cat-limit="${c.id}" value="${String(c.limit).replace('.',',')}"></label><label>Režim<select data-cat-type="${c.id}"><option value="spend" ${c.type==='spend'?'selected':''}>Bežné výdavky</option><option value="toggle" ${c.type==='toggle'?'selected':''}>Zaplatené / nezaplatené</option></select></label></div></div>`).join('');
  $$('[data-cat-limit]').forEach(i=>i.oninput=updateBudgetSum);$$('[data-delcat]').forEach(b=>b.onclick=()=>{state.settings.categories=state.settings.categories.filter(c=>c.id!==b.dataset.delcat);save();renderSettings();toast('Kategória vymazaná.')});
}
function updateBudgetSum(){const sum=cats().reduce((s,c)=>s+parseNum(document.querySelector(`[data-cat-limit="${c.id}"]`)?.value??c.limit),0),budget=parseNum($('#budgetInput')?.value||state.settings.budget),el=$('#categoryBudgetSum');el.textContent=`Súčet limitov kategórií: ${fmt(sum)} z celkového rozpočtu ${fmt(budget)}.`;el.style.color=sum>budget?'var(--warn)':'var(--muted)'}
function renderPlannedEditor(){const el=$('#plannedEditor');if(!state.planned.length){el.innerHTML='<div class="planned-empty">Žiadne plánované platby.</div>';return}el.innerHTML=state.planned.map(p=>`<div class="planned-item"><div class="planned-left"><div class="planned-icon">${esc(cat(p.category)?.icon||'📌')}</div><div><div class="planned-title">${esc(p.name)}</div><div class="planned-sub">${fmt(p.amount)} · deň ${p.day||'—'} · ${esc(cat(p.category)?.name||'Ostatné')}</div></div></div><div class="planned-actions"><button class="quick-btn ${p.paid?'paid':''}" data-plan-toggle="${p.id}">${p.paid?'Zaplatené':'Čaká'}</button><button class="mini-delete" data-plan-del="${p.id}">Vymazať</button></div></div>`).join('');$$('[data-plan-toggle]').forEach(b=>b.onclick=()=>{const p=state.planned.find(x=>x.id===b.dataset.planToggle);p.paid=!p.paid;save();renderSettings();renderOverview()});$$('[data-plan-del]').forEach(b=>b.onclick=()=>{state.planned=state.planned.filter(x=>x.id!==b.dataset.planDel);save();renderSettings();renderOverview()})}
function renderSettings(){const s=state.settings;$('#budgetInput').value=String(s.budget).replace('.',',');$('#savingsInput').value=String(s.savings).replace('.',',');$('#currentPeriodSummary').textContent=`Aktuálne obdobie od ${new Date(periodStartTs()).toLocaleDateString('sk-SK')} · minuté ${fmt(totalSpent())} · ${txPeriod().length} platieb`;renderCategoryEditor();renderPlannedEditor();updateBudgetSum()}


function refreshSelects(){const opts=cats().map(c=>`<option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>`).join('');$('#categoryInput').innerHTML=opts;$('#plannedCategory').innerHTML=opts}
function render(){refreshSelects();renderOverview();renderExpenses();renderFood();renderSettings();renderTatraSync()}

// Navigácia a udalosti
$$('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('#quickSettingsBtn').onclick=()=>navigate('settings');$('#overviewAddBtn').onclick=$('#expensesAddBtn').onclick=()=>$('#addDialog').showModal();
$('#merchantInput').oninput=e=>$('#categoryInput').value=autoCat(e.target.value);
$('#saveTxBtn').onclick=e=>{e.preventDefault();const a=parseNum($('#amountInput').value),m=$('#merchantInput').value.trim();if(!a||!m)return;addTx(a,m,$('#categoryInput').value);$('#addForm').reset();$('#addDialog').close()};
$('#txCategoryFilter').onchange=e=>{currentFilter=e.target.value;renderExpenses()};$('#txSearch').oninput=e=>{currentSearch=e.target.value.trim();renderExpenses()};
$('#editTxSave').onclick=e=>{e.preventDefault();const t=state.transactions.find(x=>x.id===currentEditTxId);if(!t)return;const amount=parseNum($('#editTxAmount').value),merchant=$('#editTxMerchant').value.trim(),category=$('#editTxCategory').value;if(!amount||!merchant)return;t.amount=amount;t.merchant=merchant;t.category=category;if($('#editTxRemember').checked)state.merchantRules[merchantKey(merchant)]=category;save();$('#editTxDialog').close();render();toast($('#editTxRemember').checked?'Opravené a pravidlo zapamätané.':'Transakcia opravená.')};
$('#editTxDelete').onclick=()=>{if(currentEditTxId)deleteTx(currentEditTxId);$('#editTxDialog').close()};
$('#prevMealDayBtn').onclick=()=>{recipeOffset--;renderFood()};$('#nextMealDayBtn').onclick=()=>{recipeOffset++;renderFood()};$('#cheaperDayBtn').onclick=findCheaperDay;$('#addLunchCostBtn').onclick=()=>{const r=getMealPair().lunch;addTx(r.c,`Domáci obed: ${r.n}`,'food','recept')};$('#addDinnerCostBtn').onclick=()=>{const r=getMealPair().dinner;addTx(r.c,`Domáca večera: ${r.n}`,'food','recept')};$('#resetShoppingBtn').onclick=()=>{state.shopping[shoppingKey()]={};save();renderFood()};
$('#makeTestEmailBtn').onclick=()=>{$('#emailText').value=testEmail();showParsed($('#emailText').value)};$('#testAndImportBtn').onclick=()=>{const t=testEmail();$('#emailText').value=t;showParsed(t,true)};$('#parseBtn').onclick=()=>showParsed($('#emailText').value.trim());
$('#saveSyncBtn').onclick=()=>{state.settings.syncUrl=$('#syncUrlInput').value.trim();state.settings.syncKey=$('#syncKeyInput').value.trim();save();renderTatraSync();toast('Pripojenie uložené.')};$('#syncNowBtn').onclick=()=>syncTatraCloud(false);
$('#saveMainSettingsBtn').onclick=()=>{state.settings.budget=parseNum($('#budgetInput').value)||800;state.settings.savings=parseNum($('#savingsInput').value);save();render();toast('Nastavenia uložené.')};$('#budgetInput').oninput=updateBudgetSum;
$('#saveCategoriesBtn').onclick=()=>{state.settings.categories=cats().map(c=>({...c,name:document.querySelector(`[data-cat-name="${c.id}"]`)?.value.trim()||c.name,limit:parseNum(document.querySelector(`[data-cat-limit="${c.id}"]`)?.value),type:document.querySelector(`[data-cat-type="${c.id}"]`)?.value||c.type}));save();render();toast('Kategórie uložené.')};
$('#addCategoryBtn').onclick=()=>$('#categoryDialog').showModal();$('#createCategoryBtn').onclick=e=>{e.preventDefault();const name=$('#newCatName').value.trim(),limit=parseNum($('#newCatLimit').value);if(!name||!limit)return;state.settings.categories.push({id:`custom_${Date.now()}`,name,icon:$('#newCatIcon').value.trim()||'💳',limit,type:$('#newCatType').value,keywords:[]});save();$('#categoryDialog').close();$('#categoryForm').reset();$('#newCatIcon').value='💳';render();toast('Kategória pridaná.')};
$('#addPlannedBtn').onclick=()=>$('#plannedDialog').showModal();$('#createPlannedBtn').onclick=e=>{e.preventDefault();const name=$('#plannedName').value.trim(),amount=parseNum($('#plannedAmount').value),day=Math.min(30,Math.max(1,parseInt($('#plannedDay').value||'1',10)));if(!name||!amount)return;state.planned.push({id:uid(),name,amount,category:$('#plannedCategory').value||'other',day,paid:false});save();$('#plannedDialog').close();$('#plannedForm').reset();render();toast('Plánovaná platba pridaná.')};
$('#paydayResetBtn').onclick=()=>{if(confirm('Začať nové obdobie? Výdavky z končiaceho obdobia sa vymažú. Tatra Sync, Sync kľúč, kategórie, plánované platby a pravidlá obchodníkov zostanú.')){state.transactions=[];state.settings.periodStart=Date.now();state.monthlyFlags={};state.shopping={};state.planned.forEach(p=>p.paid=false);save();render();navigate('overview');toast('Nové obdobie začalo od nuly.')}};

if('serviceWorker' in navigator){navigator.serviceWorker.register(`./sw.js?v=${CACHE_VERSION}`).then(r=>r.update()).catch(()=>{})}
render();navigate('overview');
setTimeout(()=>syncTatraCloud(true).catch(()=>{}),700);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-(state.settings.lastSync||0)>60000)syncTatraCloud(true).catch(()=>{})});
