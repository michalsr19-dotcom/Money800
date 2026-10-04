const DEFAULT_CATEGORIES = [
  {id:'food',name:'Jedlo',icon:'🍔',limit:270,type:'spend',keywords:['lidl','tesco','kaufland','billa','fresh','coop','mcdonald','kfc','burger','restaurant','restauracia','pizza']},
  {id:'fuel',name:'Tankovanie',icon:'⛽',limit:100,type:'spend',keywords:['omv','shell','slovnaft','orlen','benzina']},
  {id:'gym',name:'Fitko',icon:'🏋️',limit:35,type:'toggle',keywords:['gym','fitness','fitko']},
  {id:'fun',name:'Zábava',icon:'🎮',limit:90,type:'spend',keywords:['steam','playstation','xbox','cinema','kino','bar','pub']},
  {id:'car',name:'Auto',icon:'🚗',limit:80,type:'toggle',keywords:['autodiel','servis','pneuservis','car wash','umyvarka']},
  {id:'hygiene',name:'Hygiena / lekáreň',icon:'🧴',limit:45,type:'spend',keywords:['dm drogerie','101 drogerie','dr.max','benu','lekaren']},
  {id:'other',name:'Ostatné',icon:'🛍️',limit:30,type:'spend',keywords:[]}
];

const DEFAULTS = { budget: 800, savings: 150, categories: DEFAULT_CATEGORIES };
const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(Number(n||0));
const monthKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };

function cloneDefaults(){
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function migrate(raw){
  const defs = cloneDefaults();
  const base = raw && typeof raw === 'object' ? raw : {};
  const settings = base.settings || {};
  const categories = Array.isArray(settings.categories) ? settings.categories : defs.categories;
  const mergedCategories = defs.categories.map(def => {
    const found = categories.find(c => c.id === def.id) || {};
    return {...def, ...found, keywords:def.keywords};
  });
  return {
    settings: {
      budget: Number(settings.budget ?? defs.budget) || defs.budget,
      savings: Number(settings.savings ?? defs.savings) || 0,
      categories: mergedCategories
    },
    transactions: Array.isArray(base.transactions) ? base.transactions : [],
    monthlyFlags: base.monthlyFlags && typeof base.monthlyFlags === 'object' ? base.monthlyFlags : {}
  };
}

const store = {
  get(){
    try{ return migrate(JSON.parse(localStorage.getItem('money800') || 'null')); }
    catch{ return migrate(null); }
  },
  set(v){ localStorage.setItem('money800', JSON.stringify(v)); }
};

let state = store.get();

function save(){ store.set(state); }
function getCategories(){ return state.settings.categories; }
function catById(id){ return getCategories().find(c=>c.id===id) || getCategories().at(-1); }
function txThisMonth(){ const key = monthKey(); return state.transactions.filter(t => t.month === key); }
function daysLeft(){ const d = new Date(); const last = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); return Math.max(1, last - d.getDate() + 1); }
function getMonthFlags(){ const key = monthKey(); if(!state.monthlyFlags[key]) state.monthlyFlags[key] = {}; return state.monthlyFlags[key]; }
function isCategoryPaid(catId){ return !!getMonthFlags()[catId]; }
function setCategoryPaid(catId, paid){ getMonthFlags()[catId] = !!paid; save(); }
function autoCategory(merchant=''){
  const m = merchant.toLowerCase();
  return getCategories().find(c => (c.keywords || []).some(k => m.includes(k)))?.id || 'other';
}
function spentByCategory(catId){
  const cat = catById(catId);
  const txSpent = txThisMonth().filter(t => t.category === catId).reduce((s,t)=>s + Number(t.amount||0), 0);
  const toggleSpent = cat.type === 'toggle' && isCategoryPaid(catId) ? Number(cat.limit || 0) : 0;
  return txSpent + toggleSpent;
}
function spentTotal(){
  return getCategories().reduce((sum, cat) => sum + spentByCategory(cat.id), 0);
}
function escapeHtml(s){
  return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function addTx(amount, merchant, category){
  state.transactions.push({
    id: crypto.randomUUID?.() || Date.now().toString(),
    amount: Number(amount),
    merchant,
    category: category || autoCategory(merchant),
    ts: Date.now(),
    month: monthKey()
  });
  save();
  render();
}
function parseAmount(txt){
  const patterns = [/(-?\d{1,5}[\.,]\d{2})\s*(?:EUR|€)/i,/(?:EUR|€)\s*(-?\d{1,5}[\.,]\d{2})/i,/(-?\d{1,5})\s*(?:EUR|€)/i];
  for(const p of patterns){ const m = txt.match(p); if(m) return Math.abs(Number(m[1].replace(',','.'))); }
  return null;
}
function parseMerchant(txt){
  const candidates = [/obchodn(?:í|i)k(?:a|ovi)?\s*[:\-]?\s*([^\n,;.]+)/i,/u\s+([^\n,;.]{2,40})/i,/v\s+([^\n,;.]{2,40})/i,/merchant\s*[:\-]?\s*([^\n,;.]+)/i];
  for(const p of candidates){ const m = txt.match(p); if(m) return m[1].trim(); }
  const lines = txt.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  return lines.find(l => !/eur|€|tatra|banka|platba|karta/i.test(l)) || 'Neznámy obchod';
}

function renderCategoryEditor(){
  $('#catsEditor').innerHTML = getCategories().map(cat => `
    <div class="cat-edit-card">
      <div class="cat-edit-head"><span class="cat-icon">${cat.icon}</span><span>${escapeHtml(cat.name)}</span></div>
      <div class="cat-edit-grid">
        <label class="cat-edit-row">Názov
          <input data-cat-field="name" data-cat-id="${cat.id}" value="${escapeHtml(cat.name)}" />
        </label>
        <label class="cat-edit-row">Limit (€)
          <input data-cat-field="limit" data-cat-id="${cat.id}" inputmode="decimal" value="${Number(cat.limit || 0).toString().replace('.',',')}" />
        </label>
        <label class="cat-edit-row">Režim
          <select data-cat-field="type" data-cat-id="${cat.id}">
            <option value="spend" ${cat.type==='spend'?'selected':''}>Bežné výdavky</option>
            <option value="toggle" ${cat.type==='toggle'?'selected':''}>Prepínač: iba Zaplatené / Nezaplatené</option>
          </select>
        </label>
        <div class="cat-edit-row">
          <div>Stav tento mesiac</div>
          <div class="toggle-status ${isCategoryPaid(cat.id)?'paid':''}">${cat.type==='toggle' ? (isCategoryPaid(cat.id) ? 'Zaplatené' : 'Nezaplatené') : 'Sleduje výdavky'}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function render(){
  const txs = txThisMonth().sort((a,b)=>b.ts-a.ts);
  const budget = Number(state.settings.budget || DEFAULTS.budget);
  const sav = Number(state.settings.savings || 0);
  const spent = spentTotal();
  const remaining = budget - spent;
  const free = budget - sav - spent;

  $('#monthLabel').textContent = new Intl.DateTimeFormat('sk-SK',{month:'long',year:'numeric'}).format(new Date());
  $('#remainingAmount').textContent = fmt(remaining);
  $('#spentPill').textContent = `Minuté ${fmt(spent)}`;
  $('#txCountPill').textContent = `${txs.length} platieb`;
  $('#budgetProgress').style.width = `${Math.min(100, Math.max(0, (spent / Math.max(1,budget)) * 100))}%`;
  $('#dailyLimit').textContent = fmt(Math.max(0, free) / daysLeft());
  $('#savingsGoal').textContent = fmt(sav);
  $('#freeAfterSavings').textContent = fmt(free);

  const catHtml = getCategories().map(cat => {
    const spentCat = spentByCategory(cat.id);
    const limit = Number(cat.limit || 0);
    const pct = limit > 0 ? Math.min(100, (spentCat / limit) * 100) : 0;
    const paid = cat.type === 'toggle' && isCategoryPaid(cat.id);
    const barClass = paid || pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : '';
    const remain = Math.max(0, limit - spentCat);
    return `
      <div class="category">
        <div class="category-top">
          <div class="category-left">
            <div class="cat-icon">${cat.icon}</div>
            <div>
              <div class="category-name">${escapeHtml(cat.name)}</div>
              <div class="category-meta">${fmt(spentCat)} z ${fmt(limit)}</div>
            </div>
          </div>
          <div class="category-right">
            <strong>${Math.round(pct)}%</strong>
            <div class="remain">${remain > 0 ? `${fmt(remain)} ostáva` : 'Limit vyčerpaný'}</div>
          </div>
        </div>
        <div class="bar"><div class="${barClass}" style="width:${pct}%"></div></div>
        <div class="category-footer">
          <div class="category-badge">${cat.type === 'toggle' ? (paid ? '🔴 Zaplatené' : '⚪ Nezaplatené') : '🟢 Sledovanie výdavkov'}</div>
          ${cat.type === 'toggle' ? `<button class="quick-btn ${paid ? 'paid' : ''}" data-toggle-paid="${cat.id}">${paid ? 'Zrušiť platbu' : 'Označiť zaplatené'}</button>` : ''}
        </div>
      </div>`;
  }).join('');
  $('#categoryList').innerHTML = catHtml;

  $('#transactions').innerHTML = txs.map(t => {
    const c = catById(t.category);
    return `<div class="tx"><div class="tx-left"><div class="tx-icon">${c.icon}</div><div><div class="tx-title">${escapeHtml(t.merchant)}</div><div class="tx-sub">${escapeHtml(c.name)} · ${new Date(t.ts).toLocaleDateString('sk-SK')}</div></div></div><div class="tx-amt">−${fmt(t.amount)}</div></div>`;
  }).join('');
  $('#emptyState').style.display = txs.length ? 'none' : 'block';
  $('#categoryInput').innerHTML = getCategories().map(c => `<option value="${c.id}">${c.icon} ${escapeHtml(c.name)}</option>`).join('');
  $('#budgetInput').value = budget.toString().replace('.',',');
  $('#savingsInput').value = sav.toString().replace('.',',');
  renderCategoryEditor();

  document.querySelectorAll('[data-toggle-paid]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.togglePaid;
      setCategoryPaid(id, !isCategoryPaid(id));
      render();
    };
  });
}

$('#addBtn').onclick = () => $('#addDialog').showModal();
$('#settingsBtn').onclick = () => $('#settingsDialog').showModal();
$('#editCatsBtn').onclick = () => { renderCategoryEditor(); $('#catsDialog').showModal(); };
$('#merchantInput').addEventListener('input', e => $('#categoryInput').value = autoCategory(e.target.value));

$('#saveTxBtn').onclick = e => {
  e.preventDefault();
  const a = Number($('#amountInput').value.replace(',','.'));
  const m = $('#merchantInput').value.trim();
  if(!a || !m) return;
  addTx(a, m, $('#categoryInput').value);
  $('#addForm').reset();
  $('#addDialog').close();
};

$('#saveSettingsBtn').onclick = e => {
  e.preventDefault();
  state.settings.budget = Number($('#budgetInput').value.replace(',','.')) || DEFAULTS.budget;
  state.settings.savings = Number($('#savingsInput').value.replace(',','.')) || 0;
  save();
  render();
  $('#settingsDialog').close();
};

$('#saveCatsBtn').onclick = e => {
  e.preventDefault();
  state.settings.categories = getCategories().map(cat => {
    const name = document.querySelector(`[data-cat-field="name"][data-cat-id="${cat.id}"]`)?.value?.trim() || cat.name;
    const limitRaw = document.querySelector(`[data-cat-field="limit"][data-cat-id="${cat.id}"]`)?.value || String(cat.limit);
    const type = document.querySelector(`[data-cat-field="type"][data-cat-id="${cat.id}"]`)?.value || cat.type;
    return {...cat, name, limit:Number(limitRaw.replace(',','.')) || 0, type};
  });
  save();
  render();
  $('#catsDialog').close();
};

$('#resetCatsBtn').onclick = () => {
  if(!confirm('Obnoviť pôvodné kategórie a limity?')) return;
  state.settings.categories = cloneDefaults().categories;
  const flags = getMonthFlags();
  Object.keys(flags).forEach(k => delete flags[k]);
  save();
  renderCategoryEditor();
  render();
};

$('#testBtn').onclick = () => {
  const samples = [
    ['LIDL Slovensko', 18.47],
    ['OMV Kosice', 40],
    ['McDonald’s', 9.80]
  ];
  const s = samples[Math.floor(Math.random()*samples.length)];
  addTx(s[1], s[0], autoCategory(s[0]));
};

$('#clearBtn').onclick = () => {
  if(confirm('Vymazať všetky transakcie z tohto zariadenia?')){
    state.transactions = [];
    state.monthlyFlags = {};
    save();
    render();
  }
};

$('#parseBtn').onclick = () => {
  const txt = $('#emailText').value.trim();
  const amount = parseAmount(txt);
  const merchant = parseMerchant(txt);
  if(!txt){ $('#parseResult').textContent = 'Vlož text e-mailu.'; return; }
  if(!amount){ $('#parseResult').textContent = 'Suma sa zatiaľ nedala rozpoznať — parser doladíme podľa prvého reálneho B-mailu.'; return; }
  const cat = autoCategory(merchant);
  $('#parseResult').innerHTML = `Rozpoznané: <strong>${fmt(amount)}</strong> · ${escapeHtml(merchant)} · ${escapeHtml(catById(cat).name)} <button id="importParsed" class="link-btn">Pridať</button>`;
  setTimeout(() => {
    const b = $('#importParsed');
    if(b) b.onclick = () => {
      addTx(amount, merchant, cat);
      $('#emailText').value = '';
      $('#parseResult').textContent = 'Pridané.';
    };
  }, 0);
};

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
