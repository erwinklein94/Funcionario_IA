/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Camada de API (Supabase)
   Todas as funções retornam dados ou lançam erro (try/catch no chamador).
   ========================================================= */

const API = {
  /* ---------- AUTENTICAÇÃO ---------- */
  async user(){
    if(!sb) return null;
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  },
  async signUp(email, password, displayName){
    const { data, error } = await sb.auth.signUp({
      email, password, options:{ data:{ display_name: displayName||'' } }
    });
    if(error) throw error;
    return data;
  },
  async signIn(email, password){
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if(error) throw error;
    return data;
  },
  async signOut(){ if(sb) await sb.auth.signOut(); },

  /* ---------- ASSINATURA / ACESSO ---------- */
  async hasAccess(role){
    if(!sb) return false;
    const { data, error } = await sb.rpc('has_active_sub', { check_role: role });
    if(error) return false;
    return data === true;
  },
  async mySubscriptions(){
    const { data } = await sb.from('subscriptions').select('*');
    return data || [];
  },
  async subUntil(role){
    const subs = await this.mySubscriptions();
    const s = subs.find(x => x.role === role && x.status === 'active' && new Date(x.valid_until) > new Date());
    return s ? new Date(s.valid_until).toLocaleDateString('pt-BR') : null;
  },
  /* cria pagamento PIX pendente (a confirmação é feita no servidor) */
  async registerPayment(role, amount){
    const u = await this.user(); if(!u) throw new Error('Faça login primeiro.');
    const { data, error } = await sb.from('payments')
      .insert({ user_id: u.id, role, amount, status:'pending' }).select().single();
    if(error) throw error;
    return data;
  },

  /* ---------- PERFIL ---------- */
  async myProfile(){
    const u = await this.user(); if(!u) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle();
    return data;
  },
  async saveProfile(fields){
    const u = await this.user(); if(!u) throw new Error('Faça login primeiro.');
    const { error } = await sb.from('profiles').update(fields).eq('id', u.id);
    if(error) throw error;
  },

  /* ---------- OFERTAS (listings) ---------- */
  async listings(type){
    let q = sb.from('listings').select('*').order('created_at',{ascending:false});
    if(type) q = q.eq('type', type);
    const { data, error } = await q;
    if(error) throw error;
    return data || [];
  },
  async myListings(){
    const u = await this.user(); if(!u) return [];
    const { data } = await sb.from('listings').select('*').eq('owner_id', u.id).order('created_at',{ascending:false});
    return data || [];
  },
  async createListing(o){
    const u = await this.user(); if(!u) throw new Error('Faça login primeiro.');
    const prof = await this.myProfile();
    const { error } = await sb.from('listings').insert({
      owner_id: u.id, owner_handle: (prof?.handle || prof?.display_name || 'eu'),
      type:o.type, title:o.title, role:o.role, summary:o.summary,
      tasks:o.tasks, stack:o.stack, price:o.price, unit:o.unit
    });
    if(error) throw error;
  },

  /* teaser público (home) — não exige assinatura */
  async publicListings(limit=3){
    const { data } = await sb.from('listings_public').select('*').limit(limit);
    return data || [];
  },

  /* ---------- VAGAS (jobs) ---------- */
  async jobs(){
    const { data, error } = await sb.from('jobs').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    return data || [];
  },
  async myJobs(){
    const u = await this.user(); if(!u) return [];
    const { data } = await sb.from('jobs').select('*').eq('owner_id', u.id).order('created_at',{ascending:false});
    return data || [];
  },
  async createJob(o){
    const u = await this.user(); if(!u) throw new Error('Faça login primeiro.');
    const prof = await this.myProfile();
    const { error } = await sb.from('jobs').insert({
      owner_id: u.id, owner_company: (o.company || prof?.company || 'minha empresa'),
      title:o.title, role:o.role, summary:o.summary,
      tasks:o.tasks, stack:o.stack, budget:o.budget, unit:o.unit
    });
    if(error) throw error;
  }
};
