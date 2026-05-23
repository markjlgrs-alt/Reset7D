-- ══════════════════════════════════════════════════════════════
--  Migration: Enable RLS on public schema tables
--  Arquivo:   20260522000000_enable_rls_tables.sql
--  Criado em: 2026-05-22
--
--  Tabelas afetadas:
--    public.users
--    public.password_reset_tokens
--    public.community_posts
--
--  NOTA DE ARQUITETURA — JWT customizado vs. auth.uid()
--  ─────────────────────────────────────────────────────
--  O app Reset 7D usa JWT customizado (assinado com JWT_SECRET no backend,
--  NÃO Supabase Auth). Consequência: auth.uid() retorna NULL para toda
--  requisição que chega com o token do app.
--
--  Por esse motivo, NÃO é possível criar policies tipo:
--    USING (user_id = auth.uid())
--  porque auth.uid() seria sempre NULL → nunca seria TRUE.
--
--  Estratégia adotada — Defense-in-Depth:
--    - Ativar RLS em todas as tabelas.
--    - NÃO criar policies para anon ou authenticated nas tabelas privadas
--      (users, password_reset_tokens).
--    - Com RLS ativo e sem policy → acesso bloqueado para anon e authenticated.
--    - service_role bypassa RLS → backend continua funcionando.
--    - Resultado: se a anon key vazar, ela não consegue ler dados do banco.
--
--  Estratégia para community_posts:
--    - SELECT: bloqueado para anon/authenticated via RLS (sem policy).
--      O feed público é servido exclusivamente pela API (service_role),
--      que retorna apenas as colunas seguras (sem user_email).
--      Rationale: permitir SELECT via anon key exporia user_email de todos
--      os autores de posts — PII que nunca deve ser visível publicamente.
--    - INSERT/UPDATE/DELETE: sem policy → bloqueados para anon/authenticated.
--
--  Impacto no app atual: NENHUM — toda operação usa supabaseAdmin (service_role).
--
--  Aplicar manualmente: Supabase Dashboard → SQL Editor → New query → Run.
--  Não usar supabase db push.
--
--  Esta migration é idempotente: usa DROP POLICY IF EXISTS antes de criar.
-- ══════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════
--  Tabela: public.users
--  Tipo:    Privada por usuário
--  PII:     name, email, password_hash — ALTAMENTE SENSÍVEL
--  Dono:    email (não auth.uid() — JWT customizado)
--
--  Decisão: RLS ativo, SEM policies para anon/authenticated.
--  Efeito:  Anon key e clientes autenticados via Supabase Auth são bloqueados.
--           service_role (backend API) continua com acesso total.
--
--  TODO (futura migração para Supabase Auth):
--    Quando auth.uid() estiver disponível, criar policies como:
--      SELECT: USING (id = auth.uid())
--      UPDATE: USING (id = auth.uid()) WITH CHECK (id = auth.uid())
--    NUNCA criar policy INSERT sem WITH CHECK (id = auth.uid()).
--    NUNCA criar policy que permita alterar a coluna `role`.
-- ══════════════════════════════════════════════════════════════

-- Limpeza idempotente: remover policies anteriores se existirem
DROP POLICY IF EXISTS "users: own read"          ON public.users;
DROP POLICY IF EXISTS "users: own insert"        ON public.users;
DROP POLICY IF EXISTS "users: own update"        ON public.users;
DROP POLICY IF EXISTS "users: own delete"        ON public.users;
DROP POLICY IF EXISTS "users: public read"       ON public.users;
DROP POLICY IF EXISTS "users: authenticated read" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Sem policies para anon/authenticated: acesso bloqueado.
-- service_role bypassa RLS automaticamente — sem necessidade de policy.


-- ══════════════════════════════════════════════════════════════
--  Tabela: public.password_reset_tokens
--  Tipo:    Privada por email / administrativa
--  PII:     email, token (secret) — CRÍTICO
--  Dono:    email (sem FK para users, sem auth.uid())
--
--  Decisão: RLS ativo, SEM policies para anon/authenticated.
--  Efeito:  Tokens NUNCA podem ser enumerados via anon key.
--           Bloqueia ataques de enumeração de tokens e e-mails.
--           service_role (backend API) continua com acesso total.
--
--  TODO (manutenção):
--    Criar job periódico (pg_cron ou trigger) para limpar tokens
--    expirados: DELETE FROM password_reset_tokens WHERE expires_at < NOW();
--    Tokens expirados são inofensivos (usados=true ou expired) mas acumulam.
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "tokens: own read"   ON public.password_reset_tokens;
DROP POLICY IF EXISTS "tokens: own insert" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "tokens: own update" ON public.password_reset_tokens;

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Sem policies para anon/authenticated: acesso bloqueado.
-- service_role bypassa RLS automaticamente.


-- ══════════════════════════════════════════════════════════════
--  Tabela: public.community_posts
--  Tipo:    Pública de leitura via API / privada de escrita
--  PII:     user_email (armazenada no banco) — SENSÍVEL
--  Dono:    user_email (não auth.uid())
--
--  Decisão de SELECT:
--    BLOQUEADO para anon/authenticated via RLS (sem policy de SELECT).
--
--    Rationale: community_posts armazena user_email em coluna aberta.
--    Permitir SELECT via anon key exporia o e-mail de todos os autores
--    de posts, mesmo que a API nunca retorne esse campo.
--    O feed público é servido exclusivamente pela API (service_role),
--    que projeta apenas os campos seguros (sem user_email).
--
--    ATENÇÃO: USING (true) foi CONSCIENTEMENTE evitado para proteger PII.
--    Acesso público ao conteúdo é garantido pela API, não por policy aberta.
--
--  Decisão de INSERT/UPDATE/DELETE:
--    BLOQUEADO para anon/authenticated (sem policies).
--    service_role (backend API) gerencia todas as escritas.
--
--  TODO (futura migração para Supabase Auth):
--    Quando auth.uid() estiver disponível e user_email for removida/substituída
--    por user_id (FK para users.id), criar:
--
--      CREATE POLICY "community_posts: public read"
--        ON public.community_posts FOR SELECT
--        TO anon, authenticated
--        USING (true);   -- só seguro após remover user_email da tabela
--
--      CREATE POLICY "community_posts: owner insert"
--        ON public.community_posts FOR INSERT
--        TO authenticated
--        WITH CHECK ((select auth.uid()) = user_id);
--
--      CREATE POLICY "community_posts: owner update own"
--        ON public.community_posts FOR UPDATE
--        TO authenticated
--        USING ((select auth.uid()) = user_id)
--        WITH CHECK ((select auth.uid()) = user_id);
--    Reações e comentários de outros usuários: modelo separado ou função.
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "community_posts: public read"     ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner insert"    ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner update"    ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner delete"    ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: auth read"       ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: anon read"       ON public.community_posts;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Sem policies: SELECT, INSERT, UPDATE e DELETE bloqueados para anon/authenticated.
-- service_role (backend API) mantém acesso total.


-- ══════════════════════════════════════════════════════════════
--  Verificação pós-execução
--  Cole no SQL Editor após rodar esta migration para confirmar:
--
--  SELECT tablename, rowsecurity
--  FROM pg_tables
--  WHERE schemaname = 'public'
--    AND tablename IN ('users','password_reset_tokens','community_posts');
--
--  Resultado esperado: rowsecurity = true para todas as 3 tabelas.
--
--  Para listar policies criadas (deve retornar 0 linhas para as tabelas acima
--  com anon/authenticated; service_role não aparece em pg_policies):
--
--  SELECT tablename, policyname, cmd, roles
--  FROM pg_policies
--  WHERE schemaname = 'public'
--    AND tablename IN ('users','password_reset_tokens','community_posts')
--  ORDER BY tablename, policyname;
-- ══════════════════════════════════════════════════════════════
