-- =====================================================================
-- FUNCIONÁRIO ARTIFICIAL — Schema Supabase
-- Cole TUDO isto no Supabase → SQL Editor → Run.
-- Segurança de acesso fica NO SERVIDOR (RLS), não no navegador.
-- =====================================================================

-- ---------- TABELAS ----------

-- Perfil (1:1 com auth.users). Criado automaticamente no cadastro.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle       text,
  bio          text,
  skills       text,
  link         text,
  company      text,
  sector       text,
  created_at   timestamptz not null default now()
);

-- Assinaturas por papel (cliente / programador).
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('cliente','programador')),
  status      text not null default 'inactive' check (status in ('active','inactive')),
  valid_until timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

-- Pagamentos PIX (fila). Usuário cria 'pending'; só service_role confirma.
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('cliente','programador')),
  amount       numeric(10,2) not null,
  status       text not null default 'pending' check (status in ('pending','confirmed','canceled')),
  pix_txid     text,
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);

-- Ofertas (publicadas por programadores).
create table if not exists public.listings (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  owner_handle text,
  type         text not null check (type in ('hire','maint')),
  title        text not null,
  role         text not null,
  summary      text,
  tasks        text[] default '{}',
  stack        text[] default '{}',
  price        numeric(10,2) not null default 0,
  unit         text not null default 'única',
  created_at   timestamptz not null default now()
);

-- Vagas (publicadas por clientes).
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  owner_company text,
  title         text not null,
  role          text not null,
  summary       text,
  tasks         text[] default '{}',
  stack         text[] default '{}',
  budget        numeric(10,2) not null default 0,
  unit          text not null default 'única',
  created_at    timestamptz not null default now()
);

create index if not exists idx_listings_type on public.listings(type, created_at desc);
create index if not exists idx_jobs_created  on public.jobs(created_at desc);

-- ---------- FUNÇÃO AUXILIAR: assinatura ativa? ----------
create or replace function public.has_active_sub(check_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid()
      and s.role = check_role
      and s.status = 'active'
      and s.valid_until > now()
  );
$$;

-- ---------- CRIA PERFIL NO CADASTRO ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- CONFIRMA PAGAMENTO (só service_role / webhook / admin) ----------
create or replace function public.confirm_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  update public.payments
     set status = 'confirmed', confirmed_at = now()
   where id = p_payment_id and status = 'pending'
   returning * into r;

  if r.id is null then
    return;  -- não existe ou já confirmado
  end if;

  insert into public.subscriptions (user_id, role, status, valid_until)
  values (r.user_id, r.role, 'active', now() + interval '30 days')
  on conflict (user_id, role) do update
    set status = 'active',
        valid_until = greatest(coalesce(subscriptions.valid_until, now()), now()) + interval '30 days';
end;
$$;

-- Ninguém comum pode confirmar pagamento. Só a service_role (webhook) ou o admin no SQL.
revoke all on function public.confirm_payment(uuid) from anon, authenticated;

-- ---------- VIEW PÚBLICA (vitrine/teaser do site, sem dados sensíveis) ----------
-- Mostra só título/função/preço resumido na home. NÃO expõe tarefas, stack nem contato.
create or replace view public.listings_public as
  select id, type, title, role, price, unit, left(coalesce(summary,''),120) as summary
  from public.listings
  order by created_at desc
  limit 60;

grant select on public.listings_public to anon, authenticated;

-- =====================================================================
-- RLS (Row Level Security) — o coração da segurança
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;
alter table public.listings      enable row level security;
alter table public.jobs          enable row level security;

-- PROFILES: leitura pública; cada um edita o seu.
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- SUBSCRIPTIONS: usuário vê só as suas. Ativação é feita por confirm_payment (service_role).
drop policy if exists subs_read on public.subscriptions;
create policy subs_read on public.subscriptions for select using (user_id = auth.uid());

-- PAYMENTS: usuário cria pagamento 'pending' e vê os seus. Confirmação só por service_role.
drop policy if exists pay_read   on public.payments;
drop policy if exists pay_insert on public.payments;
create policy pay_read   on public.payments for select using (user_id = auth.uid());
create policy pay_insert on public.payments for insert
  with check (user_id = auth.uid() and status = 'pending');

-- LISTINGS:
--  ver  -> dono OU quem tem assinatura de CLIENTE ativa
--  criar-> dono COM assinatura de PROGRAMADOR ativa
drop policy if exists listings_read   on public.listings;
drop policy if exists listings_insert on public.listings;
drop policy if exists listings_update on public.listings;
drop policy if exists listings_delete on public.listings;
create policy listings_read   on public.listings for select
  using (owner_id = auth.uid() or public.has_active_sub('cliente'));
create policy listings_insert on public.listings for insert
  with check (owner_id = auth.uid() and public.has_active_sub('programador'));
create policy listings_update on public.listings for update using (owner_id = auth.uid());
create policy listings_delete on public.listings for delete using (owner_id = auth.uid());

-- JOBS:
--  ver  -> dono OU quem tem assinatura de PROGRAMADOR ativa
--  criar-> dono COM assinatura de CLIENTE ativa
drop policy if exists jobs_read   on public.jobs;
drop policy if exists jobs_insert on public.jobs;
drop policy if exists jobs_update on public.jobs;
drop policy if exists jobs_delete on public.jobs;
create policy jobs_read   on public.jobs for select
  using (owner_id = auth.uid() or public.has_active_sub('programador'));
create policy jobs_insert on public.jobs for insert
  with check (owner_id = auth.uid() and public.has_active_sub('cliente'));
create policy jobs_update on public.jobs for update using (owner_id = auth.uid());
create policy jobs_delete on public.jobs for delete using (owner_id = auth.uid());

-- =====================================================================
-- FIM. Próximo: cole o seed.sql (opcional) e configure js/supabase.js.
-- =====================================================================
