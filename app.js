const DEFAULTS={budget:800,savings:150,categories:[
 {id:'food',name:'Jedlo',icon:'🍔',limit:270,keywords:['lidl','tesco','kaufland','billa','fresh','coop','mcdonald','kfc','burger','restaurant','restauracia','pizza']},
 {id:'fuel',name:'Tankovanie',icon:'⛽',limit:100,keywords:['omv','shell','slovnaft','orlen','benzina']},
 {id:'gym',name:'Fitko',icon:'🏋️',limit:35,keywords:['gym','fitness','fitko']},
 {id:'fun',name:'Zábava',icon:'🎮',limit:90,keywords:['steam','playstation','xbox','cinema','kino','bar','pub']},
 {id:'car',name:'Auto',icon:'🚗',limit:80,keywords:['autodiel','servis','pneuservis','car wash','umyvarka']},
 {id:'hygiene',name:'Hygiena / lekáreň',icon:'🧴',limit:45,keywords:['dm drogerie','101 drogerie','dr.max','benu','lekaren']},
 {id:'other',name:'Ostatné',icon:'🛍️',limit:30,keywords:[]}
]};

const $=s=>document.querySelector(s);
const fmt=n=>new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(Number(n||0));
const monthKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
const store={
 get(){try{return JSON.parse(localStorage.getItem('money800')||'null')||{settings:{budget:DEFAULTS.budget,savings:DEFAULTS.savings},transactions:[]}}catch{return {settings:{budget:800,savings:150},transactions:[]}}},
 set(v){localStorage.setItem('money800',JSON.stringify(v))}
};
let state=store.get();

function catById(id){return DEFAULTS.categories.find(c=>c.id===id)||DEFAULTS.categories.at(-1)}
function autoCategory(merchant=''){const m=merchant.toLowerCase();return DEFAULTS.categories.find(c=>c.keywords.some(k=>m.includes(k)))?.id||'other'}
function txThisMonth(){const key=monthKey();return state.transactions.filter(t=>t.month===key)}
function spentTotal(){return txThisMonth().reduce((s,t)=>s+t.amount,0)}
function daysLeft(){const d=new Date();const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return Math.max(1,last-d.getDate()+1)}
function render(){
 const txs=txThisMonth().sort((a,b)=>b.ts-a.ts),spent=spentTotal(),budget=Number(state.settings.budget||800),sav=Number(state.settings.savings||0),remaining=budget-spent,free=budget-sav-spent;
 $('#monthLabel').textContent=new Intl.DateTimeFormat('sk-SK',{month:'long',year:'numeric'}).format(new Date());
 $('#remainingAmount').textContent=fmt(remaining); $('#spentPill').textContent=`Minuté ${fmt(spent)}`;
 $('#budgetProgress').style.width=`${Math.min(100,Math.max(0,spent/budget*100))}%`;
 $('#dailyLimit').textContent=fmt(Math.max(0,free)/daysLeft()); $('#savingsGoal').textContent=fmt(sav); $('#freeAfterSavings').textContent=fmt(free);
 const cats=DEFAULTS.categories.map(c=>({c,spent:txs.filter(t=>t.category===c.id).reduce((s,t)=>s+t.amount,0)}));
 $('#categoryList').innerHTML=cats.map(({c,spent})=>`<div class="category"><div class="category-top"><div><div class="category-name">${c.icon} ${c.name}</div><div class="category-meta">${fmt(spent)} z ${fmt(c.limit)}</div></div><strong>${Math.max(0,Math.round((c.limit-spent)*100)/100).toLocaleString('sk-SK')} € ostáva</strong></div><div class="bar"><div style="width:${Math.min(100,spent/c.limit*100)}%"></div></div></div>`).join('');
 $('#transactions').innerHTML=txs.map(t=>{const c=catById(t.category);return `<div class="tx"><div class="tx-left"><div class="tx-icon">${c.icon}</div><div><div class="tx-title">${escapeHtml(t.merchant)}</div><div class="tx-sub">${c.name} · ${new Date(t.ts).toLocaleDateString('sk-SK')}</div></div></div><div class="tx-amt">−${fmt(t.amount)}</div></div>`}).join('');
 $('#emptyState').style.display=txs.length?'none':'block';
 $('#categoryInput').innerHTML=DEFAULTS.categories.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
 $('#budgetInput').value=budget;$('#savingsInput').value=sav;
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function addTx(amount,merchant,category){state.transactions.push({id:crypto.randomUUID?.()||Date.now().toString(),amount:Number(amount),merchant,category:category||autoCategory(merchant),ts:Date.now(),month:monthKey()});store.set(state);render()}
function parseAmount(txt){
 const patterns=[/(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(?:EUR|€)\s*(-?\d{1,5}[\.,]\d{2})/i,/(-?\d{1,5})\s*(?:EUR|€)/i];
 for(const p of patterns){const m=txt.match(p);if(m)return Math.abs(Number(m[1].replace(',','.')))}return null;
}
function parseMerchant(txt){
 const candidates=[/obchodn(?:í|i)k(?:a|ovi)?\s*[:\-]?\s*([^\n,;.]+)/i,/u\s+([^\n,;.]{2,40})/i,/v\s+([^\n,;.]{2,40})/i,/merchant\s*[:\-]?\s*([^\n,;.]+)/i];
 for(const p of candidates){const m=txt.match(p);if(m)return m[1].trim()}
 const lines=txt.split(/\n+/).map(s=>s.trim()).filter(Boolean);return lines.find(l=>!/eur|€|tatra|banka|platba|karta/i.test(l))||'Neznámy obchod';
}

$('#addBtn').onclick=()=>$('#addDialog').showModal();
$('#settingsBtn').onclick=()=>$('#settingsDialog').showModal();
$('#saveTxBtn').onclick=e=>{e.preventDefault();const a=Number($('#amountInput').value.replace(',','.'));const m=$('#merchantInput').value.trim();if(!a||!m)return;addTx(a,m,$('#categoryInput').value);$('#addForm').reset();$('#addDialog').close()};
$('#merchantInput').addEventListener('input',e=>$('#categoryInput').value=autoCategory(e.target.value));
$('#saveSettingsBtn').onclick=e=>{e.preventDefault();state.settings.budget=Number($('#budgetInput').value.replace(',','.'))||800;state.settings.savings=Number($('#savingsInput').value.replace(',','.'))||0;store.set(state);render();$('#settingsDialog').close()};
$('#testBtn').onclick=()=>{const samples=[['LIDL Slovensko',18.47],['OMV Kosice',40],['McDonald’s',9.80]];const s=samples[Math.floor(Math.random()*samples.length)];addTx(s[1],s[0],autoCategory(s[0]))};
$('#clearBtn').onclick=()=>{if(confirm('Vymazať všetky transakcie z tohto zariadenia?')){state.transactions=[];store.set(state);render()}};
$('#parseBtn').onclick=()=>{const txt=$('#emailText').value.trim();const amount=parseAmount(txt),merchant=parseMerchant(txt);if(!txt){$('#parseResult').textContent='Vlož text e-mailu.';return}if(!amount){$('#parseResult').textContent='Suma sa zatiaľ nedala rozpoznať — parser doladíme podľa prvého reálneho B-mailu.';return}const cat=autoCategory(merchant);$('#parseResult').innerHTML=`Rozpoznané: <strong>${fmt(amount)}</strong> · ${escapeHtml(merchant)} · ${catById(cat).name} <button id="importParsed" class="link-btn">Pridať</button>`;setTimeout(()=>{const b=$('#importParsed');if(b)b.onclick=()=>{addTx(amount,merchant,cat);$('#emailText').value='';$('#parseResult').textContent='Pridané.'}},0)};

if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
