/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Layout e utilitários compartilhados
   ========================================================= */

const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => CONFIG.currency + ' ' + Number(n||0).toLocaleString('pt-BR');
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = p => p + '-' + Math.random().toString(36).slice(2,7);

/* ---------- Storage ---------- */
const STORE = { listings:'fa_listings', jobs:'fa_jobs', devProfile:'fa_dev', clientProfile:'fa_client' };
function load(key, seed){
  try{ const r = localStorage.getItem(key); if(r) return JSON.parse(r); }catch(e){}
  return seed!==undefined ? (Array.isArray(seed)?[...seed]:{...seed}) : null;
}
function save(key, data){ try{ localStorage.setItem(key, JSON.stringify(data)); }catch(e){} }

/* ---------- NAV / FOOTER injetados ---------- */
const NAV = [
  { href:'index.html',       label:'Início' },
  { href:'ofertas.html',     label:'Ofertas' },
  { href:'programador.html', label:'Sou Programador' },
  { href:'cliente.html',     label:'Sou Cliente' }
];

function renderChrome(){
  const page = document.body.dataset.page || '';
  const links = NAV.map(n=>{
    const file = n.href;
    const active = file.startsWith(page) && page ? 'active' : '';
    return `<a href="${file}" class="${active}">${n.label}</a>`;
  }).join('');

  const header = document.createElement('header');
  header.className = 'nav';
  header.innerHTML = `
    <div class="wrap nav-inner">
      <a href="index.html" class="brand"><span class="dot"></span>FUNCIONÁRIO&nbsp;ARTIFICIAL</a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-cta">
        <a href="ofertas.html" class="btn primary">Ver ofertas</a>
      </div>
    </div>`;
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="wrap foot-grid">
      <div>
        <div class="foot-brand">FUNCIONÁRIO ARTIFICIAL</div>
        <p class="foot-meta" style="margin-top:10px">// O MERCADO DE FUNCIONÁRIOS DE IA</p>
      </div>
      <p class="foot-mission">
        Conectamos quem precisa automatizar uma função a quem sabe
        construir o agente que faz o trabalho. A transição para o
        trabalho com IA, de forma direta e acessível.
      </p>
      <nav class="foot-links">
        ${NAV.map(n=>`<a href="${n.href}">${n.label}</a>`).join('')}
        <span class="foot-meta">© 2026 · v0.2</span>
      </nav>
    </div>`;
  document.body.append(footer);

  // crosshairs
  ['tl','tr','bl','br'].forEach(p=>{
    const i = document.createElement('i'); i.className = 'crosshair '+p; document.body.append(i);
  });

  // overlay + toast
  const ov = document.createElement('div'); ov.className='overlay'; ov.id='overlay';
  ov.innerHTML = `<div class="modal" id="modal"></div>`;
  document.body.append(ov);
  const t = document.createElement('div'); t.className='toast'; t.id='toast'; document.body.append(t);
  ov.addEventListener('click', e=>{ if(e.target===ov || e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
}

/* ---------- Toast ---------- */
function toast(msg){
  const t = $('#toast'); if(!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(()=>t.classList.remove('show'), 2800);
}

/* ---------- Modal ---------- */
function openModal(html){
  const m = $('#modal');
  m.innerHTML = `<button class="x" data-close>×</button>` + html;
  $('#overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  const ov = $('#overlay'); if(!ov) return;
  ov.classList.remove('open'); document.body.style.overflow = '';
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
  }, {threshold:.1});
  $$('.reveal').forEach(el=>io.observe(el));
}

/* =========================================================
   FLUXO DE FECHAMENTO DE ACORDO
   --> ÚNICO lugar em que a comissão é revelada ao usuário.
   ========================================================= */
function openDealClose(value, label){
  const v = Number(value)||0;
  const c = commissionFor(v);          // lógica privada (config.js)
  openModal(`
    <span class="label">FECHAR ACORDO PELO SITE</span>
    <h2>Acordo protegido</h2>
    <p class="modal-lead">${esc(label||'')}</p>
    <p class="modal-lead">Fechando pelo site você tem registro do acordo, intermediação e garantia de entrega. Confira os valores:</p>
    <div class="deal-reveal">
      <div class="row"><span>Valor do acordo</span><b>${money(c.value)}</b></div>
      <div class="row fee"><span>Taxa de intermediação</span><b>${money(c.fee)} <small>(${(c.rate*100).toFixed(0)}%)</small></b></div>
      <div class="row total"><span>Valor recebido pelo programador</span><b>${money(c.net)}</b></div>
    </div>
    <div class="deal-actions">
      <button class="btn signal block lg" data-action="confirm">Confirmar e fechar pelo site</button>
    </div>
    <p class="help" style="margin-top:14px">A taxa só existe se o acordo for fechado aqui dentro. Combinar diretamente entre as partes não gera cobrança.</p>
  `);
  $('[data-action="confirm"]', $('#modal')).addEventListener('click', ()=>{
    closeModal(); toast('Acordo registrado pelo site ✓');
  });
}

/* boot do chrome em toda página */
document.addEventListener('DOMContentLoaded', ()=>{ renderChrome(); initReveal(); });
