-- ══════════════════════════════════════════════════════════════
--  Migration: Storage Security Policies
--  Arquivo:   20260521000000_storage_security_policies.sql
--  Criado em: 2026-05-21
--
--  Buckets gerenciados:
--    community-photos  PUBLIC  — fotos do feed da comunidade
--    profile-photos    PRIVATE — fotos de progresso pessoal
--
--  NOTA DE ARQUITETURA — auth.uid() e JWT customizado
--  ─────────────────────────────────────────────────
--  O app Reset 7D usa JWT customizado (não Supabase Auth). Por isso
--  auth.uid() retorna NULL para qualquer request que chegue com o
--  token JWT do app. Consequência por bucket:
--
--    community-photos: SELECT é aberto (bucket público por design).
--      INSERT/UPDATE/DELETE: sem policy → bloqueados para anon e
--      authenticated. Somente a service_role key (backend API) pode
--      gravar — ela bypassa RLS.
--
--    profile-photos: todas as policies exigem
--      (storage.foldername(name))[1] = auth.uid()::text.
--      Com auth.uid() = NULL, nenhum cliente direto satisfaz a
--      condição → acesso negado a todos exceto service_role.
--      Isso é intencional: defense-in-depth enquanto o app usa JWT
--      customizado. Quando o app migrar para Supabase Auth e o path
--      scheme for atualizado para usar o UUID real do usuário, as
--      policies estarão prontas e funcionarão sem mais alterações.
--
--  Esta migration é idempotente: usa DROP … IF EXISTS antes de criar.
--  Não faz supabase db push — aplicar manualmente no SQL Editor.
-- ══════════════════════════════════════════════════════════════

-- RLS em storage.objects é ativado pelo Supabase por padrão.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY não é permitido
-- via SQL Editor (erro 42501: must be owner of table objects).

-- ── Limpeza idempotente ───────────────────────────────────────
-- Remove policies que possam existir de execuções anteriores ou
-- da migration inicial em supabase_migration.sql.

DROP POLICY IF EXISTS "community-photos: leitura pública"  ON storage.objects;
DROP POLICY IF EXISTS "community-photos: public read"       ON storage.objects;
DROP POLICY IF EXISTS "profile-photos: owner read"          ON storage.objects;
DROP POLICY IF EXISTS "profile-photos: owner insert"        ON storage.objects;
DROP POLICY IF EXISTS "profile-photos: owner update"        ON storage.objects;
DROP POLICY IF EXISTS "profile-photos: owner delete"        ON storage.objects;

-- ══════════════════════════════════════════════════════════════
--  Bucket: community-photos
--  Tipo:    PUBLIC
--  Dados:   fotos de posts do feed da comunidade
--  PII:     nome de usuário visível nos posts, sem dado íntimo
--  Risco:   BAIXO — conteúdo compartilhado intencionalmente
-- ══════════════════════════════════════════════════════════════

-- SELECT — leitura pública irrestrita (feed visível sem login)
CREATE POLICY "community-photos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-photos');

-- INSERT — sem policy: apenas service_role (backend API) pode subir fotos.
-- UPDATE — sem policy: apenas service_role pode substituir.
-- DELETE — sem policy: apenas service_role pode remover.
-- (Com RLS ativo, ausência de policy = DENY para anon e authenticated.)

-- ══════════════════════════════════════════════════════════════
--  Bucket: profile-photos
--  Tipo:    PRIVATE
--  Dados:   fotos de progresso pessoal ("calça de referência")
--  PII:     imagens do corpo do usuário — sensível
--  Risco:   ALTO se exposto. Acesso somente via signed URL (1 h).
-- ══════════════════════════════════════════════════════════════

-- SELECT — owner only
-- Condição: primeira pasta do path = auth.uid() do usuário autenticado.
-- Com JWT customizado atual: auth.uid() = NULL → acesso bloqueado para
-- todos os clientes diretos (somente service_role bypassa).
CREATE POLICY "profile-photos: owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT — owner only: só pode fazer upload dentro da própria pasta
CREATE POLICY "profile-photos: owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE — owner only: só pode sobrescrever arquivos da própria pasta
CREATE POLICY "profile-photos: owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE — owner only: só pode remover arquivos da própria pasta
CREATE POLICY "profile-photos: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
