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
  -- role controla permissões administrativas.
  -- Valores aceitos: 'user' (padrão) | 'admin'.
  -- NUNCA aceitar role vindo do client — backend lê sempre deste campo.
  -- Para promover um admin: UPDATE users SET role='admin' WHERE email='...';
  role          TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Caso a tabela já exista sem a coluna role, adicionar via ALTER TABLE:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS
--   role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

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
--  Supabase Storage — Buckets e RLS
--  Execute no Supabase Dashboard → SQL Editor → New query
--
--  Arquitetura:
--    community-photos  PUBLIC  — fotos de posts da comunidade (CDN pública)
--    profile-photos    PRIVATE — fotos de progresso pessoal (signed URLs)
--
--  Todos os uploads passam pelo backend API (service role key),
--  que valida MIME, magic bytes, tamanho e path antes de gravar.
--  Nenhum cliente acessa o Storage diretamente.
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'community-photos',
    'community-photos',
    true,        -- público: getPublicUrl retorna CDN acessível sem auth
    5242880,     -- 5 MB — reforço na camada de Storage além da validação no backend
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'profile-photos',
    'profile-photos',
    false,       -- privado: somente signed URLs com expiração curta
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ── RLS: community-photos ─────────────────────────────────────
-- Leitura pública (o bucket já é público, mas a policy garante
-- que não há leitura via anon key em outras operações).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'community-photos: leitura pública'
  ) THEN
    CREATE POLICY "community-photos: leitura pública"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'community-photos');
  END IF;
END $$;

-- Sem policy de INSERT/UPDATE/DELETE para usuários anon ou autenticados:
-- somente a service_role key (backend API) pode gravar — bypassa RLS.

-- ── RLS: profile-photos ───────────────────────────────────────
-- Nenhuma policy para anon/authenticated: somente service_role acessa.
-- O backend gera signed URLs de curta duração ao servir as imagens.
-- (Se Supabase Auth for adotado futuramente, trocar o path scheme para
--  auth.uid() e adicionar policy de leitura por UID.)

-- ── Body limit: aumentar para suportar fotos maiores ─────────
-- O Express já aceita JSON de até 2 MB (suficiente para base64 comprimido
-- que o frontend envia). O Storage recebe o Buffer decodificado via backend.
-- Nenhuma alteração de config necessária no Supabase.
