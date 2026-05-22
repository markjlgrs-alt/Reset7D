# SUPABASE_RLS_REVIEW.md — Reset 7D
**Data:** 2026-05-21  
**Branch:** `security-hardening`  
**Migration:** `supabase/migrations/20260521000000_storage_security_policies.sql`

---

## 1. Inventário de Buckets

| Bucket | Tipo | Tamanho máx. | MIMEs permitidos | Contém PII? |
|--------|------|-------------|-----------------|-------------|
| `community-photos` | **PUBLIC** | 5 MB | jpeg, png, webp | Indireto — nome de usuário visível nos posts |
| `profile-photos` | **PRIVATE** | 5 MB | jpeg, png, webp | **Sim** — imagens corporais do usuário |

---

## 2. Policies por Bucket

### 2.1 `community-photos` — PUBLIC

| Operação | Role | Condição | Decisão |
|----------|------|---------|---------|
| SELECT | anon, authenticated | `bucket_id = 'community-photos'` | ✅ ALLOW |
| INSERT | anon, authenticated | — sem policy — | 🚫 DENY |
| UPDATE | anon, authenticated | — sem policy — | 🚫 DENY |
| DELETE | anon, authenticated | — sem policy — | 🚫 DENY |
| * | service_role | bypassa RLS | ✅ ALLOW |

**Justificativa bucket público:** O feed da comunidade é visível sem login (`GET /api/community` é público). As URLs das fotos precisam ser acessíveis pelo `<img src>` do browser sem autenticação adicional. Não contém dados sensíveis individuais — as fotos são postadas intencionalmente pelo usuário para compartilhar com a comunidade.

**Controle de escrita:** Nenhum cliente pode subir, alterar ou deletar fotos diretamente. Todo write passa pela API (`POST /api/community`) que valida autenticação, MIME type, magic bytes e tamanho antes de chamar `uploadToStorage()` com a service_role key.

---

### 2.2 `profile-photos` — PRIVATE

| Operação | Role | Condição | Decisão |
|----------|------|---------|---------|
| SELECT | authenticated | `bucket_id = 'profile-photos'` AND `foldername[1] = auth.uid()` | ✅ ALLOW (owner) |
| SELECT | anon | — sem policy — | 🚫 DENY |
| INSERT | authenticated | `bucket_id = 'profile-photos'` AND `foldername[1] = auth.uid()` | ✅ ALLOW (owner) |
| UPDATE | authenticated | `bucket_id = 'profile-photos'` AND `foldername[1] = auth.uid()` | ✅ ALLOW (owner) |
| DELETE | authenticated | `bucket_id = 'profile-photos'` AND `foldername[1] = auth.uid()` | ✅ ALLOW (owner) |
| * | anon | — sem policy — | 🚫 DENY |
| * | service_role | bypassa RLS | ✅ ALLOW |

**Acesso ao conteúdo:** Feito exclusivamente via `createPrivateSignedUrl()` no backend, com TTL de 1 hora. `getPublicUrl()` nunca é chamada para este bucket.

---

## 3. Lacuna Arquitetural — auth.uid() vs. JWT Customizado

### Estado atual

O app usa JWT **customizado** (assinado com `JWT_SECRET` no backend, não Supabase Auth). Isso significa:

```
Supabase RLS context: auth.uid() → NULL
```

**Impacto por bucket:**

| Bucket | Impacto |
|--------|---------|
| `community-photos` | Nenhum — SELECT aberto não depende de auth.uid() |
| `profile-photos` | auth.uid() = NULL → condição `foldername[1] = NULL` nunca é TRUE → **todo acesso direto bloqueado** (inclui authenticated) |

Ou seja, as policies de `profile-photos` funcionam como **bloqueio total de acesso direto** — que é o comportamento correto enquanto o app usa JWT customizado. Todo acesso legítimo passa pelo backend via service_role.

### Path scheme atual vs. esperado pelas policies

| | Atual (`buildUserStoragePath`) | Esperado pelas policies |
|--|-------------------------------|------------------------|
| Primeiro segmento | `sha256(email)[0:16]` (ex: `a3f7c12d8e4b9061`) | `auth.uid()` (UUID do Supabase, ex: `550e8400-e29b-41d4-a716-446655440000`) |

### Caminho de migração para ativar as policies completamente

Para que as policies de `profile-photos` funcionem com acesso direto (quando necessário):

1. **Adotar Supabase Auth** substituindo o JWT customizado, ou
2. **Manter JWT customizado + lookup do UUID:** no handler de upload, buscar `users.id` (UUID) pelo `req.user.email` e usar esse UUID como primeiro segmento do path em vez do hash do email.

Enquanto isso não for feito, as policies atuais oferecem **defense-in-depth**: bloqueiam qualquer acesso direto ao Storage privado sem depender de auth.uid().

---

## 4. Verificação de Conformidade

| Requisito | Status | Detalhe |
|-----------|--------|---------|
| Usuário autenticado para escrita | ✅ | `TO authenticated` em todas as policies de write |
| bucket_id correto nas conditions | ✅ | `bucket_id = 'profile-photos'` em todas as policies |
| Primeira pasta = auth.uid() | ✅ (estrutural) | `(storage.foldername(name))[1] = auth.uid()::text` — ativa com Supabase Auth |
| Sem acesso público a bucket privado | ✅ | Sem policy SELECT para `anon` em `profile-photos` |
| Bucket público documentado | ✅ | `community-photos` documentado na seção 2.1 |
| Bucket público sem dados sensíveis | ✅ | Fotos de comunidade postadas voluntariamente |
| getPublicUrl nunca em bucket privado | ✅ | `getPublicStorageUrl()` só chamada com `COMMUNITY_BUCKET` |
| Migration idempotente | ✅ | `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY` |
| Sem `supabase db push` | ✅ | Migration apenas como arquivo SQL |

---

## 5. Como Aplicar

**Não usar `supabase db push`.** Aplicar manualmente:

1. Abrir o painel Supabase → **SQL Editor** → **Create a new snippet**
2. Copiar o conteúdo de `supabase/migrations/20260521000000_storage_security_policies.sql`
3. Colar e clicar **Run**
4. Resultado esperado: `Success. No rows returned`

**Verificação pós-execução:**

```sql
-- Listar todas as policies de storage
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Deve retornar 5 linhas:
- `community-photos: public read`
- `profile-photos: owner delete`
- `profile-photos: owner insert`
- `profile-photos: owner read`
- `profile-photos: owner update`

---

## 6. Riscos Residuais

| # | Risco | Mitigação | Próximo passo |
|---|-------|-----------|--------------|
| RR-1 | auth.uid() = NULL desativa owner-check em profile-photos | Bloqueio total de clientes diretos (somente service_role) | Migrar para Supabase Auth ou usar UUID do banco no path |
| RR-2 | Fotos antigas em base64 no banco (legado) | Dados no banco, não no Storage — sem URL pública | Script de migração + limpeza opcional |
| RR-3 | Signed URLs de 1h podem ser compartilhadas por terceiros antes de expirar | Expiração curta limita o dano | Reduzir para 15 min se necessário |
| RR-4 | Sem policy de DELETE em community-photos para usuário dono do post | Foto fica no Storage mesmo se post for deletado | Adicionar endpoint `DELETE /api/community/:id` que remove o objeto do Storage |
