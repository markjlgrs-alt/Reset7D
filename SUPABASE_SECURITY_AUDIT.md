# SUPABASE_SECURITY_AUDIT.md — Hardening completo do Supabase

> Data: 2026-05-22 | Branch: `security-hardening`
> Baseado em análise estática do código — sem execução de queries contra o banco remoto.

---

## Arquitetura confirmada

| Item | Valor |
|---|---|
| Auth | **JWT customizado** (assinado com `JWT_SECRET` no backend) |
| Supabase Auth | **NÃO usado** |
| `auth.uid()` em RLS | Sempre `NULL` para requests via app |
| Acesso ao banco | **Exclusivamente via Express API** + `supabaseAdmin` (service_role) |
| Acesso direto browser → Supabase | **Não existe** |
| Cliente anon no browser | **Não existe** |
| `SUPABASE_ANON_KEY` | Definida em `env.js`, mas nenhuma rota usa `supabase/server.js` |

**Consequência para RLS:**
Toda operação atual usa `supabaseAdmin` (service_role), que **bypassa RLS automaticamente**.
Ativar RLS nas tabelas públicas é **defense-in-depth**: protege contra vazamento da anon key ou
acesso direto ao Supabase, sem afetar nenhuma operação atual do backend.

---

## Tarefa 1 — Uso do Supabase no código

### 1.1 — Clientes Supabase instanciados

| Cliente | Arquivo | Key usada | Bypassa RLS? |
|---|---|---|---|
| `supabaseAdmin` | `backend/lib/supabase/admin.js` | `SUPABASE_SERVICE_ROLE_KEY` | ✅ Sim |
| `createServerClient()` | `backend/lib/supabase/server.js` | `SUPABASE_ANON_KEY` | ❌ Não |

**`createServerClient()` nunca é chamado** em nenhuma rota atual — existe apenas como infraestrutura
para futura migração para Supabase Auth com RLS por usuário.

### 1.2 — Tabelas detectadas no código

| Tabela | Arquivo | Operações |
|---|---|---|
| `users` | `server.js` | `select`, `insert`, `update` |
| `password_reset_tokens` | `server.js` | `insert`, `select`, `update` |
| `community_posts` | `server.js` | `select`, `insert`, `update` |

### 1.3 — Buckets detectados no código

| Bucket | Constante | Arquivo | Operações ativas |
|---|---|---|---|
| `community-photos` | `COMMUNITY_BUCKET` | `storage.js`, `server.js` | `upload`, `getPublicUrl` |
| `profile-photos` | `PROFILE_BUCKET` | `storage.js` | exportado — **nenhuma rota ativa** |

### 1.4 — Operações por tabela

#### `users`
| Rota | Operação | Filtro | Campos selecionados |
|---|---|---|---|
| `POST /api/register` | `select` | `.eq("email", email)` | `id` |
| `POST /api/register` | `insert` | — | `name, email, password_hash` |
| `POST /api/login` | `select` | `.eq("email", email)` | `id, name, email, password_hash` |
| `POST /api/change-password` | `select` | `.eq("email", req.user.email)` | `password_hash` |
| `POST /api/change-password` | `update` | `.eq("email", req.user.email)` | `password_hash` |
| `POST /api/reset-password` | `select` | `.eq("email", record.email)` | `id` |
| `POST /api/reset-password` | `update` | `.eq("email", record.email)` | `password_hash` |
| `GET /api/admin` (middleware) | `select` | `.eq("email", req.user.email)` | `role` |

#### `password_reset_tokens`
| Rota | Operação | Filtro | Campos selecionados |
|---|---|---|---|
| `POST /api/send-recovery-email` | `insert` | — | `email, token, expires_at` |
| `POST /api/reset-password` | `select` | `.eq("token", token).eq("used", false)` | `id, email, expires_at, used` |
| `POST /api/reset-password` | `update` | `.eq("id", record.id)` | `used: true` |

#### `community_posts`
| Rota | Operação | Filtro | Campos selecionados | Retornados ao cliente |
|---|---|---|---|---|
| `GET /api/community` | `select` | `.order().limit(50)` | `id, user_name, day, text, photo, reactions, comments, created_at` | Todos os selecionados (`user_email` NOT incluído) |
| `POST /api/community` | `insert` | — | `user_email, user_name, day, text, photo` | `id, user_name, day, text, photo, reactions, comments, created_at` |
| `PATCH /api/community/:id/react` | `select` | `.eq("id", id)` | `reactions` | — |
| `PATCH /api/community/:id/react` | `update` | `.eq("id", id)` | `reactions` | `reactions` |
| `POST /api/community/:id/comment` | `select` | `.eq("id", id)` | `comments` | — |
| `POST /api/community/:id/comment` | `update` | `.eq("id", id)` | `comments` | — |

### 1.5 — Operações por bucket

#### `community-photos` (PUBLIC)
| Rota | Operação | Função | Resultado |
|---|---|---|---|
| `POST /api/community` | `upload` | `uploadToStorage()` via `supabaseAdmin.storage.from(bucket).upload()` | Salva no Storage |
| `POST /api/community` | `getPublicUrl` | `getPublicStorageUrl()` via `supabaseAdmin.storage.from(bucket).getPublicUrl()` | URL CDN pública |

#### `profile-photos` (PRIVATE)
| Rota | Operação | Função | Resultado |
|---|---|---|---|
| — | — | `createPrivateSignedUrl()` definida mas **nenhuma rota a chama** | N/A |

### 1.6 — Rotas que usam Supabase

| Rota | Tabela/Bucket | Auth obrigatória? | Via service_role? |
|---|---|---|---|
| `GET /api/health` | — | Não | — |
| `POST /api/register` | `users` | Não | ✅ |
| `POST /api/login` | `users` | Não | ✅ |
| `POST /api/change-password` | `users` | ✅ `requireAuth` | ✅ |
| `POST /api/send-recovery-email` | `password_reset_tokens` | Não | ✅ |
| `POST /api/reset-password` | `password_reset_tokens`, `users` | Não | ✅ |
| `GET /api/community` | `community_posts` | Não | ✅ |
| `POST /api/community` | `community_posts`, `community-photos` | ✅ `requireAuth` | ✅ |
| `PATCH /api/community/:id/react` | `community_posts` | ✅ `requireAuth` | ✅ |
| `POST /api/community/:id/comment` | `community_posts` | ✅ `requireAuth` | ✅ |

### 1.7 — Componentes que usam Supabase

**Nenhum componente client-side acessa Supabase.**
O browser comunica exclusivamente via `fetch()` para as rotas `/api/*` do backend Express.

### 1.8 — Dependência da service key

Todas as operações de banco e storage usam `supabaseAdmin` (service_role). Isso é **correto dado
o uso de JWT customizado** — não existe sessão Supabase por usuário. A service_role key:
- Está exclusivamente em `backend/lib/supabase/admin.js` (server-only)
- É lida apenas via `serverEnv.supabaseServiceRoleKey` em `env.js`
- Nunca aparece em respostas HTTP, logs ou código client-side

---

## Tarefa 2 — Tabelas e ownership

### 2.1 — Classificação das tabelas

| Tabela | Tipo | Coluna dona | Observação |
|---|---|---|---|
| `users` | Privada por usuário | `email` (não `user_id`) | ID do Supabase é `id` (UUID), mas app usa `email` como chave |
| `password_reset_tokens` | Privada por email | `email` | Sem FK para `users` |
| `community_posts` | Pública de leitura / privada de escrita | `user_email` | Email não retornado na API pública — mas armazenado no banco |

### 2.2 — Coluna dona real vs. esperada por `auth.uid()`

| Tabela | `auth.uid()` available? | Coluna dona real | Problema de mapping |
|---|---|---|---|
| `users` | ❌ NULL (JWT customizado) | `email` | RLS com `auth.uid()` impossível hoje |
| `password_reset_tokens` | ❌ NULL | `email` | Idem |
| `community_posts` | ❌ NULL | `user_email` | Idem |

**Conclusão:** RLS com policies `USING (auth.uid() = coluna)` **não funciona** com a arquitetura atual.
A estratégia correta é: **ativar RLS + nenhuma policy para anon/authenticated → bloqueia tudo exceto service_role**.

---

## Tarefa 8 — Verificação da service key

| Verificação | Resultado |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` aparece apenas em server-only? | ✅ Apenas `backend/lib/env.js` e `backend/lib/supabase/admin.js` |
| Aparece em componente client? | ✅ Não — não há componentes client-side |
| Aparece em middleware desnecessário? | ✅ Não — `middleware.js` usa `supabaseAdmin` apenas para verificar `role` em `requireAdmin` |
| Usada como atalho para operações normais de usuário? | ⚠️ Sim — todas as ops usam service_role (obrigatório com JWT customizado; não é atalho preguiçoso) |

---

## Riscos identificados

| # | Risco | Prioridade | Status |
|---|---|---|---|
| R-01 | RLS desativado nas tabelas públicas: vazamento via anon key | **Crítica** | ✅ Migration criada |
| R-02 | `community_posts.user_email` legível via anon key se RLS não ativado | **Alta** | ✅ RLS bloqueia; ver R-01 |
| R-03 | `PROFILE_BUCKET` definido mas sem rota — feature incompleta | **Média** | TODO antes de implementar |
| R-04 | `auth.uid()` = NULL: policies de profile-photos nunca ativam para clientes diretos | **Média** | Documentado; defense-in-depth ativo |
| R-05 | Tokens expirados acumulam na tabela `password_reset_tokens` | **Baixa** | TODO: job de limpeza periódica |
| R-06 | `SUPABASE_ANON_KEY` ausente na Vercel — `createServerClient()` lança se chamado | **Baixa** | OK — nenhuma rota usa hoje |
| R-07 | `community_posts.reactions` e `.comments` armazenados como JSONB — sem validação de schema no DB | **Baixa** | Zod valida no backend; aceitável |

---

*Ver `supabase/migrations/20260522000000_enable_rls_tables.sql` para a migration de hardening das tabelas.*
*Ver `SUPABASE_RLS_REVIEW.md` para o inventário completo de policies.*
*Ver `AUTH_SECURITY_CHECKLIST.md` para verificações manuais no painel Supabase.*
