# SUPABASE_RLS_REVIEW.md — Reset 7D

> Data: 2026-05-22 | Branch: `security-hardening`
> Atualizado: inclui tabelas públicas + Storage.

---

## Inventário completo

### Tabelas (schema `public`)

| Tabela | Tipo | Coluna dona | RLS ativo | Policies (anon/auth) | Operações permitidas via anon key |
|---|---|---|---|---|---|
| `users` | Privada por usuário | `email` | ✅ Migration criada | **Nenhuma** | 🚫 Tudo bloqueado |
| `password_reset_tokens` | Privada por email | `email` | ✅ Migration criada | **Nenhuma** | 🚫 Tudo bloqueado |
| `community_posts` | Semi-pública (escrita privada) | `user_email` | ✅ Migration criada | **Nenhuma** | 🚫 Tudo bloqueado |

### Buckets (schema `storage`)

| Bucket | Tipo | RLS | Policies | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|---|---|
| `community-photos` | PUBLIC | ✅ (Supabase padrão) | `public read` | ✅ Anon/auth | 🚫 Somente service_role | 🚫 Somente service_role | 🚫 Somente service_role |
| `profile-photos` | PRIVATE | ✅ (Supabase padrão) | `owner read/insert/update/delete` | 🚫 (auth.uid()=NULL) | 🚫 (auth.uid()=NULL) | 🚫 (auth.uid()=NULL) | 🚫 (auth.uid()=NULL) |

---

## Decisão arquitetural: Por que não usar `USING (auth.uid())`?

O app usa **JWT customizado** (não Supabase Auth). Consequência direta:

```
auth.uid() → NULL para todo request via app
```

**Com `auth.uid()` = NULL:**
- `USING (id = auth.uid())` avalia como `USING (id = NULL)` → **sempre FALSE**
- Políticas baseadas em `auth.uid()` bloqueariam até o próprio usuário
- service_role bypassa RLS → backend não é afetado

**Estratégia adotada: RLS ativo sem policies → bloqueio total para anon/authenticated.**
Backend acessa via service_role, que bypassa RLS. Sem impacto funcional.

---

## Detalhe por tabela

### `public.users`

| Operação | Anon key | Auth (custom JWT) | service_role | Motivo |
|---|---|---|---|---|
| SELECT | 🚫 | 🚫 | ✅ | Contém `password_hash`, `email`, `role` — altamente sensível |
| INSERT | 🚫 | 🚫 | ✅ | Cadastro só via `/api/register` com validação Zod |
| UPDATE | 🚫 | 🚫 | ✅ | Alteração de senha só via `/api/change-password` com `bcrypt.compare` |
| DELETE | 🚫 | 🚫 | ✅ | Nenhuma rota de delete existe; bloqueio total é correto |

**TODOs:**
- [ ] Quando migrar para Supabase Auth: criar policies com `USING (id = auth.uid())`
- [ ] A coluna `role` NUNCA deve ser alterável via policy de usuário
- [ ] Para promover admin: `UPDATE users SET role='admin' WHERE email='...'` direto no SQL Editor

---

### `public.password_reset_tokens`

| Operação | Anon key | Auth | service_role | Motivo |
|---|---|---|---|---|
| SELECT | 🚫 | 🚫 | ✅ | Token é um secret — não pode ser enumerado |
| INSERT | 🚫 | 🚫 | ✅ | Inserção só via `/api/send-recovery-email` |
| UPDATE | 🚫 | 🚫 | ✅ | Marcar `used=true` só via `/api/reset-password` |
| DELETE | 🚫 | 🚫 | ✅ | Sem rota de delete |

**TODOs:**
- [ ] Criar limpeza periódica de tokens expirados:
  ```sql
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() OR used = true;
  ```
  Pode ser executado via `pg_cron` (extensão Supabase) ou job agendado externo.

---

### `public.community_posts`

| Operação | Anon key | Auth | service_role | Motivo |
|---|---|---|---|---|
| SELECT | 🚫 | 🚫 | ✅ | `user_email` armazenada — policy aberta exporia PII |
| INSERT | 🚫 | 🚫 | ✅ | Post só via `/api/community` com `requireAuth` |
| UPDATE | 🚫 | 🚫 | ✅ | Reações/comentários via API autenticada |
| DELETE | 🚫 | 🚫 | ✅ | Nenhuma rota de delete existe |

**Observação:** O feed público é acessível via `GET /api/community` (sem auth).
A API usa `service_role` e retorna apenas as colunas seguras — `user_email` é explicitamente excluído da query SELECT. A combinação "RLS bloqueia anon" + "API serve dados filtrados" é mais segura do que "RLS permite anon + confia em projeção de colunas".

**TODOs:**
- [ ] Migração futura: substituir `user_email` por `user_id` (UUID FK para `users.id`) antes de criar policy `USING (true)` para SELECT público. Com `user_email` na tabela, `USING (true)` exporia PII.
- [ ] Adicionar `DELETE /api/community/:id` (autenticada, verifica `user_email = req.user.email`) quando feature de exclusão de post for necessária.
- [ ] Ao implementar exclusão: remover objeto do Storage correspondente (`community-photos` bucket) via `supabaseAdmin.storage.from(COMMUNITY_BUCKET).remove([storagePath])`.

---

## Storage — Buckets

### `community-photos` — PUBLIC

| Operação | Roles | Condição | Resultado |
|---|---|---|---|
| SELECT | anon, authenticated | `bucket_id = 'community-photos'` | ✅ Permitido |
| INSERT | anon, authenticated | — sem policy — | 🚫 Bloqueado |
| UPDATE | anon, authenticated | — sem policy — | 🚫 Bloqueado |
| DELETE | anon, authenticated | — sem policy — | 🚫 Bloqueado |
| ALL | service_role | bypassa RLS | ✅ Permitido |

**Justificativa:** Feed público por design. URLs acessíveis via CDN sem auth para `<img src>`.
Writes passam pelo backend: valida MIME, magic bytes, tamanho, path sanitizado antes de `upload()`.

---

### `profile-photos` — PRIVATE

| Operação | Roles | Condição | Resultado atual |
|---|---|---|---|
| SELECT | authenticated | `bucket_id = 'profile-photos' AND foldername[1] = auth.uid()` | 🚫 Bloqueado (auth.uid()=NULL) |
| INSERT | authenticated | idem | 🚫 Bloqueado |
| UPDATE | authenticated | idem | 🚫 Bloqueado |
| DELETE | authenticated | idem | 🚫 Bloqueado |
| SELECT | anon | — sem policy — | 🚫 Bloqueado |
| ALL | service_role | bypassa RLS | ✅ Permitido |

**Acesso:** Exclusivamente via `createPrivateSignedUrl()` no backend (TTL: 1 hora).
`getPublicUrl()` **nunca** é chamado para este bucket.

**Estado:** Bucket definido, mas **nenhuma rota ativa** utiliza `profile-photos` ainda.
A função `createPrivateSignedUrl()` está pronta em `backend/lib/storage.js`.

**TODO antes de implementar rota de profile-photos:**
- [ ] Definir path scheme: usar `users.id` (UUID Supabase) como primeiro segmento,
  ou manter hash do email e aceitar que policies de auth.uid() não funcionam com clientes diretos.
- [ ] Criar endpoint `POST /api/profile/photo` (autenticado) que:
  1. Valida arquivo (MIME, magic bytes, tamanho)
  2. Faz upload para `{user_uuid}/profile/{timestamp}.ext`
  3. Retorna signed URL (não a URL pública)
- [ ] Criar endpoint `GET /api/profile/photo` (autenticado) que gera signed URL com TTL curto.

---

## Migrations criadas

| Arquivo | Tabelas/Buckets | Status |
|---|---|---|
| `supabase_migration.sql` | Criação das tabelas + buckets (existia antes) | Aplicar manualmente |
| `supabase/migrations/20260521000000_storage_security_policies.sql` | Policies de Storage | Aplicar manualmente |
| `supabase/migrations/20260522000000_enable_rls_tables.sql` | RLS nas tabelas `public.*` | **Novo — aplicar manualmente** |

---

## Como aplicar as migrations

**Não usar `supabase db push`.** Aplicar na seguinte ordem:

### Ordem de aplicação

```
1. supabase_migration.sql             (se ainda não aplicado)
2. 20260521000000_storage_security_policies.sql
3. 20260522000000_enable_rls_tables.sql   ← NOVA
```

### Passos para `20260522000000_enable_rls_tables.sql`

1. Abrir **Supabase Dashboard** → seu projeto
2. Menu lateral → **SQL Editor** → **New query**
3. Copiar todo o conteúdo do arquivo
4. Colar e clicar **Run**
5. Resultado esperado: `Success. No rows returned`

### Verificação pós-execução

```sql
-- Confirmar RLS ativo nas 3 tabelas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'password_reset_tokens', 'community_posts');
-- Esperado: rowsecurity = true para todas

-- Confirmar que não há policies problemáticas (deve retornar 0 linhas)
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'password_reset_tokens', 'community_posts')
ORDER BY tablename, policyname;
-- Esperado: 0 linhas (sem policies para anon/authenticated)

-- Confirmar policies de Storage (deve retornar 5 linhas)
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

---

## Riscos residuais

| # | Risco | Severidade | Mitigação | Próximo passo |
|---|---|---|---|---|
| RR-01 | `auth.uid()` = NULL com JWT customizado — policies owner-based inativas | Média | Defense-in-depth via RLS sem policy | Migrar para Supabase Auth quando conveniente |
| RR-02 | `password_reset_tokens` acumula tokens expirados | Baixa | Tokens expirados são inofensivos | Criar pg_cron job de limpeza |
| RR-03 | `community_posts.user_email` exposta a admins Supabase com acesso ao banco | Baixa | Acesso ao banco restrito a service_role via API | Considerar substituir por user_id futuro |
| RR-04 | `profile-photos` — feature incompleta sem rota ativa | Média | Bucket existe; nenhum dado exposto | Implementar rota antes de expor ao usuário |
| RR-05 | Signed URLs de profile-photos com TTL 1h podem ser compartilhadas | Baixa | Expiração limita o dano | Reduzir TTL para 15 min se feature for ativada |
| RR-06 | `community_posts` sem USING (true) para SELECT via anon key bloqueia apps de terceiros | Baixa | Intencional — protege user_email | Documentar: feed público = via API |

---

## Confirmações de segurança

| Item | Status |
|---|---|
| Nenhuma policy com `USING (true)` para dados privados | ✅ Confirmado |
| `USING (true)` evitado em `community_posts` para proteger `user_email` | ✅ Confirmado |
| service_role apenas em arquivos server-only | ✅ Confirmado |
| `getPublicUrl()` nunca chamado para bucket privado | ✅ Confirmado |
| `createSignedUrl()` disponível para profile-photos (TTL configurável) | ✅ Implementado |
| Uploads validam MIME + magic bytes + tamanho + path sanitizado | ✅ Implementado |
| Nenhuma migration usa `supabase db push` | ✅ Confirmado |
| Nenhuma tabela ou coluna foi apagada | ✅ Confirmado |
