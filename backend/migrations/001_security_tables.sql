-- ═══════════════════════════════════════════════════════════════
-- Reset 7D — Tabelas de Segurança
-- Execute no editor SQL do Supabase (Settings → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Tabela de Cupons ──────────────────────────────────────
create table if not exists public.coupons (
  id             uuid        primary key default gen_random_uuid(),
  code           text        not null unique,          -- Ex: "RESET20", "LANCAMENTO50"
  discount_pct   int         default 0,               -- % de desconto (0–100)
  discount_fixed numeric     default 0,               -- R$ fixo de desconto
  product_id     text        default null,             -- null = válido em qualquer produto
  max_uses       int         default null,             -- null = usos ilimitados
  uses_count     int         not null default 0,
  expires_at     timestamptz default null,             -- null = sem expiração
  active         boolean     not null default true,
  created_at     timestamptz not null default now()
);

-- Índices para busca rápida
create index if not exists coupons_code_idx    on public.coupons (code);
create index if not exists coupons_active_idx  on public.coupons (active);

-- RLS: apenas service_role pode ler/escrever
alter table public.coupons enable row level security;
create policy "service_role_only" on public.coupons
  using (auth.role() = 'service_role');

-- ── 2. Tabela de Usos de Cupom ───────────────────────────────
create table if not exists public.coupon_uses (
  id          uuid        primary key default gen_random_uuid(),
  coupon_id   uuid        not null references public.coupons(id) on delete cascade,
  user_email  text        not null,
  purchase_id uuid        default null,   -- referência à compra onde foi usado
  used_at     timestamptz not null default now()
);

create index if not exists coupon_uses_coupon_idx on public.coupon_uses (coupon_id);
create index if not exists coupon_uses_email_idx  on public.coupon_uses (user_email);
create unique index if not exists coupon_uses_unique on public.coupon_uses (coupon_id, user_email);

alter table public.coupon_uses enable row level security;
create policy "service_role_only" on public.coupon_uses
  using (auth.role() = 'service_role');

-- ── 3. Tabela de Compras / Acesso Premium ────────────────────
create table if not exists public.purchases (
  id           uuid        primary key default gen_random_uuid(),
  user_email   text        not null,
  product_id   text        not null,                  -- ID do produto na plataforma
  status       text        not null default 'pending', -- 'pending' | 'confirmed' | 'refunded'
  coupon_id    uuid        default null references public.coupons(id),
  raw_event    text        default null,               -- payload bruto do webhook
  confirmed_at timestamptz default null,
  created_at   timestamptz not null default now(),
  constraint purchases_status_check check (status in ('pending','confirmed','refunded'))
);

create index if not exists purchases_email_idx   on public.purchases (user_email);
create index if not exists purchases_product_idx on public.purchases (product_id);
create unique index if not exists purchases_unique on public.purchases (user_email, product_id);

alter table public.purchases enable row level security;
create policy "service_role_only" on public.purchases
  using (auth.role() = 'service_role');

-- ── 4. Tabela de Sessões Suspeitas (log de auditoria) ────────
create table if not exists public.security_events (
  id         bigserial   primary key,
  type       text        not null,   -- 'failed_login' | 'coupon_abuse' | 'rate_limited' | etc.
  user_email text        default null,
  ip_addr    text        default null,
  detail     text        default null,
  occurred_at timestamptz not null default now()
);

create index if not exists sec_events_type_idx  on public.security_events (type);
create index if not exists sec_events_email_idx on public.security_events (user_email);
create index if not exists sec_events_ip_idx    on public.security_events (ip_addr);

alter table public.security_events enable row level security;
create policy "service_role_only" on public.security_events
  using (auth.role() = 'service_role');

-- ── 5. Exemplo: inserir cupons iniciais ──────────────────────
-- Descomente para criar cupons de teste:
-- insert into public.coupons (code, discount_pct, max_uses, expires_at)
-- values
--   ('LANCAMENTO', 30, 100, now() + interval '30 days'),
--   ('AMIGA10',    10, null, null),
--   ('VIP50',      50, 10,  now() + interval '7 days');
