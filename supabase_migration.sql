-- ══════════════════════════════════════════════════════════════
--  Reset 7D — Migração inicial do banco de dados
--  Execute no Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL,
  token      TEXT        UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

-- Índice para busca por e-mail
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ══════════════════════════════════════════════════════════════
--  Posts da Comunidade
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_posts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT        NOT NULL,
  user_name  TEXT        NOT NULL,
  day        INT         NOT NULL DEFAULT 1,
  text       TEXT        DEFAULT '',
  photo      TEXT,
  reactions  JSONB       DEFAULT '{}',
  comments   JSONB       DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_created ON community_posts(created_at DESC);

-- ══════════════════════════════════════════════════════════════
--  SEGURANÇA — Row Level Security (RLS)
--  CRÍTICO: sem isso qualquer pessoa com a chave anon do Supabase
--  lê toda a tabela via REST API diretamente.
--  O backend usa service_role (bypassa RLS) — correto.
--  O anon (público) fica totalmente bloqueado.
-- ══════════════════════════════════════════════════════════════

-- Habilita RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas service_role (backend) pode operar
-- Usar auth.role() = 'service_role' em vez de auth.uid() porque
-- o backend não usa o Auth do Supabase, usa JWT próprio.
CREATE POLICY "service_role_only" ON public.users
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_only" ON public.password_reset_tokens
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_only" ON public.community_posts
  USING (auth.role() = 'service_role');

-- Verificação: execute no SQL Editor do Supabase para confirmar:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
