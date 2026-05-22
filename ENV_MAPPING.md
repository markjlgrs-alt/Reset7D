# ENV_MAPPING.md — Mapeamento de Variáveis de Ambiente

> Gerado em: 2026-05-22 | Branch: `security-hardening`
> **Não contém valores reais de secrets.**

---

## Contexto do projeto

| Item | Valor |
|---|---|
| Stack | Express.js (Node.js) + HTML/JS puro no browser |
| Deploy | Vercel (Serverless Functions via `@vercel/node`) |
| Banco | Supabase (PostgreSQL + Storage) |
| **Next.js?** | **Não.** Sem build step de frontend. |
| **TypeScript?** | **Não.** CommonJS puro no backend. |
| Supabase no browser? | **Não.** Todo acesso ao Supabase passa pela API Express. |

> **Implicação:** O prefixo `NEXT_PUBLIC_` não tem efeito técnico neste projeto.
> Não há processo de build que injete variáveis de ambiente no bundle do browser.
> O browser recebe `window.BACKEND_URL` via tag `<script>` inline em `app.html`,
> derivado de `window.location.hostname` em runtime — não de `process.env`.

---

## Resumo executivo de mismatches

| Situação | Qtd |
|---|---|
| Match perfeito (Vercel = código) | 4 |
| **Mismatch crítico** (Vercel ≠ código; obrigatória) | **2** |
| **Mismatch funcional** (Vercel ≠ código; opcional com fallback ruim) | **2** |
| Esperada pelo código, ausente na Vercel (opcional) | 2 |
| Gerenciada pelo Vercel automaticamente | 1 |

---

## Tabela principal: Vercel × Código × Recomendação

| # | Nome na Vercel hoje | Nome que o código lê | Fallback implementado? | Status | Obrigatória? | Pública/Privada | Risco | Nome novo recomendado | Pode ter NEXT_PUBLIC_? | Ação necessária |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `RESEND_API_KEY` | `RESEND_API_KEY` | — | ✅ Match | Sim | **Privada** | Alto — permite envio de e-mail pelo domínio; se vazar, risco de phishing | Manter | ❌ Nunca | Nenhuma |
| 2 | `JWT_SECRET` | `JWT_SECRET` | — | ✅ Match | Sim | **Privada** | Crítico — forja qualquer sessão | Manter | ❌ Nunca | Nenhuma |
| 3 | `FROM_EMAIL` | `FROM_EMAIL` | — | ✅ Match | Não (fallback: `onboarding@resend.dev`) | Privada (server-only) | Baixo | Manter | ❌ Não recomendado | Nenhuma |
| 4 | `FROM_NAME` | `FROM_NAME` | — | ✅ Match | Não (fallback: `Reset 7D`) | Privada (server-only) | Nenhum | Manter | ❌ Não recomendado | Nenhuma |
| 5 | `URL_SUPABASE` | `SUPABASE_URL` | ✅ Sim (Etapa 3) | ⚠️ Mismatch — **app crashava** | Sim | Pública (não é secret) | **Produção quebrada** sem fallback | `SUPABASE_URL` | Não neste projeto¹ | Adicionar `SUPABASE_URL` na Vercel; manter `URL_SUPABASE` temporariamente |
| 6 | `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | ✅ Sim (Etapa 3) | ⚠️ Mismatch — **app crashava** | Sim | **Privada** | Crítico — bypassa RLS; acesso total ao banco | `SUPABASE_SERVICE_ROLE_KEY` | ❌ Nunca | Adicionar `SUPABASE_SERVICE_ROLE_KEY` na Vercel; manter `SUPABASE_SERVICE_KEY` temporariamente |
| 7 | `ORIGENS_PERMITIDAS` | `ALLOWED_ORIGINS` | ✅ Sim (Etapa 3) | ⚠️ Mismatch — CORS com fallback ruim | Não (fallback: `localhost:3001`) | Privada (server-only) | Médio — CORS bloqueava todas origens externas | `ALLOWED_ORIGINS` | ❌ Não | Adicionar `ALLOWED_ORIGINS` na Vercel; manter `ORIGENS_PERMITIDAS` temporariamente |
| 8 | `URL_DO_APLICATIVO` | `APP_URL` | ✅ Sim (Etapa 3) | ⚠️ Mismatch — link de e-mail quebrado | Não (fallback: `localhost:3001`) | Privada (server-only) | Médio — link de reset de senha apontava para localhost | `APP_URL` | Não neste projeto¹ | Adicionar `APP_URL` na Vercel; manter `URL_DO_APLICATIVO` temporariamente |

¹ *Em Next.js, `SUPABASE_URL` e `APP_URL` usados no browser seriam `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SITE_URL`. Neste projeto Express.js, o browser não lê `process.env` diretamente —
portanto o prefixo `NEXT_PUBLIC_` não é necessário nem tem efeito.*

---

## Variáveis esperadas pelo código mas ausentes na Vercel

| Variável | Obrigatória? | Uso | Risco se ausente | Ação |
|---|---|---|---|---|
| `SUPABASE_ANON_KEY` | Não (nullable) | `lib/supabase/server.js` — cliente com RLS por usuário | `createServerClient()` lança erro se chamado, mas hoje nenhuma rota o usa | Adicionar quando RLS por usuário for ativado |
| `PORT` | Não (fallback: `3001`) | Porta do processo Express | Nenhum — Vercel injeta a porta correta | **Não adicionar** — Vercel gerencia |

---

## Onde cada variável é usada no código

| Variável (`process.env.*`) | Arquivo | Contexto | Direto ou via `env.js` | Tipo de acesso |
|---|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SERVICE_KEY`) | `backend/lib/env.js` | Server-only (Node.js) | Direto em `env.js` | `serverEnv.supabaseServiceRoleKey` |
| `SUPABASE_URL` (ou `URL_SUPABASE`) | `backend/lib/env.js` | Server-only (Node.js) | Direto em `env.js` | `publicEnv.supabaseUrl` |
| `SUPABASE_ANON_KEY` | `backend/lib/env.js` | Server-only (Node.js) | Direto em `env.js` | `publicEnv.supabaseAnonKey` |
| `JWT_SECRET` | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.jwtSecret` → `lib/middleware.js` + `server.js` |
| `RESEND_API_KEY` | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.resendApiKey` → `server.js` (rota `/api/send-recovery-email`) |
| `FROM_EMAIL` | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.fromEmail` → `server.js` (envio de e-mail) |
| `FROM_NAME` | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.fromName` → `server.js` (envio de e-mail) |
| `APP_URL` (ou `URL_DO_APLICATIVO`) | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.appUrl` → `server.js` (link no e-mail de reset) |
| `ALLOWED_ORIGINS` (ou `ORIGENS_PERMITIDAS`) | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.allowedOrigins` → `server.js` (middleware CORS) |
| `PORT` | `backend/lib/env.js` | Server-only | Via `env.js` | `serverEnv.port` → `server.js` |
| `NODE_ENV` | `backend/lib/logger.js` | Server-only | Direto (exceção documentada no ESLint) | Controla formato de log |

### Onde variáveis NÃO são usadas (confirmado)

| Localização | Motivo |
|---|---|
| `app.html` (browser) | `window.BACKEND_URL` vem de `window.location.hostname`, não de `process.env` |
| `script.js` (browser) | Idem — `BACKEND_URL` é constante derivada de `window.location` |
| Qualquer arquivo com `"use client"` | Não existe em Express.js puro |
| `next.config.*` | Não existe neste projeto |
| `src/lib/` | Não existe; centralização está em `backend/lib/env.js` |

---

## Mapeamento antigo → novo (Tarefa 2)

| Nome antigo (Vercel hoje) | Nome novo (padrão) | Tipo | Fallback no código? | Quando remover o antigo |
|---|---|---|---|---|
| `URL_SUPABASE` | `SUPABASE_URL` | Pública | ✅ Sim | Após Etapa D do VERCEL_ENV_MIGRATION.md |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | **Privada** | ✅ Sim | Após Etapa D |
| `ORIGENS_PERMITIDAS` | `ALLOWED_ORIGINS` | Privada (server-only) | ✅ Sim | Após Etapa D |
| `URL_DO_APLICATIVO` | `APP_URL` | Privada (server-only) | ✅ Sim | Após Etapa D |
| `RESEND_API_KEY` | `RESEND_API_KEY` | **Privada** | — (sem mudança) | N/A |
| `JWT_SECRET` | `JWT_SECRET` | **Privada** | — (sem mudança) | N/A |
| `FROM_EMAIL` | `FROM_EMAIL` | Privada (server-only) | — (sem mudança) | N/A |
| `FROM_NAME` | `FROM_NAME` | Privada (server-only) | — (sem mudança) | N/A |

---

## Variáveis que NUNCA podem ter NEXT_PUBLIC_

> Regra: qualquer variável que contenha um secret ou chave de API
> **jamais** pode ter o prefixo `NEXT_PUBLIC_` — ele expõe o valor
> para o bundle do browser em projetos Next.js.

| Variável | Motivo |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_KEY` | Bypassa RLS — acesso total ao banco |
| `JWT_SECRET` | Permite forjar qualquer token de sessão |
| `RESEND_API_KEY` | Chave de API de e-mail |
| `FROM_EMAIL` / `FROM_NAME` | Server-only por convenção |
| `ALLOWED_ORIGINS` / `ORIGENS_PERMITIDAS` | Configuração de segurança do servidor |
| `APP_URL` / `URL_DO_APLICATIVO` | Usado em server-side apenas (link de e-mail) |
| `DATABASE_URL` | Se existir, acesso direto ao banco |
| `DIRECT_URL` | Se existir, acesso direto ao banco |

---

## Arquivo central de ambiente

| Item | Localização |
|---|---|
| Arquivo central | `backend/lib/env.js` |
| Equivalente a `env.server.ts` | `serverEnv` export de `env.js` |
| Equivalente a `env.public.ts` | `publicEnv` export de `env.js` |
| Guard server-only | `if (typeof window !== "undefined") throw` (linha 7 de `env.js`) |
| Proteção ESLint | `eslint.config.js` bloqueia `process.env.*` em todos os arquivos exceto `lib/env.js` |

---

## Estado dos clientes Supabase

| Cliente | Arquivo | Variáveis que usa | Status |
|---|---|---|---|
| Admin (service role) | `backend/lib/supabase/admin.js` | `publicEnv.supabaseUrl` + `serverEnv.supabaseServiceRoleKey` | ✅ Correto; tem runtime guard; `persistSession: false` |
| Server (anon + RLS) | `backend/lib/supabase/server.js` | `publicEnv.supabaseUrl` + `publicEnv.supabaseAnonKey` | ✅ Correto; tem runtime guard; `persistSession: false` |
| Browser | — | — | ✅ Não existe — browser não acessa Supabase diretamente |

---

*Ver `VERCEL_ENV_MIGRATION.md` para instruções passo a passo de atualização no painel da Vercel.*
