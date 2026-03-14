// ── Constants ─────────────────────────────────────────────────────────────
const MIN=60, HOUR=3600, DAY=86400, WEEK=7*DAY;
const MONTH_S=30.4375*DAY, YEAR_S=365.25*DAY;
const WH_DAY=8, WH_WEEK=40, WH_MONTH=160, WH_YEAR=1920;

// ── State ─────────────────────────────────────────────────────────────────
let entries=[], pendingOp='+', outputMode='clock';

const MDESC = {
  clock:   'H.MM.SS clock format — hours can exceed 24',
  natural: 'Calendar breakdown — years, months, weeks, days',
  work:    '8h/day · 5d/week · 160h/month work breakdown',
  hours:   'Total hours only — great for timesheets',
  exact:   'All output formats side by side',
};

// ── Restore saved state ───────────────────────────────────────────────────
chrome.storage.local.get(['outputMode'], (res) => {
  if (res.outputMode) setMode(res.outputMode);
});

// ── Parsing ───────────────────────────────────────────────────────────────
function parseDotColon(raw) {
  const s=raw.replace(/:/g,'.');
  if (!/^\d+(\.\d*)*$/.test(s)) return null;
  const p=s.split('.').filter(x=>x!=='');
  if (!p.length||p.length>3) return null;
  const n=p.map(Number);
  let h=0,m=0,sec=0;
  if (p.length===1) h=n[0];
  else if (p.length===2){h=n[0];m=n[1];}
  else {h=n[0];m=n[1];sec=n[2];}
  return Math.round(h*HOUR+m*MIN+sec);
}
function parseNatural(raw) {
  const re=/(\d+(?:\.\d+)?)\s*(years?|yrs?|y|months?|mos?|weeks?|wks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi;
  let total=0,found=false,x;
  while((x=re.exec(raw))!==null){
    found=true; const v=parseFloat(x[1]),u=x[2].toLowerCase();
    if(/^yr|^year/.test(u)||u==='y') total+=v*YEAR_S;
    else if(/^mo|^month/.test(u))    total+=v*MONTH_S;
    else if(u==='w'||/^wk|^week/.test(u)) total+=v*WEEK;
    else if(u==='d'||/^day/.test(u)) total+=v*DAY;
    else if(u==='h'||/^hr|^hour/.test(u)) total+=v*HOUR;
    else if(u==='m'||/^min/.test(u)) total+=v*MIN;
    else if(u==='s'||/^sec/.test(u)) total+=v;
  }
  return found?Math.round(total):null;
}
function parseTime(raw) {
  if (!raw?.trim()) return null;
  raw=raw.trim();
  if (/[a-zA-Z]/.test(raw)){const n=parseNatural(raw);return n!==null?{totalSeconds:n,display:raw}:null;}
  const dc=parseDotColon(raw);
  if (dc!==null) return {totalSeconds:dc,display:raw};
  if (/^\d+$/.test(raw)) return {totalSeconds:parseInt(raw)*HOUR,display:raw+'h'};
  return null;
}

// ── Formatting ────────────────────────────────────────────────────────────
const pad=n=>String(Math.floor(Math.abs(n))).padStart(2,'0');
const pl=(n,w)=>{n=Math.abs(Math.floor(n));return `${n} ${w}${n!==1?'s':''}`;};
function fmtClock(a){const h=Math.floor(a/HOUR),m=Math.floor((a%HOUR)/MIN),s=a%MIN;return s===0?`${h}.${pad(m)}`:`${h}.${pad(m)}.${pad(s)}`;}
function fmtNatural(a){
  let r=a;
  const y=Math.floor(r/YEAR_S);r-=y*YEAR_S; const mo=Math.floor(r/MONTH_S);r-=mo*MONTH_S;
  const w=Math.floor(r/WEEK);r-=w*WEEK; const d=Math.floor(r/DAY);r-=d*DAY;
  const h=Math.floor(r/HOUR);r-=h*HOUR; const m=Math.floor(r/MIN);r-=m*MIN; const s=Math.round(r);
  const p=[];
  if(y)p.push(pl(y,'year'));if(mo)p.push(pl(mo,'month'));if(w)p.push(pl(w,'week'));if(d)p.push(pl(d,'day'));
  if(h)p.push(pl(h,'hour'));if(m)p.push(pl(m,'min'));if(s)p.push(pl(s,'sec'));
  return p.length?p.join(' '):'0 sec';
}
function fmtWork(a){
  const th=a/HOUR;
  const y=Math.floor(th/WH_YEAR);let r=th-y*WH_YEAR;
  const mo=Math.floor(r/WH_MONTH);r-=mo*WH_MONTH;
  const w=Math.floor(r/WH_WEEK);r-=w*WH_WEEK;
  const d=Math.floor(r/WH_DAY);r-=d*WH_DAY;
  const h=Math.floor(r);r-=h; const m=Math.round(r*60);
  const p=[];
  if(y)p.push(pl(y,'work year'));if(mo)p.push(pl(mo,'work month'));
  if(w)p.push(pl(w,'work week'));if(d)p.push(pl(d,'work day'));
  if(h)p.push(pl(h,'hour'));if(m)p.push(pl(m,'min'));
  return p.length?p.join(' '):'0 min';
}
function fmtHours(a){const h=a/HOUR;return(h%1===0)?`${h} hours`:`${parseFloat(h.toFixed(4))} hours`;}

// ── Badge helper ──────────────────────────────────────────────────────────
function updateBadge(totalSec) {
  const neg = totalSec < 0;
  const abs = Math.abs(totalSec);
  const h   = Math.floor(abs / HOUR);
  const m   = Math.floor((abs % HOUR) / MIN);
  let text = '';
  if (abs === 0) {
    text = '0';
  } else if (h > 0) {
    text = (neg ? '-' : '') + h + (m > 0 ? '.' + String(m).padStart(2,'0') : '');
  } else {
    text = (neg ? '-' : '') + m + 'm';
  }
  text = text.slice(0, 4);
  const color = neg ? '#f05574' : '#3b9efa';
  chrome.runtime.sendMessage({ type: 'SET_BADGE', text, color });
}

function clearBadge() {
  chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' });
}

// ── Render result ─────────────────────────────────────────────────────────
function renderResult(totalSec) {
  const neg=totalSec<0, abs=Math.abs(Math.round(totalSec)), sg=neg?'−':'';
  const card=document.getElementById('resultCard');
  const rv=document.getElementById('resVal');
  const rx=document.getElementById('resExtras');
  const badge=document.getElementById('resBadge');
  card.className='result-card visible';

  const th=abs/HOUR, tm=Math.floor(abs/MIN), td=abs/DAY;
  const wd=th/WH_DAY, ww=th/WH_WEEK, wm=th/WH_MONTH;
  const hh=Math.floor(abs/HOUR), mm=Math.floor((abs%HOUR)/MIN), ss=abs%MIN;

  const row=(l,v)=>`<div class="res-row"><span class="rfl">${l}</span><span class="rfv">${v}</span></div>`;
  const item=(v,l)=>`<div class="res-item"><div class="rv">${v}</div><div class="rl">${l}</div></div>`;

  let txt='', vcls='res-val', bcls='res-badge', blbl='Result', ext='';
  if(neg){vcls+=' neg';bcls+=' neg';blbl='Negative';}

  if(outputMode==='clock'){
    txt=sg+fmtClock(abs);
    ext=`<div class="res-sub">Breakdown</div><div class="res-grid">
      ${item(sg+hh,'hours')}${item(sg+mm,'minutes')}${item(sg+ss,'seconds')}
      ${item(sg+tm,'total mins')}${item(sg+abs,'total secs')}
    </div>`;
  } else if(outputMode==='natural'){
    txt=sg+fmtNatural(abs);
    if(!neg){vcls+=' nat';bcls+=' nat';blbl='Natural';}
    ext=`<div class="res-sub">Also expressed as</div><div class="res-list">
      ${row('Clock',sg+fmtClock(abs))}${row('Total hours',sg+th.toFixed(2)+' h')}
      ${row('Total days',sg+td.toFixed(3)+' d')}${row('Total mins',sg+tm+' min')}
      ${row('Total secs',sg+abs+' sec')}
    </div>`;
  } else if(outputMode==='work'){
    txt=sg+fmtWork(abs);
    if(!neg){vcls+=' wrk';bcls+=' wrk';blbl='Work time';}
    ext=`<div class="res-sub">8h/day · 5d/wk · 160h/month</div><div class="res-grid">
      ${item(sg+th.toFixed(2),'total hrs')}${item(sg+wd.toFixed(2),'work days')}
      ${item(sg+ww.toFixed(2),'work wks')}${item(sg+wm.toFixed(3),'work mos')}
      ${item(sg+(wm/12).toFixed(3),'work years')}
    </div>`;
  } else if(outputMode==='hours'){
    txt=sg+fmtHours(abs);
    if(!neg){vcls+=' hrs';bcls+=' hrs';blbl='Hours only';}
    ext=`<div class="res-sub">Conversions</div><div class="res-list">
      ${row('Days',sg+parseFloat(td.toFixed(4))+' days')}
      ${row('Minutes',sg+tm+' min')}${row('Seconds',sg+abs+' sec')}
    </div>`;
  } else if(outputMode==='exact'){
    txt=sg+fmtClock(abs);
    ext=`<div class="res-sub">All Formats</div><div class="res-list">
      ${row('Clock',sg+fmtClock(abs))}${row('Natural',sg+fmtNatural(abs))}
      ${row('Work',sg+fmtWork(abs))}${row('Hours',sg+fmtHours(abs))}
      ${row('Total mins',sg+tm+' min')}${row('Total secs',sg+abs+' sec')}
      ${row('Work days',sg+wd.toFixed(2))}${row('Work weeks',sg+ww.toFixed(2))}
      ${row('Work months',sg+wm.toFixed(3))}
    </div>`;
  }

  rv.className=vcls; rv.textContent=txt||'0';
  badge.className=bcls; badge.textContent=blbl;
  rx.innerHTML=ext;

  updateBadge(totalSec);
}

// ── Mode ──────────────────────────────────────────────────────────────────
function setMode(m) {
  outputMode=m;
  document.querySelectorAll('.mode-tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===m));
  document.getElementById('modeDesc').textContent=MDESC[m]||'';
  chrome.storage.local.set({outputMode:m});
  if(document.getElementById('resultCard').classList.contains('visible')) calculate(true);
}

// ── Entries ───────────────────────────────────────────────────────────────
const inp=document.getElementById('timeInput');
const eTok=document.getElementById('exprTokens');

function addEntry(op){
  const raw=inp.value.trim();
  if(!raw){pendingOp=op;renderExpr();inp.focus();return;}
  const parsed=parseTime(raw);
  if(!parsed){inp.classList.add('invalid');inp.focus();setTimeout(()=>inp.classList.remove('invalid'),600);return;}
  entries.push({op:entries.length===0?'+':pendingOp,parsed});
  pendingOp=op;inp.value='';inp.classList.remove('invalid');
  renderExpr();hideResult();inp.focus();
}

function calculate(silent=false){
  const raw=inp.value.trim();
  if(raw){
    const parsed=parseTime(raw);
    if(!parsed){if(!silent){inp.classList.add('invalid');setTimeout(()=>inp.classList.remove('invalid'),600);}return;}
    entries.push({op:entries.length===0?'+':pendingOp,parsed});
    pendingOp='+';inp.value='';renderExpr();
  }
  if(!entries.length){showErr('No time entries to calculate.');return;}
  let total=0;
  for(const e of entries) total+=e.op==='+'?e.parsed.totalSeconds:-e.parsed.totalSeconds;
  renderResult(total);inp.focus();
}

function showErr(msg){
  const card=document.getElementById('resultCard');
  card.className='result-card visible error';
  document.getElementById('resVal').className='res-val';
  document.getElementById('resVal').textContent=msg;
  document.getElementById('resExtras').innerHTML='';
  document.getElementById('resBadge').className='res-badge neg';
  document.getElementById('resBadge').textContent='Error';
}

function hideResult(){document.getElementById('resultCard').className='result-card';}

function clearAll(){
  entries=[];pendingOp='+';inp.value='';inp.classList.remove('invalid');
  renderExpr();hideResult();clearBadge();inp.focus();
}

function undoLast(){
  if(inp.value){inp.value='';return;}
  if(entries.length>0){const last=entries.pop();pendingOp=last.op;inp.value=last.parsed.display;renderExpr();hideResult();}
  inp.focus();
}

function renderExpr(){
  if(!entries.length){eTok.innerHTML='<span class="ph">Enter a time value below…</span>';return;}
  let html='';
  entries.forEach((e,i)=>{
    if(i>0){const c=e.op==='+'?'p':'m';html+=`<span class="tok-op ${c}">${e.op==='+'?'+':'−'}</span>`;}
    html+=`<span class="tok-time">${e.parsed.display}</span>`;
  });
  const c=pendingOp==='+'?'p':'m';
  html+=`<span class="tok-op ${c}" style="opacity:0.28">${pendingOp==='+'?'+':'−'}</span>`;
  eTok.innerHTML=html;
}

// ── Hint ──────────────────────────────────────────────────────────────────
function toggleHint(){
  document.getElementById('hintToggle').classList.toggle('open');
  document.getElementById('hintBody').classList.toggle('open');
}

// ── Donate slide-up overlay ───────────────────────────────────────────────
document.getElementById('donateToggle').addEventListener('click', () => {
  document.getElementById('donateOverlay').classList.add('open');
});
document.getElementById('donateBack').addEventListener('click', () => {
  document.getElementById('donateOverlay').classList.remove('open');
});

document.getElementById('copyUpi').addEventListener('click', () => {
  const upiId = document.getElementById('upiId').textContent;
  navigator.clipboard.writeText(upiId).then(() => {
    const btn = document.getElementById('copyUpi');
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '⎘ Copy'; btn.classList.remove('copied'); }, 2000);
  });
});

// ── Wire up buttons ───────────────────────────────────────────────────────
document.getElementById('hintToggle').addEventListener('click', toggleHint);
document.querySelectorAll('.mode-tab').forEach(t => {
  t.addEventListener('click', () => setMode(t.dataset.mode));
});
document.querySelector('.op-btn.add').addEventListener('click', () => addEntry('+'));
document.querySelector('.op-btn.sub').addEventListener('click', () => addEntry('-'));
document.querySelector('.btn-calc').addEventListener('click', () => calculate());
document.querySelector('.btn-undo').addEventListener('click', () => undoLast());
document.querySelector('.btn-clear').addEventListener('click', () => clearAll());

// ── Detect Mac for shortcut chip ─────────────────────────────────────────
if (navigator.platform.toLowerCase().includes('mac')) {
  document.getElementById('shortcutChip').textContent = '⌘⇧T';
}

// ── Keyboard ──────────────────────────────────────────────────────────────
inp.addEventListener('keydown', e=>{
  const empty=inp.value==='';
  if(e.key==='Backspace'&&empty){
    e.preventDefault();
    if(entries.length>0){const last=entries.pop();pendingOp=last.op;inp.value=last.parsed.display;renderExpr();hideResult();}
    return;
  }
  if(e.key==='+'&&!e.ctrlKey&&!e.metaKey){
    e.preventDefault();
    const cur=inp.value.trim();
    if(cur){const p=parseTime(cur);if(p){entries.push({op:entries.length===0?'+':pendingOp,parsed:p});pendingOp='+';inp.value='';renderExpr();hideResult();}else{inp.classList.add('invalid');setTimeout(()=>inp.classList.remove('invalid'),600);}}
    else{pendingOp='+';renderExpr();}
    return;
  }
  if(e.key==='-'&&!e.ctrlKey&&!e.metaKey){
    e.preventDefault();
    const cur=inp.value.trim();
    if(cur){const p=parseTime(cur);if(p){entries.push({op:entries.length===0?'+':pendingOp,parsed:p});pendingOp='-';inp.value='';renderExpr();hideResult();}else{inp.classList.add('invalid');setTimeout(()=>inp.classList.remove('invalid'),600);}}
    else{pendingOp='-';renderExpr();}
    return;
  }
  if(e.key==='Enter'){
    e.preventDefault();
    if(e.shiftKey){calculate();return;}
    const cur=inp.value.trim();
    if(cur){if(cur.startsWith('-')){inp.value=cur.slice(1);addEntry('-');}else addEntry(pendingOp);}
    else calculate();
    return;
  }
  if(e.key==='Escape'){clearAll();return;}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undoLast();return;}
  if(e.key==='='&&!e.shiftKey){e.preventDefault();calculate();return;}
});

inp.addEventListener('input',()=>{
  inp.classList.remove('invalid');
  const v=inp.value;
  if(v.endsWith('+')){
    const cur=v.slice(0,-1).trim();
    if(cur){const p=parseTime(cur);if(p){entries.push({op:entries.length===0?'+':pendingOp,parsed:p});pendingOp='+';inp.value='';renderExpr();hideResult();return;}}
    inp.value=v.slice(0,-1);pendingOp='+';renderExpr();return;
  }
  if(v==='-'){ inp.value=''; pendingOp='-'; renderExpr(); return; }
});

inp.focus();
