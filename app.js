const APP_VERSION='5.0';
const CACHE_VERSION='12';
const BUDGET_PERIOD_DAYS=30;

const DEFAULT_CATEGORIES=[
  {id:'food',name:'Jedlo',icon:'🍔',limit:300,type:'spend',keywords:['lidl','tesco','kaufland','billa','fresh','coop','mcdonald','kfc','burger','restaurant','restauracia','pizza','obed','jedlo']},
  {id:'fuel',name:'Tankovanie',icon:'⛽',limit:90,type:'spend',keywords:['omv','shell','slovnaft','orlen','benzina']},
  {id:'gym',name:'Fitko',icon:'🏋️',limit:35,type:'toggle',keywords:['gym','fitness','fitko']},
  {id:'fun',name:'Zábava',icon:'🎮',limit:90,type:'spend',keywords:['steam','playstation','xbox','cinema','kino','bar','pub','nvidia','geforce']},
  {id:'car',name:'Auto / rezerva',icon:'🚗',limit:80,type:'toggle',keywords:['autodiel','servis','pneuservis','car wash','umyvarka']},
  {id:'hygiene',name:'Hygiena / lekáreň',icon:'🧴',limit:45,type:'spend',keywords:['dm drogerie','101 drogerie','dr.max','benu','lekaren']},
  {id:'other',name:'Ostatné',icon:'🛍️',limit:30,type:'spend',keywords:[]}
];

const DEFAULT_STATE={
  settings:{
    budget:800,savings:150,workLunchPrice:6,
    periodStart:new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime(),
    syncUrl:'',syncKey:'',lastSync:0,categories:DEFAULT_CATEGORIES
  },
  transactions:[],monthlyFlags:{},shopping:{},merchantRules:{},ignoredExternalIds:[],planned:[],history:[],version:APP_VERSION
};

// 31 večerí: minimum zeleniny, väčšinou len voliteľná príloha.
const RECIPES=[
  {n:'Kuracie prsia s ryžou a cesnakovým jogurtom',i:'🍗',c:3.45,k:665,p:55,t:30,ing:['200 g kuracích pŕs','90 g ryže v suchom stave','80 g gréckeho jogurtu','1 strúčik cesnaku','1 ČL oleja','soľ, čierne korenie, paprika','zelenina voliteľne'],s:['Ryžu prepláchni a uvar podľa návodu, zvyčajne 12–15 minút.','Kuracie prsia osušíš, nakrájaš na menšie kúsky a osolíš.','Panvicu rozohrej, pridaj olej a mäso opekaj 7–9 minút, kým nie je hotové.','Jogurt zmiešaj s pretlačeným cesnakom, štipkou soli a korenia.','Ryžu daj na tanier, pridaj kuracie a jogurtový dip.'],tip:'Ak chceš viac kalórií, pridaj 20–30 g syra. Zeleninu môžeš úplne vynechať.'},
  {n:'Kuracie prsia s americkými zemiakmi',i:'🥔',c:3.70,k:690,p:56,t:35,ing:['200 g kuracích pŕs','350 g zemiakov','1 ČL oleja','40 g light syra','soľ, paprika, cesnak','kečup alebo jogurtový dip'],s:['Rúru rozohrej na 210 °C.','Zemiaky umy, nakrájaj na mesiačiky, premiešaj s olejom a korením.','Peč približne 25–30 minút a v polovici ich otoč.','Kuracie prsia rozkroj na tenšie plátky a opeč 4–5 minút z každej strany.','Na posledné 2 minúty daj na mäso syr a nechaj ho roztopiť.','Podávaj so zemiakmi a dipom.'],tip:'Zemiaky môžeš pripraviť aj v teplovzdušnej fritéze približne 20 minút.'},
  {n:'Kuracie kari s ryžou bez zeleniny',i:'🍛',c:3.90,k:710,p:52,t:25,ing:['190 g kuracích pŕs','90 g ryže','100 ml light kokosového mlieka','1 ČL kari','1 ČL oleja','soľ, cesnak'],s:['Daj variť ryžu.','Kuracie nakrájaj na kocky a opeč na oleji 6–8 minút.','Pridaj kari, cesnak a soľ a krátko premiešaj.','Zalej kokosovým mliekom a var 5 minút na miernom ohni.','Podávaj s hotovou ryžou.'],tip:'Ak kokosové mlieko nechceš kupovať, použi 80 ml smotany na varenie a trochu kari.'},
  {n:'Kuracie cestoviny s parmezánom',i:'🍝',c:4.10,k:735,p:54,t:25,ing:['190 g kuracích pŕs','100 g cestovín','120 g paradajkovej passaty','25 g parmezánu','1 ČL oleja','soľ, oregano, cesnak'],s:['Cestoviny uvar al dente.','Kuracie nakrájaj a opeč na oleji.','Pridaj passatu, oregano a cesnak a povar 4–5 minút.','Vmiešaj scedené cestoviny.','Na tanieri posyp parmezánom.'],tip:'Passatu môžeš nahradiť jemnou smotanovou omáčkou, ak ti paradajková nechutí.'},
  {n:'Tortilla s kuracím a syrom',i:'🌯',c:3.80,k:640,p:50,t:20,ing:['170 g kuracích pŕs','2 tortilly','50 g light syra','50 g gréckeho jogurtu','soľ, paprika','šalát voliteľne'],s:['Kuracie nakrájaj na tenké kúsky a okoreň.','Opeč ho 7–8 minút na panvici.','Tortillu nahrej 20–30 sekúnd.','Naplň ju kuracím, syrom a jogurtom.','Zroluj a ešte minútu opeč spojom nadol.'],tip:'Ak nechceš šalát ani inú zeleninu, tortilla funguje úplne dobre len s mäsom, syrom a dipom.'},
  {n:'Ryža s kuracím a vajíčkom',i:'🍚',c:3.55,k:720,p:57,t:25,ing:['170 g kuracích pŕs','85 g ryže','2 vajcia','1 ČL oleja','sójová omáčka','cesnak'],s:['Ryžu uvar a nechaj pár minút vychladnúť.','Kuracie nakrájaj a opeč dohotova.','Mäso odsuň na stranu panvice a rozklepni vajcia.','Vajcia premiešaj, pridaj ryžu a spoj všetko dokopy.','Dochut malým množstvom sójovej omáčky.'],tip:'Najlepšie to funguje s ryžou uvarenou deň vopred, ale nie je to nutné.'},
  {n:'Kuracie prsia, kaša a omáčka',i:'🥘',c:3.95,k:700,p:53,t:35,ing:['200 g kuracích pŕs','350 g zemiakov','50 ml mlieka','10 g masla','80 ml smotany light','soľ, korenie'],s:['Zemiaky ošúp, nakrájaj a var 18–20 minút.','Kuracie osoľ a opeč na panvici z oboch strán.','Hotové mäso odlož a do panvice nalej smotanu.','Omáčku krátko povar a dochuť.','Zemiaky roztlač s mliekom a maslom.','Podávaj mäso s kašou a omáčkou.'],tip:'Na omáčku stačí aj trocha vody z panvice + jogurt, ak chceš lacnejšiu verziu.'},
  {n:'Hovädzie mleté s ryžou',i:'🥩',c:4.95,k:745,p:48,t:25,ing:['180 g chudého hovädzieho mletého','90 g ryže','1 ČL oleja','20 g syra','soľ, korenie, paprika'],s:['Ryžu daj variť.','Mleté hovädzie daj na rozohriatu panvicu a rozdeľ vareškou.','Opekaj 8–10 minút a dochuť.','Vmiešaj trochu syra alebo ho daj navrch.','Podávaj s ryžou.'],tip:'Hovädzie je drahšie, preto ho pokojne vymeň za morčacie mleté.'},
  {n:'Morčacie mleté so zemiakovou kašou',i:'🥔',c:4.20,k:700,p:50,t:35,ing:['200 g morčacieho mletého','350 g zemiakov','50 ml mlieka','10 g masla','1 ČL oleja','soľ, korenie'],s:['Zemiaky uvar domäkka.','Morčacie mäso opeč na panvici a dobre rozdeľ.','Dochut soľou, korením a paprikou.','Zemiaky rozpuč s mliekom a maslom.','Mäso daj na kašu alebo vedľa nej.'],tip:'Ak chceš omáčku, pridaj k mäsu 2 lyžice passaty alebo trochu smotany.'},
  {n:'Kuracia tortilla pizza',i:'🍕',c:3.60,k:590,p:47,t:20,ing:['2 tortilly','150 g kuracích pŕs','80 g passaty','60 g light mozzarelly','oregano'],s:['Rúru rozohrej na 210 °C.','Kuracie nakrájaj nadrobno a krátko opeč.','Tortilly daj na plech a potri passatou.','Pridaj kuracie, syr a oregano.','Peč 8–10 minút, kým sa syr neroztopí.'],tip:'Na veľmi chrumkavú verziu peč priamo na rošte s papierom na pečenie.'},
  {n:'Kuracie gnocchi so smotanou',i:'🥟',c:4.25,k:735,p:49,t:20,ing:['180 g kuracích pŕs','250 g gnocchi','70 ml smotany light','25 g parmezánu','cesnak, soľ'],s:['Kuracie nakrájaj a opeč dozlata.','Gnocchi uvar podľa obalu, zvyčajne len pár minút.','Do panvice ku kuraciemu pridaj smotanu a cesnak.','Pridaj gnocchi a premiešaj.','Na konci posyp parmezánom.'],tip:'Jedlo je sýte, takže nemusíš pridávať žiadnu prílohu.'},
  {n:'Kuracie teriyaki s ryžou',i:'🥢',c:4.05,k:695,p:50,t:25,ing:['190 g kuracích pŕs','90 g ryže','25 ml teriyaki omáčky','1 ČL oleja','sezam voliteľne'],s:['Ryžu uvar.','Kuracie nakrájaj na kúsky a opeč 7–8 minút.','Zníž teplotu a pridaj teriyaki omáčku.','Premiešaj, aby sa mäso obalilo omáčkou.','Podávaj s ryžou a prípadne sezamom.'],tip:'Teriyaki omáčky stačí málo, inak vie jedlo zbytočne presoliť.'},
  {n:'Omeleta so šunkou, syrom a pečivom',i:'🍳',c:2.95,k:570,p:43,t:15,ing:['3 vajcia','80 g šunky s vysokým obsahom mäsa','40 g syra','1–2 krajce pečiva','soľ, korenie'],s:['Vajcia rozšľahaj so soľou a korením.','Šunku nakrájaj a minútu prehrej na panvici.','Zalej vajíčkami.','Keď spodok stuhne, pridaj syr a omeletu prelož.','Podávaj s pečivom.'],tip:'Jedna z najlacnejších večerí s vysokým obsahom bielkovín.'},
  {n:'Cottage, vajcia a pečené zemiaky',i:'🥚',c:2.85,k:610,p:40,t:30,ing:['150 g cottage','3 vajcia','300 g zemiakov','1 ČL oleja','soľ, paprika'],s:['Zemiaky nakrájaj na malé kocky.','Premiešaj ich s olejom a korením a peč pri 210 °C asi 25 minút.','Medzitým priprav vajcia na tvrdo alebo na panvici.','Na tanier daj zemiaky, vajcia a cottage.'],tip:'Veľmi jednoduché jedlo na dni, keď sa ti nechce variť mäso.'},
  {n:'Kuracie pesto cestoviny',i:'🍝',c:4.25,k:740,p:51,t:25,ing:['180 g kuracích pŕs','100 g cestovín','20 g pesta','25 g parmezánu','soľ'],s:['Cestoviny uvar a odlož trochu vody z varenia.','Kuracie nakrájaj a opeč.','Cestoviny pridaj do panvice k mäsu.','Vmiešaj pesto a 1–2 lyžice vody z cestovín.','Posyp parmezánom.'],tip:'Pesto je kalorické, preto stačí 20 g.'},
  {n:'Kuracie quesadilly',i:'🌮',c:3.90,k:670,p:52,t:20,ing:['170 g kuracích pŕs','2 tortilly','70 g light syra','50 g gréckeho jogurtu','paprika korenie'],s:['Kuracie nakrájaj na malé kúsky a opeč.','Na polovicu tortilly daj mäso a syr.','Tortillu prelož a opeč na suchej panvici 2–3 minúty z každej strany.','Nakrájaj na trojuholníky.','Podávaj s jogurtovým dipom.'],tip:'Dobré aj studené do práce na ďalší deň.'},
  {n:'Bravčová panenka so zemiakmi',i:'🥩',c:4.80,k:680,p:49,t:35,ing:['180 g bravčovej panenky','330 g zemiakov','1 ČL oleja','horčica','soľ, korenie'],s:['Zemiaky priprav v rúre alebo fritéze.','Panenku nakrájaj na medailóniky.','Osoľ, okoreň a opekaj približne 3 minúty z každej strany.','Nechaj mäso 3 minúty odpočinúť.','Podávaj so zemiakmi a trochou horčice.'],tip:'Panenku neprepekaj príliš dlho, inak bude suchá.'},
  {n:'Kuracie s ryžovými rezancami',i:'🍜',c:4.00,k:675,p:48,t:20,ing:['180 g kuracích pŕs','100 g ryžových rezancov','20 ml sójovej omáčky','1 ČL oleja','cesnak'],s:['Ryžové rezance priprav podľa návodu.','Kuracie nakrájaj na pásiky a opeč.','Pridaj cesnak a sójovú omáčku.','Vmiešaj rezance a minútu prehrievaj.'],tip:'Ak chceš, pridaj mrazenú wok zeleninu, ale nie je potrebná.'},
  {n:'Tuniakové cestoviny',i:'🐟',c:3.35,k:650,p:44,t:20,ing:['1 konzerva tuniaka vo vlastnej šťave','100 g cestovín','120 g passaty','20 g syra','soľ, oregano'],s:['Uvar cestoviny.','Tuniaka sceď.','Passatu zohrej na panvici a pridaj tuniaka.','Vmiešaj cestoviny.','Posyp syrom a oreganom.'],tip:'Tuniaka nemusíš dlho variť, stačí ho iba prehriať.'},
  {n:'Kurací burger s domácimi hranolkami',i:'🍔',c:4.35,k:730,p:52,t:35,ing:['180 g kuracích pŕs','1 burger žemľa','300 g zemiakov','30 g light syra','jogurtový dip'],s:['Zemiaky nakrájaj na hranolky a peč pri 210 °C asi 30 minút.','Kuracie rozklep alebo prekroj na tenší plátok.','Opeč ho z oboch strán.','Na mäso polož syr.','Žemľu naplň mäsom a dipom a podávaj s hranolkami.'],tip:'Chuťou je to bližšie fast foodu, ale stále vieš presne kontrolovať porciu.'},
  {n:'Morčacie bolognese',i:'🍝',c:4.10,k:715,p:50,t:30,ing:['180 g morčacieho mletého','100 g cestovín','160 g passaty','20 g parmezánu','cesnak, oregano'],s:['Cestoviny daj variť.','Morčacie mäso opeč 7–9 minút.','Pridaj passatu, cesnak a oregano.','Povar 5 minút.','Podávaj s cestovinami a parmezánom.'],tip:'Morčacie mleté je často lacnejšie než hovädzie a stále má veľa bielkovín.'},
  {n:'Kuracie s kuskusom a syrom',i:'🍚',c:3.50,k:620,p:50,t:20,ing:['190 g kuracích pŕs','90 g kuskusu','35 g feta alebo balkánskeho syra','1 ČL oleja','soľ, paprika'],s:['Kuskus daj do misky a zalej rovnakým objemom horúcej vody.','Zakry na 5 minút.','Kuracie opeč na panvici.','Kuskus prehrab vidličkou a pridaj syr.','Podávaj s kuracím.'],tip:'Kuskus je ideálny, keď nechceš dlho čakať na ryžu.'},
  {n:'Hovädzí burger bowl bez šalátu',i:'🍔',c:5.10,k:745,p:46,t:30,ing:['180 g hovädzieho mletého','330 g zemiakov','40 g syra','50 g jogurtu','kečup, horčica'],s:['Zemiaky upeč do chrumkava.','Mleté mäso osoľ, rozdeľ na kúsky a opeč.','Jogurt zmiešaj s trochou kečupu a horčice.','Do misky daj zemiaky, mäso a syr.','Prelej burger dipom.'],tip:'Všetka burger chuť bez potreby zeleniny alebo žemle.'},
  {n:'Kuracie so syrovou omáčkou a ryžou',i:'🧀',c:4.05,k:720,p:55,t:25,ing:['190 g kuracích pŕs','85 g ryže','60 ml smotany light','35 g light syra','cesnak, soľ'],s:['Ryžu uvar.','Kuracie opeč dozlata a odlož bokom.','Do panvice nalej smotanu a pridaj syr.','Miešaj, kým vznikne hladká omáčka.','Vráť mäso a podávaj s ryžou.'],tip:'Ak je omáčka príliš hustá, pridaj lyžicu vody.'},
  {n:'Zapečené kuracie so zemiakmi a syrom',i:'🧀',c:4.20,k:715,p:56,t:40,ing:['200 g kuracích pŕs','320 g zemiakov','60 g light mozzarelly','50 ml smotany light','soľ, paprika'],s:['Rúru rozohrej na 200 °C.','Zemiaky nakrájaj na tenšie plátky a predvar 7 minút.','Kuracie nakrájaj a okoreň.','Do zapekacej misy daj zemiaky, kuracie a trochu smotany.','Posyp syrom a peč približne 25 minút.'],tip:'Priprav si rovno dve porcie a druhú máš na ďalší deň.'},
  {n:'Kurací kebab tanier doma',i:'🥙',c:3.95,k:680,p:52,t:30,ing:['190 g kuracích pŕs','300 g zemiakov','70 g gréckeho jogurtu','kebab korenie','1 ČL oleja','cibuľa voliteľne'],s:['Zemiaky upeč alebo daj do fritézy.','Kuracie nakrájaj na veľmi tenké pásiky.','Premiešaj s kebab korením a opeč na vysokej teplote.','Jogurt dochuť cesnakom a soľou.','Podávaj mäso so zemiakmi a dipom.'],tip:'Je to dobrá náhrada za kebab z donášky a vie byť o dosť lacnejšia.'},
  {n:'Kuracie s vajíčkom a zemiakmi',i:'🍳',c:3.55,k:690,p:57,t:30,ing:['170 g kuracích pŕs','300 g zemiakov','2 vajcia','1 ČL oleja','soľ, paprika'],s:['Zemiaky nakrájaj na kocky a opeč pod pokrievkou alebo upeč.','Kuracie nakrájaj a opeč zvlášť.','Na konci pridaj vajcia na panvicu.','Všetko spoj alebo podávaj vedľa seba.'],tip:'Veľmi sýte jedlo s jednoduchými surovinami.'},
  {n:'Kuracie s bulgurom a jogurtovým dipom',i:'🍗',c:3.55,k:625,p:51,t:25,ing:['190 g kuracích pŕs','90 g bulguru','70 g gréckeho jogurtu','cesnak, soľ','zelenina voliteľne'],s:['Bulgur var približne 12 minút.','Kuracie okoreň a opeč dohotova.','Jogurt dochuť cesnakom a soľou.','Podávaj kuracie s bulgurom a dipom.'],tip:'Ak bulgur nemusíš, použi rovnaké množstvo ryže.'},
  {n:'Kuracie carbonara fitness',i:'🍝',c:4.30,k:740,p:56,t:25,ing:['170 g kuracích pŕs','100 g cestovín','1 vajce','25 g parmezánu','40 g kvalitnej šunky','čierne korenie'],s:['Cestoviny uvar a odlož trochu vody.','Kuracie a šunku opeč.','V miske zmiešaj vajce s parmezánom.','Panvicu odstav z ohňa, pridaj cestoviny a vajíčkovú zmes.','Rýchlo premiešaj a podľa potreby pridaj trochu vody z cestovín.'],tip:'Vajíčko pridávaj mimo priameho ohňa, aby z neho nebola praženica.'},
  {n:'Kuracie placky s ryžou',i:'🥞',c:3.75,k:670,p:55,t:30,ing:['190 g kuracích pŕs','1 vajce','20 g strúhaného syra','80 g ryže','korenie'],s:['Kuracie nasekaj veľmi nadrobno.','Zmiešaj ho s vajcom, syrom a korením.','Zo zmesi vytvaruj malé placky.','Opekaj 4–5 minút z každej strany.','Podávaj s uvarenou ryžou.'],tip:'Ak sa zmes rozpadáva, pridaj lyžicu strúhanky.'},
  {n:'Morčací burger so zemiakmi',i:'🍔',c:4.20,k:695,p:49,t:35,ing:['180 g morčacieho mletého','1 burger žemľa','280 g zemiakov','30 g syra','jogurtový dip'],s:['Zemiaky nakrájaj a upeč.','Morčacie mleté osoľ a vytvaruj placku.','Opeč ju 5–6 minút z každej strany.','Pridaj syr a nechaj roztopiť.','Daj do žemle s dipom a podávaj so zemiakmi.'],tip:'Morčací burger je ľahší než hovädzí a stále veľmi sýty.'},
  {n:'Kuracie nugetky z rúry a zemiaky',i:'🍗',c:3.85,k:675,p:53,t:35,ing:['190 g kuracích pŕs','25 g strúhanky','1 vajce','300 g zemiakov','soľ, paprika'],s:['Rúru rozohrej na 210 °C.','Kuracie nakrájaj na kúsky.','Obaľ ich vo vajíčku a potom v ochutenej strúhanke.','Na druhú polovicu plechu daj zemiaky.','Peč približne 22–25 minút, v polovici otoč.'],tip:'Chuťovo blízko fast foodu, ale s presnou porciou a bez vyprážania.'},
  {n:'Kuracie s ryžou a cheddarom',i:'🧀',c:3.95,k:705,p:54,t:25,ing:['190 g kuracích pŕs','90 g ryže','40 g cheddaru','50 g gréckeho jogurtu','paprika, soľ'],s:['Ryžu uvar.','Kuracie nakrájaj a dobre opeč.','Do horúcej ryže vmiešaj nastrúhaný cheddar.','Pridaj mäso a navrch trochu jogurtu.'],tip:'Ak chceš nižšie kalórie, použi 25 g syra namiesto 40 g.'}
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
      workLunchPrice:Number(r.settings?.workLunchPrice??6)||6,
      periodStart:Number(r.settings?.periodStart)||new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime(),
      syncUrl:String(r.settings?.syncUrl||''),
      syncKey:String(r.settings?.syncKey||''),
      lastSync:Number(r.settings?.lastSync||0),
      categories
    },
    transactions:Array.isArray(r.transactions)?r.transactions:[],
    monthlyFlags:r.monthlyFlags||{},shopping:r.shopping||{},merchantRules:r.merchantRules||{},
    ignoredExternalIds:Array.isArray(r.ignoredExternalIds)?r.ignoredExternalIds:[],
    planned:Array.isArray(r.planned)?r.planned:[],history:Array.isArray(r.history)?r.history:[],version:APP_VERSION
  };
}
const store={get(){try{return migrate(JSON.parse(localStorage.getItem('money800')||'null'))}catch{return clone(DEFAULT_STATE)}},set(v){localStorage.setItem('money800',JSON.stringify(v))}};
let state=store.get(),recipeOffset=0,currentFilter='all',currentSearch='',currentEditTxId=null;
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

function currentAvgPerDay(){return totalSpent()/daysElapsed()}
function previousHistory(){return state.history.at(-1)||null}
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
  const prev=previousHistory(),trend=$('#trendSummary'); if(!prev){trend.innerHTML='<div class="trend-muted">Porovnanie sa zobrazí po prvom resete pri výplate. Money800 si minulé obdobie uloží.</div>'}else{const prevAvg=Number(prev.avgPerDay||0),cur=currentAvgPerDay(),diff=cur-prevAvg,pct=prevAvg?Math.round(Math.abs(diff)/prevAvg*100):0;trend.innerHTML=`<div class="trend-big ${diff<=0?'trend-good':'trend-bad'}">${diff<=0?'−':'+'}${fmt(Math.abs(diff))}/deň</div><div class="trend-muted">${diff<=0?'Míňaš pomalšie':'Míňaš rýchlejšie'} približne o ${pct}% oproti minulému obdobiu (${fmt(prevAvg)}/deň).</div>`}
  const r=getRecipe();$('#recipeActionText').textContent=`${r.n} · ~${fmt(r.c)}`;
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

function dayOfYear(){const n=new Date(),start=new Date(n.getFullYear(),0,0);return Math.floor((n-start)/86400000)}
function recipeAt(offset=0){let idx=(dayOfYear()+offset)%RECIPES.length;if(idx<0)idx+=RECIPES.length;return RECIPES[idx]}
function getRecipe(){return recipeAt(recipeOffset)}
function shoppingKey(){return `${periodKey()}|${dayOfYear()+recipeOffset}`}
function renderShopping(r){const key=shoppingKey();if(!state.shopping[key])state.shopping[key]={};$('#shoppingList').innerHTML=r.ing.map((x,i)=>`<label class="shopping-item ${state.shopping[key][i]?'checked':''}"><input type="checkbox" data-shop="${i}" ${state.shopping[key][i]?'checked':''}><span>${esc(x)}</span></label>`).join('');$$('[data-shop]').forEach(ch=>ch.onchange=()=>{state.shopping[key][ch.dataset.shop]=ch.checked;save();renderShopping(r)})}
function renderFood(){
  const fc=cat('food')||{limit:0},spent=catSpent('food'),remain=Math.max(0,Number(fc.limit||0)-spent),daily=remain/daysLeft(),r=getRecipe(),lunch=Number(state.settings.workLunchPrice||6),dailyTotal=lunch+r.c;
  $('#foodRemaining').textContent=fmt(remain);$('#foodDaily').textContent=fmt(daily);$('#foodSpent').textContent=fmt(spent);$('#foodDailyBadge').textContent=`${fmt(daily)}/deň`;$('#workLunchPriceLabel').textContent=fmt(lunch);$('#workLunchBtn').textContent=`Pridať obed ${fmt(lunch)}`;
  $('#recipeDayLabel').textContent=`Večera · ${new Date(Date.now()+recipeOffset*86400000).toLocaleDateString('sk-SK')}`;$('#recipeIcon').textContent=r.i;$('#recipeName').textContent=r.n;$('#recipeMacros').textContent=`~${fmt(r.c)} · ${r.k} kcal · ${r.p} g bielkovín · ${r.t} min`;
  $('#recipeIngredients').innerHTML=r.ing.map(x=>`<li>${esc(x)}</li>`).join('');$('#recipeSteps').innerHTML=r.s.map(x=>`<li>${esc(x)}</li>`).join('');$('#recipeTip').textContent=`💡 ${r.tip}`;
  const fit=$('#recipeFitBadge'),inLimit=daily===0||dailyTotal<=daily;fit.textContent=inLimit?'Obed + večera v limite':'Obed + večera nad limit';fit.className=`fit-badge ${inLimit?'good':'bad'}`;
  $('#mealBudgetLine').innerHTML=`Obed ${fmt(lunch)} + večera ~${fmt(r.c)} = <b>${fmt(dailyTotal)}</b>. Denný food limit je <b>${fmt(daily)}</b>. ${inLimit?'✅ Zmestíš sa.':`⚠️ Nad limit približne o ${fmt(dailyTotal-daily)}.`}`;
  renderShopping(r);
  const plan=Array.from({length:5},(_,i)=>recipeAt(recipeOffset+i)),sum=plan.reduce((s,x)=>s+x.c,0);$('#fiveDayPlan').innerHTML=plan.map((x,i)=>`<div class="plan-day-row"><div><b>${i===0?'Dnes':`+${i} deň`} · ${esc(x.n)}</b><small>${x.p} g bielkovín · ${x.t} min</small></div><strong>${fmt(x.c)}</strong></div>`).join('')+`<div class="plan-total">5 večerí spolu približne: ${fmt(sum)}</div>`;
}
function findCheaperRecipe(){const current=getRecipe();const daily=Math.max(0,(Number(cat('food')?.limit||0)-catSpent('food'))/daysLeft()-Number(state.settings.workLunchPrice||6));let bestIndex=-1,bestCost=Infinity;RECIPES.forEach((r,i)=>{if(r.c<current.c&&r.c<bestCost&&(daily<=0||r.c<=daily)){bestCost=r.c;bestIndex=i}});if(bestIndex<0){RECIPES.forEach((r,i)=>{if(r.c<bestCost){bestCost=r.c;bestIndex=i}})}const base=(dayOfYear()%RECIPES.length);recipeOffset=bestIndex-base;renderFood();toast(`Lacnejší tip: ${fmt(bestCost)}`)}

function parseAmount(txt){for(const p of [/(?:znizeny|znížený)\s+o\s+(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(?:EUR|€)\s*(-?\d{1,5}[\.,]\d{2})/i]){const m=txt.match(p);if(m)return Math.abs(Number(m[1].replace(',','.')))}return null}
function cleanMerchant(v=''){return String(v).trim().replace(/[.\s]+$/,'').replace(/\s+/g,' ')}
function parseMerchant(txt){const exact=txt.match(/Popis\s+transakcie\s*:\s*Platba\s+kartou[^,\n]*,\s*([^\n]+)/i);if(exact)return cleanMerchant(exact[1]);const lines=txt.split(/\n+/).map(s=>s.trim()).filter(Boolean);return cleanMerchant(lines.find(l=>!/eur|€|tatra|banka|platba|karta|debet|vazeny klient|vážený klient|zostatok|uctovny|aktualny|disponibilny/i.test(l))||'Neznámy obchod')}
function showParsed(txt,autoImport=false){const a=parseAmount(txt),m=parseMerchant(txt);if(!txt){$('#parseResult').textContent='Vlož text e-mailu.';return}if(!a){$('#parseResult').textContent='Suma sa nedala rozpoznať.';return}const c=autoCat(m),fp=fingerprint(a,m,txt),duplicate=state.transactions.some(t=>t.fingerprint===fp);$('#parseResult').innerHTML=`<div><b>${duplicate?'⚠️ Už pridané':'✅ Rozpoznané'}</b><br>${fmt(a)} · ${esc(m)} · ${esc(cat(c).name)}${duplicate?'':`<br><button id="importParsed" class="primary compact" style="margin-top:10px">Pridať platbu</button>`}</div>`;if(autoImport&&!duplicate){addTx(a,m,c,'Tatra B-mail test',fp);return}setTimeout(()=>$('#importParsed')?.addEventListener('click',()=>addTx(a,m,c,'Tatra B-mail',fp)),0)}
function testEmail(){const samples=[`Vazeny klient,\n\n4.10.2026 15:12 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 3,64 EUR.\nuctovny zostatok: 33,86 EUR\n\nPopis transakcie: Platba kartou 4405**9260, NVIDIA CORPORATION.`,`Vazeny klient,\n\n4.10.2026 15:20 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 18,47 EUR.\n\nPopis transakcie: Platba kartou 4405**9260, LIDL SLOVENSKO.`,`Vazeny klient,\n\n4.10.2026 15:25 bol zostatok Vasho uctu SKxxxxxxxxxxxxxxxxxxxx znizeny o 40,00 EUR.\n\nPopis transakcie: Platba kartou 4405**9260, OMV KOSICE.`];return samples[Math.floor(Math.random()*samples.length)]}

function renderCategoryEditor(){
  $('#categoryEditor').innerHTML=cats().map(c=>`<div class="cat-edit-card"><div class="cat-edit-head"><div class="cat-edit-title"><span>${esc(c.icon)}</span><span>${esc(c.name)}</span></div>${!DEFAULT_CATEGORIES.some(d=>d.id===c.id)?`<button class="mini-delete" data-delcat="${c.id}">Vymazať</button>`:''}</div><div class="cat-edit-grid"><label>Názov<input data-cat-name="${c.id}" value="${esc(c.name)}"></label><label>Limit (€)<input inputmode="decimal" data-cat-limit="${c.id}" value="${String(c.limit).replace('.',',')}"></label><label>Režim<select data-cat-type="${c.id}"><option value="spend" ${c.type==='spend'?'selected':''}>Bežné výdavky</option><option value="toggle" ${c.type==='toggle'?'selected':''}>Zaplatené / nezaplatené</option></select></label></div></div>`).join('');
  $$('[data-cat-limit]').forEach(i=>i.oninput=updateBudgetSum);$$('[data-delcat]').forEach(b=>b.onclick=()=>{state.settings.categories=state.settings.categories.filter(c=>c.id!==b.dataset.delcat);save();renderSettings();toast('Kategória vymazaná.')});
}
function updateBudgetSum(){const sum=cats().reduce((s,c)=>s+parseNum(document.querySelector(`[data-cat-limit="${c.id}"]`)?.value??c.limit),0),budget=parseNum($('#budgetInput')?.value||state.settings.budget),el=$('#categoryBudgetSum');el.textContent=`Súčet limitov kategórií: ${fmt(sum)} z celkového rozpočtu ${fmt(budget)}.`;el.style.color=sum>budget?'var(--warn)':'var(--muted)'}
function renderPlannedEditor(){const el=$('#plannedEditor');if(!state.planned.length){el.innerHTML='<div class="planned-empty">Žiadne plánované platby.</div>';return}el.innerHTML=state.planned.map(p=>`<div class="planned-item"><div class="planned-left"><div class="planned-icon">${esc(cat(p.category)?.icon||'📌')}</div><div><div class="planned-title">${esc(p.name)}</div><div class="planned-sub">${fmt(p.amount)} · deň ${p.day||'—'} · ${esc(cat(p.category)?.name||'Ostatné')}</div></div></div><div class="planned-actions"><button class="quick-btn ${p.paid?'paid':''}" data-plan-toggle="${p.id}">${p.paid?'Zaplatené':'Čaká'}</button><button class="mini-delete" data-plan-del="${p.id}">Vymazať</button></div></div>`).join('');$$('[data-plan-toggle]').forEach(b=>b.onclick=()=>{const p=state.planned.find(x=>x.id===b.dataset.planToggle);p.paid=!p.paid;save();renderSettings();renderOverview()});$$('[data-plan-del]').forEach(b=>b.onclick=()=>{state.planned=state.planned.filter(x=>x.id!==b.dataset.planDel);save();renderSettings();renderOverview()})}
function renderHistory(){const el=$('#historyList');if(!state.history.length){el.innerHTML='<div class="planned-empty">História vznikne po prvom resete pri výplate.</div>';return}el.innerHTML=[...state.history].reverse().slice(0,6).map(h=>`<div class="history-row"><b>${new Date(h.start).toLocaleDateString('sk-SK')} – ${new Date(h.end).toLocaleDateString('sk-SK')}</b><small>Minuté ${fmt(h.spent)} · ${h.txCount} platieb · priemer ${fmt(h.avgPerDay)}/deň</small></div>`).join('')}
function renderSettings(){const s=state.settings;$('#budgetInput').value=String(s.budget).replace('.',',');$('#savingsInput').value=String(s.savings).replace('.',',');$('#workLunchInput').value=String(s.workLunchPrice).replace('.',',');$('#currentPeriodSummary').textContent=`Aktuálne obdobie od ${new Date(periodStartTs()).toLocaleDateString('sk-SK')} · minuté ${fmt(totalSpent())} · ${txPeriod().length} platieb`;renderCategoryEditor();renderPlannedEditor();renderHistory();updateBudgetSum()}

function archiveCurrentPeriod(){const current=txPeriod(),spent=totalSpent();state.history.push({id:uid(),start:periodStartTs(),end:Date.now(),spent,txCount:current.length,days:daysElapsed(),avgPerDay:spent/Math.max(1,daysElapsed()),categories:Object.fromEntries(cats().map(c=>[c.id,catSpent(c.id)]))});if(state.history.length>24)state.history=state.history.slice(-24)}

function refreshSelects(){const opts=cats().map(c=>`<option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>`).join('');$('#categoryInput').innerHTML=opts;$('#plannedCategory').innerHTML=opts}
function render(){refreshSelects();renderOverview();renderExpenses();renderFood();renderSettings();renderTatraSync()}

// Navigácia a udalosti
$$('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('#quickSettingsBtn').onclick=()=>navigate('settings');$('#overviewAddBtn').onclick=$('#expensesAddBtn').onclick=()=>$('#addDialog').showModal();
$('#merchantInput').oninput=e=>$('#categoryInput').value=autoCat(e.target.value);
$('#saveTxBtn').onclick=e=>{e.preventDefault();const a=parseNum($('#amountInput').value),m=$('#merchantInput').value.trim();if(!a||!m)return;addTx(a,m,$('#categoryInput').value);$('#addForm').reset();$('#addDialog').close()};
$('#txCategoryFilter').onchange=e=>{currentFilter=e.target.value;renderExpenses()};$('#txSearch').oninput=e=>{currentSearch=e.target.value.trim();renderExpenses()};
$('#editTxSave').onclick=e=>{e.preventDefault();const t=state.transactions.find(x=>x.id===currentEditTxId);if(!t)return;const amount=parseNum($('#editTxAmount').value),merchant=$('#editTxMerchant').value.trim(),category=$('#editTxCategory').value;if(!amount||!merchant)return;t.amount=amount;t.merchant=merchant;t.category=category;if($('#editTxRemember').checked)state.merchantRules[merchantKey(merchant)]=category;save();$('#editTxDialog').close();render();toast($('#editTxRemember').checked?'Opravené a pravidlo zapamätané.':'Transakcia opravená.')};
$('#editTxDelete').onclick=()=>{if(currentEditTxId)deleteTx(currentEditTxId);$('#editTxDialog').close()};
$('#prevRecipeBtn').onclick=()=>{recipeOffset--;renderFood()};$('#nextRecipeBtn').onclick=()=>{recipeOffset++;renderFood()};$('#cheaperRecipeBtn').onclick=findCheaperRecipe;$('#addRecipeCostBtn').onclick=()=>{const r=getRecipe();addTx(r.c,r.n,'food','recept')};$('#workLunchBtn').onclick=()=>addTx(state.settings.workLunchPrice,'Obed v práci','food','rýchle pridanie');$('#resetShoppingBtn').onclick=()=>{state.shopping[shoppingKey()]={};save();renderFood()};
$('#makeTestEmailBtn').onclick=()=>{$('#emailText').value=testEmail();showParsed($('#emailText').value)};$('#testAndImportBtn').onclick=()=>{const t=testEmail();$('#emailText').value=t;showParsed(t,true)};$('#parseBtn').onclick=()=>showParsed($('#emailText').value.trim());
$('#saveSyncBtn').onclick=()=>{state.settings.syncUrl=$('#syncUrlInput').value.trim();state.settings.syncKey=$('#syncKeyInput').value.trim();save();renderTatraSync();toast('Pripojenie uložené.')};$('#syncNowBtn').onclick=()=>syncTatraCloud(false);
$('#saveMainSettingsBtn').onclick=()=>{state.settings.budget=parseNum($('#budgetInput').value)||800;state.settings.savings=parseNum($('#savingsInput').value);state.settings.workLunchPrice=parseNum($('#workLunchInput').value)||6;save();render();toast('Nastavenia uložené.')};$('#budgetInput').oninput=updateBudgetSum;
$('#saveCategoriesBtn').onclick=()=>{state.settings.categories=cats().map(c=>({...c,name:document.querySelector(`[data-cat-name="${c.id}"]`)?.value.trim()||c.name,limit:parseNum(document.querySelector(`[data-cat-limit="${c.id}"]`)?.value),type:document.querySelector(`[data-cat-type="${c.id}"]`)?.value||c.type}));save();render();toast('Kategórie uložené.')};
$('#addCategoryBtn').onclick=()=>$('#categoryDialog').showModal();$('#createCategoryBtn').onclick=e=>{e.preventDefault();const name=$('#newCatName').value.trim(),limit=parseNum($('#newCatLimit').value);if(!name||!limit)return;state.settings.categories.push({id:`custom_${Date.now()}`,name,icon:$('#newCatIcon').value.trim()||'💳',limit,type:$('#newCatType').value,keywords:[]});save();$('#categoryDialog').close();$('#categoryForm').reset();$('#newCatIcon').value='💳';render();toast('Kategória pridaná.')};
$('#addPlannedBtn').onclick=()=>$('#plannedDialog').showModal();$('#createPlannedBtn').onclick=e=>{e.preventDefault();const name=$('#plannedName').value.trim(),amount=parseNum($('#plannedAmount').value),day=Math.min(30,Math.max(1,parseInt($('#plannedDay').value||'1',10)));if(!name||!amount)return;state.planned.push({id:uid(),name,amount,category:$('#plannedCategory').value||'other',day,paid:false});save();$('#plannedDialog').close();$('#plannedForm').reset();render();toast('Plánovaná platba pridaná.')};
$('#paydayResetBtn').onclick=()=>{if(confirm('Začať nové obdobie? Tatra Sync, Sync kľúč, kategórie a pravidlá zostanú uložené.')){archiveCurrentPeriod();state.settings.periodStart=Date.now();state.monthlyFlags={};state.shopping={};state.planned.forEach(p=>p.paid=false);save();render();navigate('overview');toast('Nové obdobie začalo.')}};

if('serviceWorker' in navigator){navigator.serviceWorker.register(`./sw.js?v=${CACHE_VERSION}`).then(r=>r.update()).catch(()=>{})}
render();navigate('overview');
setTimeout(()=>syncTatraCloud(true).catch(()=>{}),700);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-(state.settings.lastSync||0)>60000)syncTatraCloud(true).catch(()=>{})});
