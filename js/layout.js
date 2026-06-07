/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Layout, auth, PIX e paywall (Supabase)
   ========================================================= */

const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => CONFIG.currency + ' ' + Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleLabel = r => r==='cliente'?'Cliente':'Programador';

/* ---------- PIX BR Code ---------- */
function _emv(id,val){ return id + String(val.length).padStart(2,'0') + val; }
function _crc16(str){ let crc=0xFFFF;
  for(let i=0;i<str.length;i++){ crc^=str.charCodeAt(i)<<8;
    for(let j=0;j<8;j++){ crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1); crc&=0xFFFF; } }
  return crc.toString(16).toUpperCase().padStart(4,'0'); }
function pixPayload(amount){ const p=CONFIG.pix;
  const mai=_emv('00','br.gov.bcb.pix')+_emv('01',p.key);
  let s=_emv('00','01')+_emv('26',mai)+_emv('52','0000')+_emv('53','986')+
        (amount?_emv('54',Number(amount).toFixed(2)):'')+_emv('58','BR')+
        _emv('59',p.name.slice(0,25))+_emv('60',p.city.slice(0,15))+_emv('62',_emv('05','***'))+'6304';
  return s+_crc16(s); }
function copy(text){ try{ navigator.clipboard.writeText(text); }
  catch(e){ const t=document.createElement('textarea'); t.value=text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); } }

/* ---------- NAV / FOOTER ---------- */
const NAV=[
  {href:'index.html',label:'Início'},
  {href:'ofertas.html',label:'Ofertas'},
  {href:'programador.html',label:'Sou Programador'},
  {href:'cliente.html',label:'Sou Cliente'}
];
async function navCtaHTML(){
  const u = await API.user();
  if(!u) return `<button class="btn primary" id="nav-login">Entrar</button>`;
  let pills='';
  for(const r of ['cliente','programador']){ const until=await API.subUntil(r); if(until) pills+=`<span class="member-pill">${roleLabel(r)} · ${until}</span>`; }
  const email = (u.email||'').split('@')[0];
  return `${pills}<span class="nav-user">${esc(email)}</span><button class="btn" id="nav-logout">Sair</button>`;
}
async function renderChrome(){
  const page=document.body.dataset.page||'';
  const links=NAV.map(n=>`<a href="${n.href}" class="${n.href.startsWith(page)&&page?'active':''}">${n.label}</a>`).join('');
  const header=document.createElement('header'); header.className='nav';
  header.innerHTML=`
    <div class="wrap nav-inner">
      <a href="index.html" class="brand"><span class="dot"></span>FUNCIONÁRIO&nbsp;ARTIFICIAL</a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-cta">${await navCtaHTML()}</div>
    </div>`;
  document.body.prepend(header);
  wireNavCta();

  const footer=document.createElement('footer');
  footer.innerHTML=`
    <div class="wrap foot-grid">
      <div><div class="foot-brand">FUNCIONÁRIO ARTIFICIAL</div>
        <p class="foot-meta" style="margin-top:10px">// O MERCADO DE FUNCIONÁRIOS DE IA</p></div>
      <p class="foot-mission">Conectamos quem precisa automatizar uma função a quem sabe construir o agente que faz o trabalho.</p>
      <nav class="foot-links">${NAV.map(n=>`<a href="${n.href}">${n.label}</a>`).join('')}<span class="foot-meta">© 2026 · v1.0</span></nav>
    </div>`;
  document.body.append(footer);

  ['tl','tr','bl','br'].forEach(p=>{ const i=document.createElement('i'); i.className='crosshair '+p; document.body.append(i); });
  const ov=document.createElement('div'); ov.className='overlay'; ov.id='overlay';
  ov.innerHTML=`<div class="modal" id="modal"></div>`; document.body.append(ov);
  const t=document.createElement('div'); t.className='toast'; t.id='toast'; document.body.append(t);
  ov.addEventListener('click',e=>{ if(e.target===ov||e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
}
function wireNavCta(){
  const login=$('#nav-login'); if(login) login.addEventListener('click',()=>openAuth());
  const logout=$('#nav-logout'); if(logout) logout.addEventListener('click',async()=>{ await API.signOut(); location.reload(); });
}

function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(t._tm); t._tm=setTimeout(()=>t.classList.remove('show'),2800); }
function openModal(html){ const m=$('#modal'); m.innerHTML=`<button class="x" data-close>×</button>`+html; $('#overlay').classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(){ const ov=$('#overlay'); if(!ov)return; ov.classList.remove('open'); document.body.style.overflow=''; }
function initReveal(){ const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}})},{threshold:.1}); $$('.reveal').forEach(el=>io.observe(el)); }

/* ---------- AUTH (login / cadastro) ---------- */
function authFormHTML(){
  return `
    <div class="auth-tabs"><button class="atab active" data-atab="in">Entrar</button><button class="atab" data-atab="up">Criar conta</button></div>
    <form id="auth-form">
      <div class="field auth-name" style="display:none"><label>Nome</label><input name="display_name" placeholder="Seu nome ou empresa"></div>
      <div class="field"><label>E-mail</label><input name="email" type="email" placeholder="voce@email.com" required></div>
      <div class="field"><label>Senha</label><input name="password" type="password" placeholder="mínimo 6 caracteres" required></div>
      <button class="btn primary block lg" type="submit" id="auth-submit">Entrar</button>
      <p class="help" id="auth-msg" style="margin-top:12px"></p>
    </form>`;
}
function wireAuthForm(scope, onDone){
  let mode='in';
  scope.querySelectorAll('.atab').forEach(b=>b.addEventListener('click',()=>{
    mode=b.dataset.atab; scope.querySelectorAll('.atab').forEach(x=>x.classList.toggle('active',x===b));
    scope.querySelector('.auth-name').style.display = mode==='up'?'block':'none';
    $('#auth-submit',scope).textContent = mode==='up'?'Criar conta':'Entrar';
  }));
  $('#auth-form',scope).addEventListener('submit',async e=>{
    e.preventDefault(); const f=e.target; const msg=$('#auth-msg',scope);
    msg.textContent='Processando...';
    try{
      if(mode==='up'){ await API.signUp(f.email.value, f.password.value, f.display_name.value);
        msg.textContent='Conta criada! Se a confirmação por e-mail estiver ativa, confirme e depois faça login.';
        try{ await API.signIn(f.email.value, f.password.value); }catch(_){}
      } else { await API.signIn(f.email.value, f.password.value); }
      const u=await API.user();
      if(u){ onDone ? onDone() : location.reload(); }
      else { msg.textContent='Verifique seu e-mail para confirmar a conta.'; }
    }catch(err){ msg.textContent = 'Erro: ' + (err.message||err); }
  });
}
function openAuth(onDone){ openModal(`<span class="label">ACESSO</span><h2>Bem-vindo</h2><div class="auth-wrap"></div>`);
  const wrap=$('#modal .auth-wrap'); wrap.innerHTML=authFormHTML(); wireAuthForm(wrap, onDone); }

/* ---------- PAYWALL / GATE ---------- */
const ROLE_PERKS={
  cliente:['Ver todas as ofertas de funcionários de IA','Publicar a função que quer automatizar','Receber propostas de desenvolvedores'],
  programador:['Expor seus serviços e funcionários de IA','Ver tudo que os clientes procuram','Enviar propostas para as vagas abertas']
};
function gateShell(inner){ const el=document.createElement('div'); el.className='paywall'; el.id='paywall';
  el.innerHTML=`<div class="paywall-card">${inner}</div>`; document.body.append(el); return el; }

function renderAuthGate(role){
  const el=gateShell(`
    <span class="label">ACESSO DE ${roleLabel(role).toUpperCase()}</span>
    <h2>Entre para continuar</h2>
    <p class="modal-lead">Crie sua conta ou faça login para acessar esta área.</p>
    <div class="auth-wrap"></div>
    <p class="help" style="margin-top:14px"><a href="index.html" style="color:var(--ink-dim);text-decoration:underline">← voltar ao início</a></p>`);
  const wrap=$('.auth-wrap',el); wrap.innerHTML=authFormHTML(); wireAuthForm(wrap, ()=>location.reload());
}

function renderPaywall(role){
  const price=CONFIG.access.monthly; const payload=pixPayload(price);
  const perks=ROLE_PERKS[role].map(p=>`<li>${esc(p)}</li>`).join('');
  const el=gateShell(`
    <span class="label">ACESSO DE ${roleLabel(role).toUpperCase()}</span>
    <h2>Assine para liberar</h2>
    <div class="plan" style="margin:18px 0 6px"><span class="plan-what">Assinatura mensal</span><span class="price-tag">R$ 19,90<small> / mês</small></span></div>
    <ul class="gate-list paywall-perks">${perks}</ul>
    <div class="pix-box">
      <span class="label">PAGUE VIA PIX</span>
      <div class="pix-row"><span>Chave (${CONFIG.pix.keyType})</span><b>${esc(CONFIG.pix.key)}</b><button class="btn pix-copy" data-copy-key>copiar</button></div>
      <div class="pix-row"><span>Valor</span><b>${money(price)}</b></div>
      <div class="pix-row"><span>Favorecido</span><b>${esc(CONFIG.pix.name)}</b></div>
      <div class="pix-cc"><span class="label">PIX COPIA E COLA</span><textarea readonly>${esc(payload)}</textarea><button class="btn signal block" data-copy-cc>copiar código copia e cola</button></div>
    </div>
    <button class="btn primary block lg" id="paid-btn">Já fiz o PIX</button>
    <p class="help" id="pay-msg" style="margin-top:14px">Após pagar, registre aqui. A liberação acontece quando o pagamento é confirmado. <a href="index.html" style="color:var(--ink-dim);text-decoration:underline">← início</a></p>`);
  $('[data-copy-key]',el).addEventListener('click',e=>{ copy(CONFIG.pix.key); e.target.textContent='copiado ✓'; setTimeout(()=>e.target.textContent='copiar',1500); });
  $('[data-copy-cc]',el).addEventListener('click',()=>{ copy(payload); toast('Código PIX copiado ✓'); });
  $('#paid-btn',el).addEventListener('click',async()=>{
    const msg=$('#pay-msg',el);
    try{
      await API.registerPayment(role, price);
      $('#paid-btn',el).outerHTML = `<button class="btn block lg" onclick="location.reload()">Verificar acesso / recarregar</button>`;
      msg.innerHTML='Pagamento registrado ✓ Assim que for confirmado, recarregue esta página para liberar o acesso.';
    }catch(err){ msg.textContent='Erro ao registrar: '+(err.message||err); }
  });
}

async function initGate(){
  const role=document.body.dataset.gate;
  if(!role) return true;
  const u=await API.user();
  if(!u){ document.body.classList.add('gated'); renderAuthGate(role); return false; }
  const ok=await API.hasAccess(role);
  if(!ok){ document.body.classList.add('gated'); renderPaywall(role); return false; }
  return true;
}

/* ---------- Fechamento de acordo (revela comissão) ---------- */
function openDealClose(value,label){
  const c=commissionFor(value);
  openModal(`
    <span class="label">FECHAR ACORDO PELO SITE</span>
    <h2>Acordo protegido</h2>
    <p class="modal-lead">${esc(label||'')}</p>
    <p class="modal-lead">Fechando pelo site você tem registro do acordo, intermediação e garantia de entrega. Confira:</p>
    <div class="deal-reveal">
      <div class="row"><span>Valor do acordo</span><b>${money(c.value)}</b></div>
      <div class="row fee"><span>Taxa de intermediação</span><b>${money(c.fee)} <small>(${(c.rate*100).toFixed(0)}%)</small></b></div>
      <div class="row total"><span>Programador recebe</span><b>${money(c.net)}</b></div>
    </div>
    <button class="btn signal block lg" data-action="confirm">Confirmar e fechar pelo site</button>
    <p class="help" style="margin-top:14px">A taxa só existe se o acordo for fechado aqui dentro. Combinar diretamente não gera cobrança.</p>`);
  $('[data-action="confirm"]',$('#modal')).addEventListener('click',()=>{ closeModal(); toast('Acordo registrado pelo site ✓'); });
}

/* ---------- BOOT ---------- */
function setupBanner(){
  const b=document.createElement('div'); b.className='setup-banner';
  b.innerHTML=`⚠ Configure o Supabase em <code>js/supabase.js</code> (Project URL + anon key) para o site funcionar.`;
  document.body.prepend(b);
}
async function boot(){
  if(!sb){ await renderChromeOffline(); setupBanner(); return; }
  await renderChrome(); initReveal();
  await initGate();
  if(typeof pageInit==='function'){ try{ await pageInit(); }catch(e){ console.error(e); } }
}
async function renderChromeOffline(){
  const header=document.createElement('header'); header.className='nav';
  header.innerHTML=`<div class="wrap nav-inner"><a href="index.html" class="brand"><span class="dot"></span>FUNCIONÁRIO&nbsp;ARTIFICIAL</a></div>`;
  document.body.prepend(header);
}
document.addEventListener('DOMContentLoaded', boot);
