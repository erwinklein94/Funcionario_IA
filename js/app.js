/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Lógica por página (Supabase)
   Define window.pageInit; o boot() em layout.js chama no fim.
   ========================================================= */

const splitLines = v => (v||'').split('\n').map(s=>s.trim()).filter(Boolean);
const splitCommas = v => (v||'').split(',').map(s=>s.trim()).filter(Boolean);

/* ---------- Card (NUNCA mostra comissão) ---------- */
function cardHTML(item, kind){
  const isJob = kind==='job';
  const tagClass = item.type==='hire'?'hire':item.type==='maint'?'maint':'job';
  const tagText  = isJob?'PROCURA-SE':item.type==='maint'?'MANUTENÇÃO':'FUNCIONÁRIO IA';
  const price = isJob ? item.budget : item.price;
  const unit  = item.unit==='mês' ? '/mês' : ' · única';
  const author = isJob ? (item.owner_company||'cliente') : (item.owner_handle||'dev');
  const chips = (item.stack||[]).slice(0,4).map(s=>`<span class="chip">${esc(s)}</span>`).join('');
  return `
  <article class="card" data-id="${item.id}" data-kind="${kind}">
    <div class="card-top"><span class="tag ${tagClass}">${tagText}</span><span class="idx">${(item.id||'').slice(0,8).toUpperCase()}</span></div>
    <div><h3>${esc(item.title)}</h3><div class="role">${esc(item.role)} · @${esc(author)}</div></div>
    <p>${esc(item.summary)}</p>
    <div class="chips">${chips}</div>
    <div class="card-foot"><div class="price">${money(price)}<small>${unit}</small></div><div class="meta">@${esc(author)}</div></div>
  </article>`;
}
function teaserCardHTML(item){
  const tagText = item.type==='maint'?'MANUTENÇÃO':'FUNCIONÁRIO IA';
  return `
  <article class="card teaser" data-go="ofertas.html">
    <div class="card-top"><span class="tag ${item.type==='maint'?'maint':'hire'}">${tagText}</span></div>
    <div><h3>${esc(item.title)}</h3><div class="role">${esc(item.role)}</div></div>
    <p>${esc(item.summary)}</p>
    <div class="card-foot"><div class="price">${money(item.price)}<small>${item.unit==='mês'?'/mês':' · única'}</small></div><div class="meta">assine para ver</div></div>
  </article>`;
}

/* ---------- Detalhes ---------- */
function detailTasks(item){ return (item.tasks||[]).map(t=>`<li>${esc(t)}</li>`).join(''); }
function detailStack(item){ return (item.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join(''); }

function openListingDetail(item){
  openModal(`
    <span class="label">${item.type==='maint'?'SERVIÇO DE MANUTENÇÃO':'FUNCIONÁRIO IA'}</span>
    <h2>${esc(item.title)}</h2><div class="role">${esc(item.role)} · @${esc(item.owner_handle||'dev')}</div>
    <div class="detail-body">
      <div><h4>Resumo</h4><p>${esc(item.summary)}</p></div>
      <div><h4>Atribuições que a IA executa</h4><ul>${detailTasks(item)}</ul></div>
      <div><h4>Stack / capacidades</h4><div class="chips">${detailStack(item)}</div></div>
      <div class="detail-split"><div class="row"><span>Preço pedido</span><b>${money(item.price)} ${item.unit==='mês'?'/mês':'· única'}</b></div></div>
      <div class="deal-actions">
        <button class="btn block lg" data-action="direct">Combinar diretamente com o dev</button>
        <button class="btn signal block lg" data-action="site">Fechar acordo pelo site</button>
      </div>
    </div>`);
  const m=$('#modal');
  $('[data-action="direct"]',m).addEventListener('click',()=>{ closeModal(); toast('Contato liberado — combinem direto ✓'); });
  $('[data-action="site"]',m).addEventListener('click',()=>openDealClose(item.price, item.title));
}
function openJobDetail(item){
  openModal(`
    <span class="label">VAGA PUBLICADA POR CLIENTE</span>
    <h2>${esc(item.title)}</h2><div class="role">${esc(item.role)} · @${esc(item.owner_company||'cliente')}</div>
    <div class="detail-body">
      <div><h4>Contexto</h4><p>${esc(item.summary)}</p></div>
      <div><h4>Atribuições do trabalho</h4><ul>${detailTasks(item)}</ul></div>
      <div><h4>Requisitos</h4><div class="chips">${detailStack(item)}</div></div>
      <div class="detail-split"><div class="row"><span>Orçamento</span><b>${money(item.budget)} ${item.unit==='mês'?'/mês':'· único'}</b></div></div>
      <div class="deal-actions">
        <button class="btn block lg" data-action="direct">Combinar diretamente com o cliente</button>
        <button class="btn signal block lg" data-action="site">Propor e fechar pelo site</button>
      </div>
    </div>`);
  const m=$('#modal');
  $('[data-action="direct"]',m).addEventListener('click',()=>{ closeModal(); toast('Contato liberado — combinem direto ✓'); });
  $('[data-action="site"]',m).addEventListener('click',()=>openDealClose(item.budget, item.title));
}
function wireCards(box, items, kind){
  $$('.card', box).forEach(c=>{
    if(c.dataset.go){ c.addEventListener('click',()=>location.href=c.dataset.go); return; }
    const item = items.find(x=>x.id===c.dataset.id); if(!item) return;
    c.addEventListener('click',()=> kind==='job'?openJobDetail(item):openListingDetail(item));
  });
}

/* ======================= PÁGINAS ======================= */
async function initIndex(){
  const box=$('#featured'); if(!box) return;
  try{ const feat=await API.publicListings(3);
    box.innerHTML = feat.length ? feat.map(teaserCardHTML).join('') : `<div class="empty">// EM BREVE: OFERTAS DOS PRIMEIROS PROGRAMADORES //</div>`;
    wireCards(box, [], 'listing');
  }catch(e){ box.innerHTML=`<div class="empty">// ASSINE PARA VER AS OFERTAS //</div>`; }
}

async function initOfertas(){
  const box=$('#cards'); if(!box) return;
  let tab='hire', cache=[];
  async function render(){
    const q=($('#search').value||'').toLowerCase().trim();
    try{ cache=await API.listings(tab); }catch(e){ cache=[]; }
    let d=cache;
    if(q) d=d.filter(x=>((x.title+x.role+x.summary+(x.stack||[]).join(' ')).toLowerCase().includes(q)));
    box.innerHTML = d.length ? d.map(x=>cardHTML(x,'listing')).join('') : `<div class="empty">// NENHUMA OFERTA NESTE FILTRO //</div>`;
    $('#count').textContent=`// ${d.length} ${d.length===1?'OFERTA':'OFERTAS'}`;
    wireCards(box, d, 'listing');
  }
  $$('.tab').forEach(t=>t.addEventListener('click',()=>{ tab=t.dataset.tab; $$('.tab').forEach(x=>x.classList.toggle('active',x===t)); render(); }));
  $('#search').addEventListener('input', render);
  await render();
}

async function initProgramador(){
  const pf=$('#dev-profile');
  if(pf){ const prof=await API.myProfile()||{};
    pf.handle.value=prof.handle||''; pf.bio.value=prof.bio||''; pf.skills.value=prof.skills||''; pf.link.value=prof.link||'';
    pf.addEventListener('submit',async e=>{ e.preventDefault();
      try{ await API.saveProfile({ handle:pf.handle.value.trim().replace(/^@/,''), bio:pf.bio.value.trim(), skills:pf.skills.value.trim(), link:pf.link.value.trim() });
        toast('Perfil salvo ✓'); }catch(err){ toast('Erro: '+(err.message||err)); } });
  }
  const of=$('#dev-offer');
  if(of){ of.addEventListener('submit',async e=>{ e.preventDefault();
    try{ await API.createListing({ type:of.type.value, title:of.title.value.trim(), role:of.role.value.trim(),
        summary:of.summary.value.trim(), tasks:splitLines(of.tasks.value), stack:splitCommas(of.stack.value),
        price:Number(of.price.value)||0, unit:of.type.value==='maint'?'mês':'única' });
      of.reset(); toast('Oferta publicada ✓'); renderMine();
    }catch(err){ toast('Erro: '+(err.message||err)); } }); }
  async function renderMine(){ const box=$('#dev-mine'); if(!box)return;
    const mine=await API.myListings();
    box.innerHTML = mine.length ? mine.map(x=>cardHTML(x,'listing')).join('') : `<div class="empty">// SUAS OFERTAS APARECEM AQUI //</div>`;
    wireCards(box, mine, 'listing'); }
  await renderMine();
  const jb=$('#dev-jobs'); if(jb){ try{ const j=await API.jobs();
    jb.innerHTML = j.length ? j.map(x=>cardHTML(x,'job')).join('') : `<div class="empty">// NENHUMA VAGA ABERTA //</div>`;
    wireCards(jb, j, 'job'); }catch(e){ jb.innerHTML=`<div class="empty">// —</div>`; } }
}

async function initCliente(){
  const pf=$('#client-profile');
  if(pf){ const prof=await API.myProfile()||{};
    pf.company.value=prof.company||''; pf.sector.value=prof.sector||''; pf.need.value=prof.bio||'';
    pf.addEventListener('submit',async e=>{ e.preventDefault();
      try{ await API.saveProfile({ company:pf.company.value.trim(), sector:pf.sector.value.trim(), bio:pf.need.value.trim() });
        toast('Perfil salvo ✓'); }catch(err){ toast('Erro: '+(err.message||err)); } });
  }
  const jf=$('#client-job');
  if(jf){ jf.addEventListener('submit',async e=>{ e.preventDefault();
    try{ await API.createJob({ title:jf.title.value.trim(), role:jf.role.value.trim(), summary:jf.summary.value.trim(),
        tasks:splitLines(jf.tasks.value), stack:splitCommas(jf.stack.value),
        budget:Number(jf.budget.value)||0, unit:jf.unit.value });
      jf.reset(); toast('Publicado ✓'); renderMine();
    }catch(err){ toast('Erro: '+(err.message||err)); } }); }
  async function renderMine(){ const box=$('#client-mine'); if(!box)return;
    const mine=await API.myJobs();
    box.innerHTML = mine.length ? mine.map(x=>cardHTML(x,'job')).join('') : `<div class="empty">// SUAS PUBLICAÇÕES APARECEM AQUI //</div>`;
    wireCards(box, mine, 'job'); }
  await renderMine();
}

/* ---------- entry point chamado pelo boot() ---------- */
async function pageInit(){
  const page=document.body.dataset.page;
  if(page==='index')       return initIndex();
  if(page==='ofertas')     return initOfertas();
  if(page==='programador') return initProgramador();
  if(page==='cliente')     return initCliente();
}
