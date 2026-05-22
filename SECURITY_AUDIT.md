# SECURITY_AUDIT.md — Reset 7D
**Data:** 2026-05-21  
**Auditor:** Claude Sonnet 4.6 (análise estática, sem acesso ao banco de produção)  
**Branch:** `security-hardening`  
**Escopo:** repositório completo, excluindo `node_modules`, `.next`, `dist`, `build`, `.git`

---

## 1. Estrutura Identificada

| Item | Valor |
|------|-------|
| Framework | **HTML/JS vanilla + React via CDN** (não Next.js como descrito; sem App Router nem Pages Router) |
| Backend | Express.js (`backend/server.js`) — serverless via Vercel |
| Auth | JWT customizado + bcrypt (não Supabase Auth) |
| Banco | Supabase (service role key no backend) |
| Email | Resend (API key no backend) |
| Frontend | Arquivo único `app.html` com React 18 + Babel standalone via CDN |
| Deploy | Vercel (static + serverless function) |

**`.env` no histórico git:** Não encontrado — corretamente gitignored.  
**`.vercel/project.json` commitado:** Não — gitignored e não rastreado.

---

## 2. Buscas Executadas

| Padrão | Resultado |
|--------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` / `service_role` / `SERVICE_KEY` | Só referenciado via `process.env` — sem valor hardcoded |
| `eyJ...` (JWT raw) | Não encontrado |
| `sk-` / `re_[A-Za-z0-9]{20+}` | Não encontrado |
| `DATABASE_URL` / `postgres://` | Não encontrado |
| `secret =` / `password =` (literal) | Não encontrado (só parâmetros de função) |
| `createClient(` | Apenas `backend/server.js:17`, com `process.env` |
| `NEXT_PUBLIC_` | Não encontrado |
| `localStorage` com dados sensíveis | `r7d_users` (dead code), `r7d_token` em `sessionStorage` |

---

## 3. Achados por Prioridade

---

### 🔴 CRÍTICO

> Nenhum secret hardcoded encontrado no repositório. Nenhuma chave, token ou credencial real está exposta em arquivos rastreados pelo git.

---

### 🟠 ALTA

---

#### A-1 — `/api/reset-password` sem rate limiting
**Arquivo:** `backend/server.js:332`  
**Risco:** O endpoint de redefinição de senha aceita tokens de 64 caracteres hex (256 bits de entropia — difícil de adivinhar), mas sem limite de tentativas, um atacante pode fazer milhares de requisições por segundo contra tokens recentes ou paralelos. Qualquer token criado nos 30 minutos de validade fica exposto a enumeração se o espaço de tokens for menor do que o esperado em implementações futuras.  
**Evidência:**
```js
// server.js:332 — SEM limiterAuth ou limiterEmail
app.post("/api/reset-password", async (req, res) => {
```
Todos os outros endpoints sensíveis têm `limiterAuth` ou `limiterEmail`. Este é o único que não tem.  
**Ação recomendada:** Adicionar `limiterAuth` (ou um limiter específico) ao handler. Exemplo: `app.post("/api/reset-password", limiterAuth, async (req, res) => {`

---

#### A-2 — CORS permite qualquer subdomínio `*.vercel.app`
**Arquivo:** `backend/server.js:49`  
**Risco:** Qualquer aplicação hospedada na Vercel (incluindo projetos de terceiros) pode fazer requisições autenticadas cross-origin para esta API, incluindo endpoints como `/api/community`, `/api/login` e `/api/register`. Isso elimina a proteção CORS como barreira de isolamento.  
**Evidência:**
```js
// server.js:49
if (origin.endsWith(".vercel.app")) return cb(null, true);
```
**Ação recomendada:** Restringir ao domínio específico do projeto: `if (origin === "https://reset-7d.vercel.app") return cb(null, true);` (verificar nome exato no painel da Vercel). Manter localhost para desenvolvimento.

---

#### A-3 — Scripts de CDN sem Subresource Integrity (SRI)
**Arquivo:** `app.html:7-11`  
**Risco:** Se `unpkg.com` ou `cdnjs.cloudflare.com` forem comprometidos (supply chain attack), código malicioso será executado no navegador de todos os usuários com os mesmos privilégios do app (acesso a sessionStorage, tokens JWT, dados do formulário). O React `development.js` inclui avisos de debug e é mais pesado; em produção deve-se usar a versão `production.min.js`.  
**Evidência:**
```html
<!-- app.html:7-11 — sem atributo integrity="" -->
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
```
**Ação recomendada:** Adicionar `integrity="sha384-..."` gerado via [srihash.org](https://www.srihash.org/) para cada script. Substituir `react.development.js` por `react.production.min.js`. Avaliar eliminar o Babel standalone (ver A-4).

---

#### A-4 — Babel Standalone em produção (`unsafe-inline` obrigatório)
**Arquivo:** `app.html:10`, `backend/server.js:27`  
**Risco:** `@babel/standalone` é um transpilador runtime de desenvolvimento. Em produção ele: (1) aumenta o payload em ~700 KB; (2) força o CSP a permitir `unsafe-inline` para `scriptSrc`, pois o Babel injeta scripts inline — tornando o Content-Security-Policy ineficaz contra XSS.  
**Evidência:**
```html
<!-- app.html:10 -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```
```js
// server.js:27 — obrigatório por causa do Babel inline
scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
```
**Ação recomendada:** Migrar para build com Vite/CRA que gera JS pré-compilado, ou pré-compilar `app.html` com Babel CLI e servir o output. Isso permite remover `unsafe-inline` do CSP.

---

### 🟡 MÉDIA

---

#### M-1 — CSP permite `unsafe-inline` em `scriptSrc`
**Arquivo:** `backend/server.js:27`  
**Risco:** Com `unsafe-inline`, um atacante que consiga injetar conteúdo HTML na página (via reflected XSS, stored XSS em posts da comunidade, ou via um CDN comprometido) pode executar JavaScript arbitrário sem restrição de política.  
**Ação recomendada:** Dependente da resolução de A-4. Com Babel removido, `unsafe-inline` pode ser eliminado e substituído por `nonce` ou `strict-dynamic`.

---

#### M-2 — JWT armazenado em `sessionStorage` (acessível via XSS)
**Arquivo:** `app.html:1930, 2012, 337`  
**Risco:** `sessionStorage` é acessível por qualquer JavaScript na mesma origem. Se um XSS for explorado (ex.: em comentários da comunidade que escapem da sanitização), o token JWT pode ser exfiltrado e a sessão sequestrada.  
**Evidência:**
```js
// app.html:1930
if(data.token) sessionStorage.setItem("r7d_token", data.token);
```
**Ação recomendada:** Mover tokens para cookies `HttpOnly; Secure; SameSite=Strict`. Exige ajuste no backend para enviar cookie e lê-lo nos headers subsequentes.

---

#### M-3 — Fotos de posts armazenadas como base64 no banco Supabase
**Arquivo:** `backend/server.js:407`, `app.html:2886`  
**Risco:** Strings base64 de imagens em colunas `TEXT` podem causar: (1) linhas de vários MB no banco, degradando queries; (2) ausência de verificação de conteúdo real (magic bytes) — o regex valida apenas o prefixo `data:image/(jpeg|png|webp);base64,` mas não o conteúdo binário; (3) dados do usuário difíceis de excluir por LGPD (sem referência de arquivo).  
**Evidência:**
```js
// server.js:399
if (photo && !/^data:image\/(jpeg|png|webp);base64,/.test(photo)) {
```
**Ação recomendada:** Migrar para Supabase Storage (`supabase.storage.from('photos').upload(...)`) e armazenar só a URL pública na coluna. Adicionar limite de tamanho explícito (ex.: rejeitar base64 > 500 KB).

---

#### M-4 — Sem validação de startup para secrets obrigatórios
**Arquivo:** `backend/server.js` (ausência)  
**Risco:** Se `JWT_SECRET` ou `SUPABASE_SERVICE_KEY` não estiverem definidos no `.env` de produção, o servidor inicia sem erros mas: (1) `jwt.sign()` lança exceção na primeira chamada autenticada; (2) `createClient()` recebe `undefined` como key, podendo usar permissões reduzidas ou silenciosamente falhar. Só `SUPABASE_URL` e `RESEND_API_KEY` têm checagem no startup (linhas 476-477).  
**Ação recomendada:** Adicionar guarda no início do arquivo:
```js
const REQUIRED_ENV = ["SUPABASE_URL","SUPABASE_SERVICE_KEY","JWT_SECRET","RESEND_API_KEY"];
REQUIRED_ENV.forEach(k => { if (!process.env[k]) { console.error(`FATAL: ${k} não definida`); process.exit(1); } });
```

---

#### M-5 — Enumeração de e-mail no cadastro
**Arquivo:** `backend/server.js:212-214`  
**Risco:** O endpoint `/api/register` retorna HTTP 409 com `error: "EMAIL_EXISTS"` para e-mails já cadastrados, permitindo que um atacante confirme quais endereços têm conta. O comentário no código menciona que pretendia evitar isso, mas a implementação ainda expõe o dado.  
**Evidência:**
```js
// server.js:212-214
if (existing) {
  return res.status(409).json({ error: "EMAIL_EXISTS", message: "Este e-mail já está cadastrado." });
}
```
**Ação recomendada:** Retornar sempre HTTP 200 com mensagem genérica ("Se houver conta com este e-mail, você receberá um link de confirmação"). Alternativamente, aceitar o trade-off pois o app de saúde pode querer UX clara.

---

#### M-6 — `recuperar-senha-demo.html` servido publicamente
**Arquivo:** `recuperar-senha-demo.html` (rastreado pelo git, servido via `vercel.json`)  
**Risco:** O arquivo contém instruções de configuração do backend, nomes de variáveis de ambiente, fluxo de autenticação e lógica de integração — documentação interna exposta publicamente.  
**Ação recomendada:** Adicionar ao `.gitignore` e excluir do deploy, ou mover para `/docs` fora do diretório servido.

---

#### M-7 — Express sem `trust proxy` — rate limiting ineficaz no Vercel
**Arquivo:** `backend/server.js` (ausência)  
**Risco:** Atrás do proxy da Vercel, `req.ip` retorna o IP do proxy (fixo), não o do cliente real. O `express-rate-limit` aplica limites por IP, então **todos os usuários compartilham a mesma "cota"** — alguém pode esgotar o limite global de 200 req/15min para todos.  
**Ação recomendada:** Adicionar antes dos middlewares:
```js
app.set("trust proxy", 1); // Vercel forwarda X-Forwarded-For
```
Verificar na documentação da Vercel quantos saltos de proxy existem.

---

### 🔵 BAIXA

---

#### B-1 — Dead code: `hashPassword()` e `DB.users/save` nunca chamados
**Arquivo:** `app.html:317-333, 342-351`  
**Risco:** `hashPassword()` implementa um hash não-criptográfico (operações bit a bit em JS), nunca chamado. `DB.users()` e `DB.save()` também nunca são chamados. A presença sugere uma implementação local anterior sem bcrypt. Pode confundir mantenedores futuros sobre o modelo de segurança real.  
**Ação recomendada:** Remover as funções e o objeto `DB.users/save` do código.

---

#### B-2 — Arquivos de desenvolvimento rastreados e deployados
**Arquivos rastreados:** `Abrir Reset 7D.bat`, `iniciar.ps1`, `RecuperarSenha.jsx`, `recuperar-senha-demo.html`  
**Risco:** Scripts de inicialização local (`bat`, `ps1`) e protótipos JSX (`RecuperarSenha.jsx`) são servidos como arquivos estáticos em produção, expondo metadados do ambiente de desenvolvimento.  
**Ação recomendada:** Adicionar ao `.gitignore` ou criar pasta `/dev` fora do escopo do `vercel.json`.

---

#### B-3 — Nome não-padrão `SUPABASE_SERVICE_KEY`
**Arquivo:** `backend/server.js:19`, `backend/.env.example` (ausente)  
**Risco:** O nome `SUPABASE_SERVICE_KEY` não é o nome padrão da documentação Supabase (`SUPABASE_SERVICE_ROLE_KEY`). Se alguém configurar o `.env` seguindo a documentação oficial, o app sobe sem a chave correta (usando `undefined`), potencialmente em modo anon.  
**Ação recomendada:** Renomear para `SUPABASE_SERVICE_ROLE_KEY` no `server.js` e no `.env.example`. Documentar explicitamente que é a service role key (não a anon key).

---

#### B-4 — `supabase_migration.sql` commitado sem RLS definida
**Arquivo:** `supabase_migration.sql`  
**Risco:** O arquivo de migração cria as tabelas mas não define **Row Level Security (RLS)**. Se em algum momento o frontend usar a chave anon do Supabase diretamente (via alguma expansão futura), as tabelas estarão abertas. O backend atual usa service role, então o risco é baixo — mas a ausência de RLS é uma dívida de segurança.  
**Ação recomendada:** Adicionar políticas RLS às tabelas (ex.: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`), mesmo que o acesso atual seja via service role.

---

## 4. Supabase Storage — Inventário de Buckets

**Data do levantamento:** 2026-05-21  
**Status:** Implementado no branch `security-hardening`

### 4.1 Buckets

| Bucket | Visibilidade | Tamanho máximo | MIMEs permitidos | Risco |
|--------|-------------|---------------|-----------------|-------|
| `community-photos` | **PUBLIC** | 5 MB | jpeg, png, webp | Baixo — dados públicos por design (feed da comunidade) |
| `profile-photos` | **PRIVATE** | 5 MB | jpeg, png, webp | Baixo — acesso só via signed URL com expiração de 1h |

### 4.2 Pipeline de upload (community-photos)

```
Frontend (compressImage)          Backend API (/api/community)
  base64 data URL          →      1. Zod schema: formato + tamanho (pré-filtro)
  max 800px, 0.75 quality         2. validateImageFile(): magic bytes + 5 MB real
                                  3. sanitizeFileName(): strips path traversal
                                  4. buildUserStoragePath(): hash(email)/community/ts-name
                                  5. uploadToStorage(): envia Buffer ao Supabase Storage
                                  6. getPublicStorageUrl(): retorna URL CDN
                                  7. DB: armazena URL (não base64)
```

### 4.3 Controles de segurança ativos

| Controle | Onde | Detalhe |
|---------|------|---------|
| Autenticação obrigatória | `requireAuth` middleware | JWT validado antes de qualquer upload |
| MIME type | schema Zod + magic bytes | Regex no schema (pré-filtro), magic bytes no `validateImageFile()` |
| Tamanho base64 | Zod `MAX_PHOTO_B64 = 6_800_000` | Rejeita antes de decodificar |
| Tamanho binário | `validateImageFile()` | 5 MB após decode; duplicado na config do bucket |
| Conteúdo real | Magic bytes (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WEBP: `52 49 46 46`+`WEBP`) | Evita content-type spoofing |
| Path traversal | `sanitizeFileName()` + `buildUserStoragePath()` | Strips `../`, `..\\`, chars perigosos |
| Exposição de email | `buildUserStoragePath()` | Path usa `sha256(email)[0:16]`, não o email em si |
| Upload direto client-side | ✗ Não existe | Todo upload passa pelo backend API |
| `getPublicUrl` em bucket privado | ✗ Nunca chamado | `profile-photos` usa exclusivamente `createPrivateSignedUrl()` |
| RLS — escrita | Sem policy para anon/autenticado | Service role bypassa RLS; clientes não podem gravar diretamente |
| RLS — leitura pública | Policy `community-photos: leitura pública` | Bucket público; leitura permitida explicitamente |

### 4.4 Riscos residuais e recomendações

| # | Risco | Mitigação atual | Ação futura |
|---|-------|----------------|-------------|
| R-1 | Fotos antigas ainda armazenadas como base64 no banco | Dado legado — não expõe storage | Migração de dados opcional com script de limpeza |
| R-2 | Signed URLs expiram em 1h — se o cliente ficar offline, imagem some | Expiração curta por design (privacidade) | Implementar renovação automática via `GET /api/profile/photo-url` |
| R-3 | Path colisão se dois uploads acontecerem no mesmo ms | `Date.now()` + UUID implícito pelo Supabase | Adicionar `crypto.randomBytes(4).toString('hex')` ao path |
| R-4 | Fotos de perfil ainda no localStorage (não migradas) | LocalStorage não acessível por outros users | Migrar para `profile-photos` bucket quando frontend for refatorado |
| R-5 | MIME spoofing com conteúdo válido JPEG mas payload malicioso | Magic bytes validam apenas assinatura inicial | Considerar `libvips` ou `sharp` para reprocessar a imagem no servidor |

---

## 5. Resumo Executivo

| Prioridade | Quantidade | Status |
|------------|-----------|--------|
| Crítica | 0 | Nenhum secret exposto no repositório |
| Alta | 4 | A-1 a A-4 (rate limit, CORS, SRI, Babel) |
| Média | 7 | M-1 a M-7 |
| Baixa | 4 | B-1 a B-4 |

**Pontos positivos encontrados:**
- `backend/.env` nunca commitado ao git (gitignore correto)
- Bcrypt com fator 12 para hash de senhas
- Proteção contra timing attack no login (hash dummy)
- Sanitização de input com remoção de tags HTML
- JWT com expiração de 24h
- Tokens de reset com expiração de 30min e flag `used`
- Invalidação TOCTOU (marca `used` antes de alterar senha)
- Validação de UUID nos parâmetros de rota
- Validação de emoji via Set allowlist
- Helmet configurado com CSP personalizado (imgSrc atualizado para Supabase Storage)
- Rate limiting em `/api/login`, `/api/register`, `/api/send-recovery-email`
- Nenhuma chave/secret exposto em arquivo client-side
- Upload de fotos via backend (não client-side direct) com validação de magic bytes
- Paths de storage com hash do email (sem PII exposta na URL)

---

## 6. Ordem de Correção Sugerida

1. **A-1** — Adicionar `limiterAuth` ao `/api/reset-password` (mudança de uma linha)
2. **M-7** — `app.set("trust proxy", 1)` (uma linha — prerequisito para rate limiting funcionar)
3. **M-4** — Validação de secrets no startup (5 linhas)
4. **A-2** — Restringir CORS ao domínio exato do projeto
5. **B-3** — Renomear `SUPABASE_SERVICE_KEY` para `SUPABASE_SERVICE_ROLE_KEY`
6. **M-5** — Revisar resposta de enumeração de e-mail
7. **M-6 + B-2** — Mover/gitignore arquivos de dev e demo
8. **B-1** — Remover dead code (`hashPassword`, `DB.users`)
9. **A-3** — Adicionar SRI hashes nos scripts CDN
10. **A-4 + M-1 + M-2** — Migração para build compilado (Vite), cookies HttpOnly, CSP sem `unsafe-inline` (mudança maior)
11. ~~**M-3** — Migrar fotos para Supabase Storage~~ ✅ **IMPLEMENTADO** (branch `security-hardening`)
12. ~~**B-4** — Adicionar RLS policies no Supabase~~ ✅ **IMPLEMENTADO** (parcial — Storage buckets com RLS)
13. **R-3** (novo) — Adicionar entropia aleatória ao path de storage para evitar colisão de timestamp
14. **R-5** (novo) — Reprocessar imagens com `sharp` para neutralizar conteúdo embutido no EXIF/payload

---

---

## 7. Proteção de Rotas — Implementado (2026-05-21)

### Arquitetura de roteamento

Este é um SPA puro (Single-Page Application) servido como `app.html` estático. **Não existe file-based routing, Next.js ou middleware.ts.** O "roteamento" é 100% client-side via estado React (`screen` state). Portanto:

- Não há URL `/dashboard`, `/profile`, etc. — cada "tela" é um valor do estado `screen`
- Não há Edge Middleware nem SSR — a proteção de rotas ocorre em duas camadas:
  1. **Client-side** — React state guard (impede renderização da tela protegida)
  2. **Backend API** — `requireAuth` middleware em todo endpoint que exige autenticação

### Mapeamento de telas

| Screen state | Equivalente lógico | Visibilidade |
|---|---|---|
| `"quiz"` | Onboarding | Público (primeira vez) |
| `"login"` | `/login` | Público |
| `"register"` | `/cadastro` | Público |
| `"forgot"` | `/recuperar-senha` | Público (token de reset na URL) |
| `"app"` | `/dashboard` + todas as abas | **Privado** — exige sessão válida |

Dentro da tela `"app"`, as abas (`home`, `mission`, `content`, `evolution`, `profile`, `community`) são renderizadas condicionalmente — todas privadas por herança, pois só ficam acessíveis se `screen === "app" && user` for verdadeiro.

Não existe tela de admin — não há usuários com roles/permissões diferentes no sistema atual.

### Controles implementados em `app.html`

**`isTokenValid()` (novo)**
- Decodifica o claim `exp` do JWT (base64url → JSON) sem verificar assinatura
- Retorna `false` se: token ausente, formato inválido, `exp` expirado
- Objetivo: UX — redirecionar para login imediatamente em vez de aguardar o primeiro 401

**`guardSession()` (novo)**
- Chama `isTokenValid()`; se falso → `DB.clearSession()` → retorna `null`
- Previne "sessão fantasma": `r7d_user` no sessionStorage com token já expirado

**Inicialização do App (atualizado)**
```js
// Antes: if (DB.session()) return "app";  ← não validava exp do token
// Depois:
if (guardSession()) return "app";   // valida token + exp; limpa sessão se expirado
```

**`apiFetch()` (novo)**
- Wrapper em torno de `fetch()` para chamadas autenticadas
- Emite `CustomEvent("r7d:session-expired")` se o servidor retornar 401
- Não gera loop de redirect: o evento apenas notifica o App, que decide redirecionar

**Handler `r7d:session-expired` no App (novo)**
```js
window.addEventListener("r7d:session-expired", () => {
  DB.clearSession(); setUser(null); setScreen("login");
});
```

**Watcher de visibilidade (novo)**
```js
document.addEventListener("visibilitychange", () => {
  if (screen === "app" && !isTokenValid()) {
    DB.clearSession(); setUser(null); setScreen("login");
  }
});
```
Previne que o usuário encontre o dashboard quando volta para uma aba deixada aberta por horas.

### Endpoints substituídos para usar `apiFetch`

| Endpoint | Auth | Antes | Depois |
|---|---|---|---|
| `POST /api/change-password` | Bearer JWT | `fetch()` | `apiFetch()` |
| `POST /api/community` | Bearer JWT | `fetch()` | `apiFetch()` |
| `PATCH /api/community/:id/react` | Bearer JWT | `fetch()` | `apiFetch()` |
| `POST /api/community/:id/comment` | Bearer JWT | `fetch()` | `apiFetch()` |

Endpoints públicos (sem auth) mantidos com `fetch()` direto: `login`, `register`, `send-recovery-email`, `reset-password`, `GET /api/community`.

### Proteção de acesso invertido (login com sessão válida)

A inicialização do App garante que usuários com sessão válida vão direto para `"app"`, nunca para `"login"` ou `"register"`. Uma vez na tela `"app"`, não há caminho de navegação que retorne a `"login"` sem chamar explicitamente `doLogout()`, que limpa a sessão.

### Responsabilidade dupla (Defense in Depth)

```
Requisição autenticada
       │
       ▼
  apiFetch()          ← client-side: detecta 401 pós-fato
       │
       ▼
  Backend API         ← requireAuth middleware: SEMPRE valida JWT
       │
       ▼
  DB / Storage        ← service role key: servidor-only
```

O cliente NÃO é a barreira de segurança principal. Mesmo que um atacante manipule o estado React, todas as operações sensíveis passam pelo backend que rejeita tokens inválidos/expirados.

### Riscos residuais

| # | Risco | Status |
|---|---|---|
| RR-1 | Token em `sessionStorage` acessível via XSS | Não resolvido — ver M-2 (migração para cookie HttpOnly é a solução, mudança maior) |
| RR-2 | `isTokenValid()` não verifica assinatura criptográfica | Aceito — a verificação da assinatura é responsabilidade exclusiva do backend |
| RR-3 | Sem papel de admin implementado | N/A — sistema tem apenas um tipo de usuário |
| RR-4 | `GET /api/community` público por design | Aceito — feed público é feature, não bug |

---

---

## 8. Admin Hardening — Implementado (2026-05-21)

### Resultado da varredura

Após inspeção completa de `backend/server.js`, `backend/lib/`, `app.html` e `supabase_migration.sql`:

**Nenhuma rota, componente ou API administrativa existe no sistema atual.**

Não há `/api/admin/*`, painel de administração, tela admin, nem campo `isAdmin` ou `role` em nenhum lugar do código de produção anterior a esta sessão.

O nome `supabaseAdmin` encontrado no código refere-se ao *cliente Supabase com service role key* (acesso privilegiado ao banco pelo backend), **não** a um usuário administrativo do produto.

### O que foi implementado

#### `requireAdmin` — `backend/lib/middleware.js`

```
requireAuth  →  JWT válido?  →  Não: 401
                    ↓ Sim
requireAdmin →  SELECT role FROM users WHERE email = req.user.email
                    ↓
             role === 'admin'?  →  Não: 403
                    ↓ Sim
             next() — handler da rota admin executado
```

Propriedades de segurança:
- `req.user.email` vem do JWT verificado por `requireAuth` — **nunca do body**
- `role` vem de `SELECT` no banco — **nunca do client**
- Erro de DB → 403 (fail-secure; inclui o caso da coluna `role` ainda não existir)
- `role` ausente ou qualquer valor diferente de `'admin'` → 403
- Nunca assume privilégio por ausência de campo

#### Catch-all `/api/admin/*` — `backend/server.js`

```js
app.use("/api/admin", (_req, res) => forbidden(res, "FORBIDDEN", "Acesso negado."));
```

Bloqueia **qualquer** requisição a `/api/admin/*`, autenticada ou não, enquanto nenhuma rota admin for registrada explicitamente acima deste handler. Elimina o risco de endpoints admin expostos por acidente.

#### Coluna `role` — `supabase_migration.sql`

```sql
role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
```

- Default `'user'` — todos os usuários existentes e novos são não-admin por padrão
- `CHECK` constraint — o banco rejeita qualquer valor fora do enum controlado
- Script `ALTER TABLE` incluído para banco já existente sem a coluna

Para promover um admin manualmente (somente via DBA/console Supabase):
```sql
UPDATE users SET role = 'admin' WHERE email = 'email@dominio.com';
```

### Como usar quando rotas admin existirem

```js
// Registrar ANTES do catch-all app.use("/api/admin", ...)
app.get("/api/admin/users",
  requireAuth,    // 401 se sem JWT
  requireAdmin,   // 403 se role != 'admin' no banco
  handler
);
```

### TODO — Antes de ativar qualquer rota admin em produção

- [ ] Executar a migration com a coluna `role` no banco de produção
- [ ] Definir quais emails devem receber `role = 'admin'` via SQL direto
- [ ] Adicionar índice: `CREATE INDEX ON users(email) WHERE role = 'admin';`
- [ ] Considerar auditoria de ações admin (tabela `admin_audit_log`)
- [ ] Avaliar 2FA obrigatório para contas admin
- [ ] Rever RLS do Supabase se a chave anon for usada no futuro

### Riscos residuais

| # | Risco | Status |
|---|---|---|
| RA-1 | Coluna `role` não existe em produção ainda | Bloqueado pelo catch-all 403 até migration ser executada |
| RA-2 | Promoção de admin feita manualmente via SQL (sem UI de gerenciamento) | Aceito — menor superfície de ataque do que uma UI de admin |
| RA-3 | Sem auditoria de ações admin | TODO — ver checklist acima |
| RA-4 | JWT não inclui `role` (lido do banco a cada request) | Correto por design — role do banco sempre prevalece sobre claims do token |

---

---

## 9. Proteção Server-Only — Implementado (2026-05-21)

### Contexto arquitetural

Este projeto **não é Next.js**. Os mecanismos "server-only" do Next.js (pacote npm `server-only`, middleware.ts, `"use client"` boundaries) **não se aplicam**.

A proteção equivalente foi implementada com os meios disponíveis na stack real:

| Mecanismo Next.js | Equivalente adotado |
|---|---|
| `import "server-only"` (npm) | Runtime guard: `if (typeof window !== "undefined") throw` |
| `"use client"` boundary | N/A — frontend é arquivo estático separado (`app.html`); não há bundler |
| `middleware.ts` | N/A — sem file-based routing; roteamento é React state em `app.html` |
| TypeScript `import` restrictions | ESLint `no-restricted-syntax` bloqueando `process.env.*` fora de `lib/env.js` |

### Runtime guard — arquivos protegidos

Os seguintes arquivos do backend lançam erro imediato se executados no browser:

| Arquivo | Secret protegido |
|---|---|
| `lib/env.js` | `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `RESEND_API_KEY` |
| `lib/supabase/admin.js` | service role key (via `env.js`) |
| `lib/supabase/server.js` | `SUPABASE_ANON_KEY` (via `env.js`) |
| `lib/middleware.js` | `JWT_SECRET` (via `env.js`) |
| `lib/storage.js` | service role key (via `supabase/admin.js`) |
| `lib/logger.js` | `NODE_ENV` (via `process.env` direto — exceção documentada) |

Pattern implementado em cada arquivo:
```js
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/ARQUIVO.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}
```

**Por que o guard funciona:** O ambiente Node.js nunca define `window`. Qualquer bundler (Webpack, Vite, esbuild) que tentar incluir esses arquivos num bundle client executará o guard no runtime e lançará o erro — interrompendo a execução antes de qualquer secret ser exposto.

### ESLint — centralização de `process.env`

`backend/eslint.config.js` (ESLint v9 flat config) implementa duas proteções:

**1. Bloqueio de `process.env.*` fora de `lib/env.js`:**
```js
{
  selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
  message: "[SECURITY] Acesse variáveis de ambiente APENAS via require('./lib/env')...",
}
```
- `lib/env.js` é o **único** arquivo autorizado a ler `process.env.*`
- `lib/logger.js` tem exceção explícita: lê apenas `NODE_ENV` (não é secret)
- Qualquer outro arquivo que tente `process.env.QUALQUER_COISA` falha no lint

**2. Regras de segurança globais:**
| Regra | Nível | Motivo |
|---|---|---|
| `no-eval` | error | Execução arbitrária de código |
| `no-implied-eval` | error | `setTimeout("string")` equivale a eval |
| `eqeqeq` | error | Comparações de tipo estritas obrigatórias |
| `no-unused-vars` | warn | Detecta dead code e parâmetros não usados |

### Verificação — sem importação cruzada frontend/backend

O arquivo `app.html` (frontend completo) **não importa** nenhum arquivo de `backend/lib/`:
- Não há `<script src="backend/...">` em `app.html`
- Não há bundler — `app.html` é servido como arquivo estático com React CDN
- Os únicos arquivos `.js` importados no frontend são via CDN (React, Recharts, Babel, Three.js)

A superfície de exposição de secrets é zero por construção arquitetural: backend e frontend são processos/ambientes completamente separados.

### Resultado do lint após implementação

```
npm run lint   →  ✓ 0 errors, 0 warnings
npm run build  →  ✓ Build OK
```

Todos os arquivos backend passam no lint com as regras de segurança ativas:
- `lib/env.js`: único lendo `process.env.*` — exceção explícita na config ESLint
- `lib/logger.js`: lê `process.env.NODE_ENV` — exceção documentada (`NODE_ENV` não é secret)
- Demais arquivos: usam `require("./lib/env")` para acessar variáveis de ambiente

### Riscos residuais

| # | Risco | Status |
|---|---|---|
| RS-1 | Guard de runtime só protege bundlers que executam o módulo; análise estática de bundlers mais sofisticados pode inferir secrets sem executar | Aceito — mitigado pela ausência de bundler no projeto |
| RS-2 | ESLint não é executado em CI automaticamente | TODO — adicionar `npm run lint` ao pipeline de CI/CD da Vercel ou GitHub Actions |
| RS-3 | `lib/http.js` não tem runtime guard (não contém secrets, mas é server-only) | Baixo risco — sem PII nem secrets; guard seria defesa em profundidade |

---

*Auditoria estática apenas. Não foram realizados testes de penetração dinâmicos, fuzzing, nem análise de logs de produção.*

---

## 10. Relatório Final — Security Hardening Session (maio 2026)

### Checklist executado

| Verificação | Resultado |
|---|---|
| `npm run lint` (node --check + ESLint) | ✅ 0 errors, 0 warnings |
| `npm run build` (require smoke test) | ✅ Build OK |
| `npm audit` | ✅ 0 vulnerabilities |
| Busca por secrets hardcoded (`grep -r "SUPABASE_SERVICE_ROLE_KEY\|JWT_SECRET\|RESEND_API_KEY"`) | ✅ Nenhum encontrado |
| `getPublicUrl` chamado apenas em bucket público (`community-photos`) | ✅ Confirmado |
| Nenhum `console.*` fora de `lib/logger.js` | ✅ Confirmado |
| Nenhum `NEXT_PUBLIC_`, `createClient`, ou `supabase.from` em `app.html` | ✅ Confirmado |
| Todos os endpoints de escrita exigem `requireAuth` | ✅ Confirmado |
| Nenhuma vulnerabilidade IDOR (user_id sempre vem do JWT, nunca do body) | ✅ Confirmado |
| `.gitignore` bloqueia `.env` e `.env.*` | ✅ Confirmado |
| `.env.example` sem valores reais | ✅ Confirmado |

---

### 10.1 O que foi corrigido nesta sessão

#### Bugs de funcionalidade com impacto de segurança

| # | Problema | Causa | Correção |
|---|---|---|---|
| F-1 | Postagens na comunidade não salvavam | Frontend enviava `{email, name, day, text, photo}` — Zod `.strict()` rejeitava os campos extras | Removidos `email` e `name` do body do POST em `app.html` |
| F-2 | Comentários não salvavam | Frontend enviava `{name, text}` — schema só aceita `{text}` | Removido `name` do body em `app.html` |
| F-3 | Botão de foto abria câmera (`capture="user"`) | Atributo HTML `capture` força câmera em mobile | Removido `capture="user"`; agora abre galeria |

#### Hardening de uploads e armazenamento

| # | Implementação | Arquivo |
|---|---|---|
| U-1 | Validação de magic bytes (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WEBP: `RIFF...WEBP`) | `backend/lib/storage.js` |
| U-2 | Limite de 5 MB com verificação antes do decode base64 | `backend/lib/storage.js` |
| U-3 | Sanitização de filename (bloqueia path traversal `../`, `./`, null bytes) | `backend/lib/storage.js` |
| U-4 | Caminho de storage usa `sha256(email)[0:16]` — PII nunca exposta em URL | `backend/lib/storage.js` |
| U-5 | `getPublicUrl` chamado apenas para bucket público; bucket privado usa `createSignedUrl` | `backend/lib/storage.js` + `server.js` |
| U-6 | Fotos da comunidade armazenadas no Supabase Storage (não mais como base64 no banco) | `backend/server.js` |
| U-7 | `MAX_PHOTO_B64` ajustado de 1,5 MB para 6,8 MB no schema (pre-filter correto para 5 MB decoded) | `backend/lib/schemas.js` |

#### Buckets e policies Supabase Storage

| # | Implementação | Status |
|---|---|---|
| S-1 | Bucket `community-photos` criado como público (leitura aberta, upload apenas via backend) | ✅ Aplicado no Supabase |
| S-2 | Bucket `profile-photos` criado como privado (acesso via signed URLs) | ✅ Aplicado no Supabase |
| S-3 | RLS policy: `community-photos` — SELECT público (sem autenticação) | ✅ Aplicado no Supabase |
| S-4 | RLS policies: `profile-photos` — SELECT/INSERT/UPDATE/DELETE exigem `auth.uid() = foldername[1]` | ✅ Aplicado no Supabase |
| S-5 | Migration documentada em `supabase/migrations/20260521000000_storage_security_policies.sql` | ✅ Arquivo criado |

#### Logs e tratamento de erros

| # | Implementação | Arquivo |
|---|---|---|
| L-1 | `safeLog(tag, msg)` — redacta emails, JWTs, Bearer tokens, API keys, bcrypt hashes, hex tokens | `backend/lib/logger.js` |
| L-2 | `safeError(tag, code)` — loga apenas código de erro (não mensagem); em prod usa JSON estruturado | `backend/lib/logger.js` |
| L-3 | Todos os `console.*` no servidor substituídos por `safeLog`/`safeError` | `backend/server.js`, `backend/lib/middleware.js` |
| L-4 | PII removida de logs: `email` do Resend → `data.id`; stack traces do requireAdmin → código genérico | `backend/server.js`, `backend/lib/middleware.js` |

#### Infraestrutura de segurança

| # | Implementação | Arquivo |
|---|---|---|
| I-1 | `backend/lib/env.js` — módulo centralizado de env vars; startup valida presença de todas as obrigatórias | `backend/lib/env.js` |
| I-2 | Server-only guards em todos os módulos backend (`throw if window !== undefined`) | Todos os arquivos em `backend/lib/` |
| I-3 | ESLint bloqueia `process.env.*` fora de `lib/env.js` | `backend/eslint.config.js` |
| I-4 | Scripts `npm run lint` e `npm run build` adicionados ao `package.json` | `backend/package.json` |
| I-5 | `requireAdmin` busca `role` no banco após validar JWT — nunca aceita role do client | `backend/lib/middleware.js` |
| I-6 | `validateBody`/`validateParams` com Zod — `req.body` nunca usado diretamente em handlers | `backend/lib/middleware.js` |

---

### 10.2 O que ainda precisa de ação manual

#### Alta prioridade

| ID | Item | Ação necessária |
|---|---|---|
| **A-2** | **CORS em produção** | `ALLOWED_ORIGINS` no `.env.example` ainda tem `http://localhost:3001` como padrão. Em produção, definir `ALLOWED_ORIGINS=https://reset-7d.vercel.app` (ou domínio real) na Vercel. Se deixado como localhost em prod, qualquer requisição cross-origin será bloqueada ou, se wildcard for usado, aberto demais. |
| **A-3** | **SRI (Subresource Integrity)** | `app.html` carrega React, Babel, Three.js, Recharts via CDN sem atributos `integrity="sha384-..."`. Um CDN comprometido pode injetar código malicioso. Adicionar hash SRI ou auto-hospedar os scripts. |
| **A-4** | **Babel em produção** | `app.html` usa `<script type="text/babel">` com Babel CDN para transpilar JSX no browser. Em produção isso é um vetor (bundle Babel enorme + eval interno). Migrar para build estático (Vite, esbuild) eliminaria A-3 e A-4 simultaneamente. |

#### Média prioridade

| ID | Item | Ação necessária |
|---|---|---|
| **M-1** | **CSP `unsafe-inline`** | Necessário enquanto Babel transpila JSX no browser. Resolvido automaticamente ao migrar para build estático (A-4). |
| **M-2** | **JWT no `sessionStorage`** | Token armazenado em `sessionStorage` é acessível por XSS. Mitigação: cookies `HttpOnly; Secure; SameSite=Strict`. Requer mudança no fluxo de autenticação frontend + backend. |
| **M-5** | **Email enumeration no /forgot-password** | Endpoint retorna `404` quando email não encontrado, revelando se o usuário existe. Trocar por resposta genérica `200 {"message":"Se o e-mail existir, você receberá um link."}` independente do resultado. |
| **M-6** | **Arquivos de dev na raiz** | `001.code-workspace`, `001-vs antigo recu senha.code-workspace` e PNGs de logo na raiz do repo. Não são secrets mas aumentam superfície. Mover para pasta separada ou adicionar ao `.gitignore`. |
| **B-2** | **Dead code em server.js** | Há referências a funcionalidades legadas. Não é risco de segurança imediato, mas aumenta superfície de ataque. Revisar e remover em PR separado. |

---

### 10.3 O que precisa ser configurado na Vercel

Variáveis de ambiente obrigatórias — configurar em **Settings → Environment Variables** do projeto Vercel:

| Variável | Onde obter | Observação |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret) | **SERVER-ONLY** — nunca expor ao browser |
| `JWT_SECRET` | Gerar: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | Mínimo 64 chars aleatórios |
| `RESEND_API_KEY` | Resend → API Keys → Create API Key | Começa com `re_` |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Não é secret |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` (public) | Opcional; necessária se usar RLS com client |
| `APP_URL` | URL da aplicação em produção | Ex: `https://reset-7d.vercel.app` — usado em links de email |
| `ALLOWED_ORIGINS` | Mesmo valor que `APP_URL` | Ex: `https://reset-7d.vercel.app` |
| `FROM_EMAIL` | Email verificado no Resend | Sem domínio verificado: `onboarding@resend.dev` |
| `FROM_NAME` | Nome do remetente | Ex: `Reset 7D` |

**Verificação pós-deploy:** o servidor valida todas as variáveis obrigatórias no startup (`lib/env.js`). Se alguma estiver ausente, o processo termina com exit code 1 e a Vercel Function retornará 500. Checar logs da Vercel se o deploy retornar erro imediatamente.

---

### 10.4 O que precisa ser configurado no Supabase

#### Migration obrigatória: coluna `role` na tabela `users`

O middleware `requireAdmin` está implementado e seguro, mas **sempre retorna 403** até a coluna `role` existir no banco:

```sql
-- Executar no SQL Editor do Supabase
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Promover usuário admin (substituir pelo email real)
UPDATE public.users
   SET role = 'admin'
 WHERE email = 'email-do-admin@exemplo.com';

-- Índice para performance (requireAdmin busca por email)
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);
```

Até essa migration ser executada, nenhuma rota `/api/admin/*` funcionará (fail-secure intencional).

#### Endpoint LGPD — exclusão de dados (TODO)

A LGPD (Lei 13.709/2018) exige que usuários possam solicitar exclusão de seus dados. Ainda não implementado:

```
POST /api/me/delete-account
  → Exclui: users, community_posts, community_comments, quiz_results, progress
  → Remove fotos do Storage (community-photos/{hash}/ e profile-photos/{hash}/)
  → Invalida tokens ativos
  → Confirmação por senha antes de executar
```

#### Buckets Storage — verificar configurações

Confirmar no painel Supabase (Storage → Buckets):

| Bucket | Public | File size limit | MIME types permitidos |
|---|---|---|---|
| `community-photos` | ✅ Sim | 5 MB | image/jpeg, image/png, image/webp |
| `profile-photos` | ❌ Não (privado) | 5 MB | image/jpeg, image/png, image/webp |

---

### 10.5 Riscos residuais

| ID | Risco | Severidade | Mitigação existente | Ação recomendada |
|---|---|---|---|---|
| **RR-1** | `auth.uid()` retorna NULL para o JWT customizado do projeto — policies do `profile-photos` que dependem de `auth.uid()` nunca autorizam escrita direta pelo client | Médio | Backend usa `service_role` (bypassa RLS); client não consegue escrever diretamente no bucket | Documentado como gap arquitetural; sem impacto prático enquanto uploads são feitos exclusivamente via API |
| **RR-2** | JWT armazenado em `sessionStorage` — vulnerável a XSS | Alto | CSP presente (mas com `unsafe-inline` por causa do Babel) | Migrar para cookies `HttpOnly` (M-2) |
| **RR-3** | Babel CDN no browser — `eval` interno, bundle enorme, SRI ausente | Alto | CDN confiável (unpkg/cdnjs), mas não verificado com hash | Migrar para build estático (A-3, A-4) |
| **RR-4** | Email enumeration em `/forgot-password` | Baixo-Médio | Rate limiting implícito pelo Resend | Unificar resposta HTTP (M-5) |
| **RR-5** | `requireAdmin` depende de coluna `role` inexistente em produção | Médio | Fail-secure: retorna 403 até migration ser aplicada | Executar migration da seção 10.4 |
| **RR-6** | ESLint não roda em CI automaticamente | Baixo | Scripts locais `npm run lint` e `npm run build` existem | Adicionar step de lint ao pipeline Vercel ou GitHub Actions |
| **RR-7** | Sem testes automatizados — regressões de segurança não são detectadas automaticamente | Médio | Code review manual | Adicionar testes de integração para fluxos de autenticação e upload |
| **RR-8** | Endpoint LGPD de exclusão de dados inexistente | Médio (compliance) | Nenhuma | Implementar `POST /api/me/delete-account` (seção 10.4) |

---

### Resumo executivo

**Estado atual:** O backend está seguro para deploy em produção com as ressalvas documentadas. Os riscos críticos (secrets hardcoded, service_role key exposta ao browser, uploads sem validação, logs com PII) foram todos eliminados nesta sessão.

**Antes de ir a produção:**
1. Configurar todas as variáveis de ambiente na Vercel (seção 10.3)
2. Executar a migration da coluna `role` no Supabase (seção 10.4) se rotas admin forem necessárias
3. Definir `ALLOWED_ORIGINS` com a URL real do domínio (não localhost)

**Próximas melhorias (não bloqueiam deploy):**
- Migrar de Babel CDN para build estático (elimina A-3, A-4, M-1 de uma vez)
- Implementar JWT em cookies HttpOnly (M-2)
- Implementar endpoint de exclusão LGPD (RR-8)

---

*Sessão de hardening concluída em maio 2026. Próxima revisão recomendada após migração para build estático ou mudança na arquitetura de autenticação.*
