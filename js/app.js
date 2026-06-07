/* =========================================================
   HUMANICA — Lógica da aplicação
   ========================================================= */

/* ---------- Estado ---------- */
const STORE_KEYS = { listings: 'humanica_listings', jobs: 'humanica_jobs' };

function load(key, seed){
  try{
    const raw = localStorage.getItem(key);
    if(raw) return JSON.parse(raw);
  }catch(e){ /* ambiente sem storage */ }
  return [...seed];
}
function save(key, data){
  try{ localStorage.setItem(key, JSON.stringify(data)); }catch(e){}
}

let listings = load(STORE_KEYS.listings, SEED_LISTINGS);
let jobs     = load(STORE_KEYS.jobs, SEED_JOBS);
let activeTab = 'hire';

/* ---------- Helpers ---------- */
const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => CONFIG.currency + ' ' + Number(n).toLocaleString('pt-BR');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = p => p + '-' + Math.random().toString(36).slice(2,7);

function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* =========================================================
   CALCULADORA DE COMISSÃO
   ========================================================= */
function updateCalc(){
  const deal = Math.max(0, Number($('#deal').value) || 0);
  const rate = Number($('#rate').value) / 100;
  const plat = deal * rate;
  const dev  = deal - plat;
  $('#dev-gets').textContent   = money(Math.round(dev));
  $('#plat-gets').textContent  = money(Math.round(plat));
  $('#total-gets').textContent = money(Math.round(deal));
  $('#rate-val').textContent   = (rate*100).toFixed(0) + '%';
  $('#rate-pct').textContent   = (rate*100).toFixed(0);
  $('#rate-label').textContent = (rate*100).toFixed(0) + '%';
}

/* =========================================================
   RENDER DOS CARDS
   ========================================================= */
function currentData(){
  const q = ($('#search').value || '').toLowerCase().trim();
  let arr;
  if(activeTab === 'job') arr = jobs;
  else arr = listings.filter(l => l.type === activeTab);

  if(q){
    arr = arr.filter(x => (
      (x.title||'') + (x.role||'') + (x.summary||'') + (x.stack||[]).join(' ')
    ).toLowerCase().includes(q));
  }
  return arr;
}

function cardHTML(item){
  const isJob = item.type === 'job';
  const tagClass = item.type === 'hire' ? 'hire' : item.type === 'maint' ? 'maint' : 'job';
  const tagText  = item.type === 'hire' ? 'IA À VENDA' : item.type === 'maint' ? 'MANUTENÇÃO' : 'VAGA ABERTA';
  const price = isJob ? item.budget : item.price;
  const unit  = item.unit === 'mês' ? '/mês' : '';
  const author = isJob ? item.client : item.dev;
  const chips = (item.stack||[]).slice(0,4).map(s=>`<span class="chip">${esc(s)}</span>`).join('');
  const meta = isJob
    ? `${esc(item.posted||'')}<br>${item.proposals||0} propostas`
    : `★ ${item.rating||'—'}<br>${item.sold||0} vendas`;

  return `
  <article class="card" data-id="${item.id}" data-kind="${isJob?'job':'listing'}">
    <div class="card-top">
      <span class="tag ${tagClass}">${tagText}</span>
      <span class="idx">${item.id.toUpperCase()}</span>
    </div>
    <div>
      <h3>${esc(item.title)}</h3>
      <div class="role">${esc(item.role)} · @${esc(author)}</div>
    </div>
    <p>${esc(item.summary)}</p>
    <div class="chips">${chips}</div>
    <div class="card-foot">
      <div class="price">${money(price)}<small>${unit || ' · ' + (item.unit||'única')}</small></div>
      <div class="meta">${meta}</div>
    </div>
  </article>`;
}

function render(){
  const data = currentData();
  const box = $('#cards');
  box.innerHTML = data.length
    ? data.map(cardHTML).join('')
    : `<div class="empty">// NENHUM RESULTADO NESTE FILTRO //</div>`;
  $('#count-label').textContent = `// ${data.length} ${data.length===1?'ITEM':'ITENS'}`;
  // ligar clique de detalhe
  $$('.card', box).forEach(c => c.addEventListener('click', ()=>openDetail(c.dataset.id, c.dataset.kind)));
}

/* =========================================================
   ABAS + BUSCA
   ========================================================= */
function setTab(tab){
  activeTab = tab;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  render();
}

/* =========================================================
   MODAL
   ========================================================= */
const overlay = $('#overlay');
const modal   = $('#modal');

function openModal(html){
  modal.innerHTML = `<button class="x" data-close>×</button>` + html;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- Detalhe de um item ---------- */
function openDetail(id, kind){
  const item = (kind === 'job' ? jobs : listings).find(x => x.id === id);
  if(!item) return;
  const isJob = item.type === 'job';
  const price = isJob ? item.budget : item.price;
  const rate  = CONFIG.rates[item.type] ?? CONFIG.commissionRate;
  const plat  = Math.round(price * rate);
  const other = price - plat;
  const author = isJob ? item.client : item.dev;
  const tasks = (item.tasks||[]).map(t=>`<li>${esc(t)}</li>`).join('');
  const stack = (item.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join('');

  openModal(`
    <span class="label">${isJob?'VAGA ABERTA':item.type==='maint'?'SERVIÇO DE MANUTENÇÃO':'FUNCIONÁRIO IA'}</span>
    <div class="detail-head">
      <div>
        <h2>${esc(item.title)}</h2>
        <div class="role">${esc(item.role)} · @${esc(author)}</div>
      </div>
    </div>
    <div class="detail-body">
      <div><h4>Resumo</h4><p>${esc(item.summary)}</p></div>
      <div><h4>Atribuições que a IA executa</h4><ul>${tasks}</ul></div>
      <div><h4>Stack / capacidades</h4><div class="chips">${stack}</div></div>
      <div class="detail-split">
        <div class="row"><span>Valor ${item.unit==='mês'?'mensal':'do acordo'}</span><b>${money(price)}</b></div>
        <div class="row"><span>${isJob?'Desenvolvedor recebe':'Você recebe'}</span><b>${money(other)}</b></div>
        <div class="row"><span>Taxa HUMANICA (${(rate*100).toFixed(0)}%)</span><b>${money(plat)}</b></div>
      </div>
      <button class="btn ${isJob?'signal':'primary'} block lg" data-action="contact">
        ${isJob ? 'Enviar proposta como programador' : 'Contratar / falar com o dev'}
      </button>
    </div>
  `);
  $('[data-action="contact"]', modal).addEventListener('click', ()=>{
    closeModal();
    toast(isJob ? 'Proposta enviada ✓' : 'Solicitação enviada ao desenvolvedor ✓');
  });
}

/* ---------- Formulário: perfil de programador / publicar IA ---------- */
function openDevForm(){
  openModal(`
    <span class="label">PERFIL DO PROGRAMADOR</span>
    <h2>Publicar funcionário IA</h2>
    <form id="f-dev">
      <div class="field-row">
        <div class="field"><label>Seu handle</label><input name="dev" placeholder="ex.: nucleo.kernel" required></div>
        <div class="field"><label>Tipo de oferta</label>
          <select name="type">
            <option value="hire">Funcionário IA pronto (venda)</option>
            <option value="maint">Serviço de manutenção (mensal)</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Título do agente</label><input name="title" placeholder="ex.: ANALYST-7 · Analista de Dados" required></div>
      <div class="field"><label>Cargo / função que ele substitui</label><input name="role" placeholder="ex.: Analista de Dados Financeiros" required></div>
      <div class="field"><label>Resumo</label><textarea name="summary" placeholder="O que esse agente faz, em poucas linhas." required></textarea></div>
      <div class="field"><label>Atribuições (uma por linha)</label><textarea name="tasks" placeholder="Consolidar relatórios&#10;Detectar anomalias&#10;Responder por chat"></textarea></div>
      <div class="field-row">
        <div class="field"><label>Stack (vírgulas)</label><input name="stack" placeholder="Python, LangChain, GPT-4o"></div>
        <div class="field"><label>Preço (${CONFIG.currency})</label><input name="price" type="number" min="0" step="100" placeholder="4800" required></div>
      </div>
      <button class="btn signal block lg" type="submit">Publicar no marketplace</button>
      <p class="help" style="margin-top:14px">A plataforma retém ${(CONFIG.commissionRate*100).toFixed(0)}% de cada acordo fechado.</p>
    </form>
  `);
  $('#f-dev', modal).addEventListener('submit', e=>{
    e.preventDefault();
    const f = e.target;
    const item = {
      id: uid('l'),
      type: f.type.value,
      title: f.title.value.trim(),
      role: f.role.value.trim(),
      dev: f.dev.value.trim().replace(/^@/,''),
      price: Number(f.price.value)||0,
      unit: f.type.value === 'maint' ? 'mês' : 'única',
      summary: f.summary.value.trim(),
      tasks: f.tasks.value.split('\n').map(s=>s.trim()).filter(Boolean),
      stack: f.stack.value.split(',').map(s=>s.trim()).filter(Boolean),
      rating: '—', sold: 0
    };
    listings.unshift(item);
    save(STORE_KEYS.listings, listings);
    closeModal();
    setTab(item.type);
    toast('Funcionário IA publicado ✓');
  });
}

/* ---------- Formulário: cliente publica vaga ---------- */
function openJobForm(){
  openModal(`
    <span class="label">PERFIL DO CLIENTE</span>
    <h2>Publicar vaga para IA</h2>
    <form id="f-job">
      <div class="field-row">
        <div class="field"><label>Sua empresa</label><input name="client" placeholder="ex.: Distribuidora Norte" required></div>
        <div class="field"><label>Modelo</label>
          <select name="unit">
            <option value="única">Compra única</option>
            <option value="mês">Mensal (operação)</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Título da vaga</label><input name="title" placeholder="ex.: Procuro: Analista de Estoque IA" required></div>
      <div class="field"><label>Cargo a ser substituído</label><input name="role" placeholder="ex.: Analista de Estoque / Compras" required></div>
      <div class="field"><label>Contexto</label><textarea name="summary" placeholder="Descreva o cenário e o objetivo do agente." required></textarea></div>
      <div class="field"><label>Atribuições do trabalho — o que a IA deve executar (uma por linha)</label><textarea name="tasks" placeholder="Ler movimentação do ERP&#10;Prever ruptura de estoque&#10;Sugerir ordens de compra" required></textarea></div>
      <div class="field-row">
        <div class="field"><label>Requisitos / integrações (vírgulas)</label><input name="stack" placeholder="ERP Bling, e-mail, previsão"></div>
        <div class="field"><label>Orçamento (${CONFIG.currency})</label><input name="budget" type="number" min="0" step="100" placeholder="5000" required></div>
      </div>
      <button class="btn primary block lg" type="submit">Publicar vaga</button>
      <p class="help" style="margin-top:14px">Ao fechar com um desenvolvedor, a plataforma retém ${(CONFIG.commissionRate*100).toFixed(0)}% do acordo.</p>
    </form>
  `);
  $('#f-job', modal).addEventListener('submit', e=>{
    e.preventDefault();
    const f = e.target;
    const item = {
      id: uid('j'),
      type: 'job',
      title: f.title.value.trim(),
      role: f.role.value.trim(),
      client: f.client.value.trim(),
      budget: Number(f.budget.value)||0,
      unit: f.unit.value,
      summary: f.summary.value.trim(),
      tasks: f.tasks.value.split('\n').map(s=>s.trim()).filter(Boolean),
      stack: f.stack.value.split(',').map(s=>s.trim()).filter(Boolean),
      posted: 'agora', proposals: 0
    };
    jobs.unshift(item);
    save(STORE_KEYS.jobs, jobs);
    closeModal();
    setTab('job');
    toast('Vaga publicada ✓');
    document.getElementById('market').scrollIntoView({behavior:'smooth'});
  });
}

/* =========================================================
   EVENTOS GLOBAIS
   ========================================================= */
function bind(){
  // calculadora
  $('#deal').addEventListener('input', updateCalc);
  $('#rate').addEventListener('input', updateCalc);
  $('#cur').textContent = CONFIG.currency;

  // abas
  $$('.tab').forEach(t => t.addEventListener('click', ()=>setTab(t.dataset.tab)));
  // busca
  $('#search').addEventListener('input', render);

  // aberturas de modal
  $$('[data-open]').forEach(b => b.addEventListener('click', ()=>{
    if(b.dataset.open === 'form-dev') openDevForm();
    if(b.dataset.open === 'form-job') openJobForm();
  }));

  // fechar modal
  overlay.addEventListener('click', e=>{
    if(e.target === overlay || e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // ajustar taxa-padrão na UI a partir do CONFIG
  $('#rate').value = Math.round(CONFIG.commissionRate*100);

  // reveal on scroll
  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
  }, {threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));
}

/* ---------- init ---------- */
bind();
updateCalc();
render();
