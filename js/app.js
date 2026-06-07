/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Lógica por página
   ========================================================= */

let listings = load(STORE.listings, SEED_LISTINGS);
let jobs     = load(STORE.jobs, SEED_JOBS);

/* ---------- Card genérico (NUNCA mostra comissão) ---------- */
function cardHTML(item){
  const isJob = item.type === 'job';
  const tagClass = item.type==='hire'?'hire':item.type==='maint'?'maint':'job';
  const tagText  = item.type==='hire'?'FUNCIONÁRIO IA':item.type==='maint'?'MANUTENÇÃO':'PROCURA-SE';
  const price = isJob ? item.budget : item.price;
  const unit  = item.unit==='mês' ? '/mês' : ' · única';
  const author = isJob ? item.client : item.dev;
  const chips = (item.stack||[]).slice(0,4).map(s=>`<span class="chip">${esc(s)}</span>`).join('');
  const meta = isJob ? esc(item.posted||'') : '@'+esc(author);
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
      <div class="price">${money(price)}<small>${unit}</small></div>
      <div class="meta">${meta}</div>
    </div>
  </article>`;
}

/* ---------- Detalhe (cliente vê oferta de programador) ---------- */
function openListingDetail(id){
  const item = listings.find(x=>x.id===id); if(!item) return;
  const tasks = (item.tasks||[]).map(t=>`<li>${esc(t)}</li>`).join('');
  const stack = (item.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join('');
  openModal(`
    <span class="label">${item.type==='maint'?'SERVIÇO DE MANUTENÇÃO':'FUNCIONÁRIO IA'}</span>
    <h2>${esc(item.title)}</h2>
    <div class="role">${esc(item.role)} · @${esc(item.dev)}</div>
    <div class="detail-body">
      <div><h4>Resumo</h4><p>${esc(item.summary)}</p></div>
      <div><h4>Atribuições que a IA executa</h4><ul>${tasks}</ul></div>
      <div><h4>Stack / capacidades</h4><div class="chips">${stack}</div></div>
      <div class="detail-split">
        <div class="row"><span>Preço pedido</span><b>${money(item.price)} ${item.unit==='mês'?'/mês':'· única'}</b></div>
      </div>
      <div class="deal-actions">
        <button class="btn block lg" data-action="direct">Combinar diretamente com o dev</button>
        <button class="btn signal block lg" data-action="site">Fechar acordo pelo site</button>
      </div>
    </div>
  `);
  const m = $('#modal');
  $('[data-action="direct"]', m).addEventListener('click', ()=>{ closeModal(); toast('Contato liberado — combinem direto ✓'); });
  $('[data-action="site"]',   m).addEventListener('click', ()=> openDealClose(item.price, item.title));
}

/* ---------- Detalhe de vaga (programador vê o que o cliente procura) ---------- */
function openJobDetail(id){
  const item = jobs.find(x=>x.id===id); if(!item) return;
  const tasks = (item.tasks||[]).map(t=>`<li>${esc(t)}</li>`).join('');
  const stack = (item.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join('');
  openModal(`
    <span class="label">VAGA PUBLICADA POR CLIENTE</span>
    <h2>${esc(item.title)}</h2>
    <div class="role">${esc(item.role)} · @${esc(item.client)}</div>
    <div class="detail-body">
      <div><h4>Contexto</h4><p>${esc(item.summary)}</p></div>
      <div><h4>Atribuições do trabalho</h4><ul>${tasks}</ul></div>
      <div><h4>Requisitos</h4><div class="chips">${stack}</div></div>
      <div class="detail-split">
        <div class="row"><span>Orçamento</span><b>${money(item.budget)} ${item.unit==='mês'?'/mês':'· único'}</b></div>
      </div>
      <div class="deal-actions">
        <button class="btn block lg" data-action="direct">Combinar diretamente com o cliente</button>
        <button class="btn signal block lg" data-action="site">Propor e fechar pelo site</button>
      </div>
    </div>
  `);
  const m = $('#modal');
  $('[data-action="direct"]', m).addEventListener('click', ()=>{ closeModal(); toast('Contato liberado — combinem direto ✓'); });
  $('[data-action="site"]',   m).addEventListener('click', ()=> openDealClose(item.budget, item.title));
}

function wireCards(box, kind){
  $$('.card', box).forEach(c=>c.addEventListener('click', ()=>{
    if((c.dataset.kind||kind)==='job') openJobDetail(c.dataset.id);
    else openListingDetail(c.dataset.id);
  }));
}

/* =========================================================
   PÁGINA: INÍCIO (destaques)
   ========================================================= */
function initIndex(){
  const box = $('#featured'); if(!box) return;
  const feat = listings.slice(0,3);
  box.innerHTML = feat.map(cardHTML).join('');
  wireCards(box, 'listing');
}

/* =========================================================
   PÁGINA: OFERTAS (produtos e soluções)
   ========================================================= */
function initOfertas(){
  const box = $('#cards'); if(!box) return;
  let tab = 'hire';
  function data(){
    const q = ($('#search').value||'').toLowerCase().trim();
    let arr = listings.filter(l=>l.type===tab);
    if(q) arr = arr.filter(x=>((x.title+x.role+x.summary+(x.stack||[]).join(' ')).toLowerCase().includes(q)));
    return arr;
  }
  function render(){
    const d = data();
    box.innerHTML = d.length ? d.map(cardHTML).join('') : `<div class="empty">// NENHUMA OFERTA NESTE FILTRO //</div>`;
    $('#count').textContent = `// ${d.length} ${d.length===1?'OFERTA':'OFERTAS'}`;
    wireCards(box, 'listing');
  }
  $$('.tab').forEach(t=>t.addEventListener('click', ()=>{
    tab = t.dataset.tab; $$('.tab').forEach(x=>x.classList.toggle('active', x===t)); render();
  }));
  $('#search').addEventListener('input', render);
  render();
}

/* =========================================================
   PÁGINA: PROGRAMADOR
   ========================================================= */
function initProgramador(){
  // perfil
  const prof = load(STORE.devProfile, { handle:'', bio:'', skills:'', link:'' });
  const pf = $('#dev-profile');
  if(pf){
    pf.handle.value = prof.handle; pf.bio.value = prof.bio; pf.skills.value = prof.skills; pf.link.value = prof.link;
    pf.addEventListener('submit', e=>{
      e.preventDefault();
      const data = { handle:pf.handle.value.trim().replace(/^@/,''), bio:pf.bio.value.trim(), skills:pf.skills.value.trim(), link:pf.link.value.trim() };
      save(STORE.devProfile, data); toast('Perfil salvo ✓'); renderMine();
    });
  }

  // publicar oferta
  const of = $('#dev-offer');
  if(of){
    of.addEventListener('submit', e=>{
      e.preventDefault();
      const item = {
        id: uid('l'), type: of.type.value,
        title: of.title.value.trim(), role: of.role.value.trim(),
        dev: (load(STORE.devProfile,{}).handle || of.dev.value.trim() || 'eu').replace(/^@/,''),
        price: Number(of.price.value)||0,
        unit: of.type.value==='maint'?'mês':'única',
        summary: of.summary.value.trim(),
        tasks: of.tasks.value.split('\n').map(s=>s.trim()).filter(Boolean),
        stack: of.stack.value.split(',').map(s=>s.trim()).filter(Boolean)
      };
      listings.unshift(item); save(STORE.listings, listings);
      of.reset(); toast('Oferta publicada ✓'); renderMine();
    });
  }

  // minhas ofertas
  function renderMine(){
    const box = $('#dev-mine'); if(!box) return;
    const handle = (load(STORE.devProfile,{}).handle||'').toLowerCase();
    const mine = listings.filter(l=> handle && (l.dev||'').toLowerCase()===handle);
    box.innerHTML = mine.length ? mine.map(cardHTML).join('') : `<div class="empty">// SUAS OFERTAS APARECEM AQUI APÓS PUBLICAR //</div>`;
    wireCards(box,'listing');
  }
  renderMine();

  // vagas abertas de clientes
  const jb = $('#dev-jobs');
  if(jb){ jb.innerHTML = jobs.map(cardHTML).join(''); wireCards(jb,'job'); }
}

/* =========================================================
   PÁGINA: CLIENTE
   ========================================================= */
function initCliente(){
  const prof = load(STORE.clientProfile, { company:'', sector:'', need:'' });
  const pf = $('#client-profile');
  if(pf){
    pf.company.value = prof.company; pf.sector.value = prof.sector; pf.need.value = prof.need;
    pf.addEventListener('submit', e=>{
      e.preventDefault();
      save(STORE.clientProfile, { company:pf.company.value.trim(), sector:pf.sector.value.trim(), need:pf.need.value.trim() });
      toast('Perfil salvo ✓');
    });
  }

  const jf = $('#client-job');
  if(jf){
    jf.addEventListener('submit', e=>{
      e.preventDefault();
      const item = {
        id: uid('j'), type:'job',
        title: jf.title.value.trim(), role: jf.role.value.trim(),
        client: (load(STORE.clientProfile,{}).company || jf.client.value.trim() || 'minha empresa'),
        budget: Number(jf.budget.value)||0,
        unit: jf.unit.value,
        summary: jf.summary.value.trim(),
        tasks: jf.tasks.value.split('\n').map(s=>s.trim()).filter(Boolean),
        stack: jf.stack.value.split(',').map(s=>s.trim()).filter(Boolean),
        posted: 'agora'
      };
      jobs.unshift(item); save(STORE.jobs, jobs);
      jf.reset(); toast('Publicado ✓'); renderMine();
    });
  }

  function renderMine(){
    const box = $('#client-mine'); if(!box) return;
    const company = (load(STORE.clientProfile,{}).company||'').toLowerCase();
    const mine = jobs.filter(j=> company && (j.client||'').toLowerCase()===company);
    box.innerHTML = mine.length ? mine.map(cardHTML).join('') : `<div class="empty">// SUAS PUBLICAÇÕES APARECEM AQUI //</div>`;
    wireCards(box,'job');
  }
  renderMine();
}

/* ---------- Router ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;
  if(page==='index')       initIndex();
  if(page==='ofertas')     initOfertas();
  if(page==='programador') initProgramador();
  if(page==='cliente')     initCliente();
});
