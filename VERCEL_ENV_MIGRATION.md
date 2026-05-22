# VERCEL_ENV_MIGRATION.md — Migração Segura de Variáveis de Ambiente

> Branch: `security-hardening` | Data: 2026-05-22
>
> **Objetivo:** Renomear as variáveis da Vercel para os nomes padrão sem quebrar produção.
>
> **Princípio:** Adicionar primeiro, remover por último. O código aceita
> nome novo (preferido) e nome antigo (fallback) simultaneamente.
> Nada é removido antes de produção estar confirmada como funcionando.

---

## Mapeamento rápido (antigo → novo)

| Variável antiga (Vercel hoje) | Variável nova (adicionar) | Obrigatória? |
|---|---|---|
| `URL_SUPABASE` | `SUPABASE_URL` | ✅ Sim |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | ✅ Sim |
| `ORIGENS_PERMITIDAS` | `ALLOWED_ORIGINS` | Não (tem fallback) |
| `URL_DO_APLICATIVO` | `APP_URL` | Não (tem fallback) |
| `RESEND_API_KEY` | — (sem mudança) | ✅ Sim |
| `JWT_SECRET` | — (sem mudança) | ✅ Sim |
| `FROM_EMAIL` | — (sem mudança) | Não |
| `FROM_NAME` | — (sem mudança) | Não |

---

## Variáveis que NUNCA podem ser NEXT_PUBLIC_

> Este projeto é Express.js puro, não Next.js. O prefixo `NEXT_PUBLIC_`
> não tem efeito aqui. **Mesmo que migrasse para Next.js**, as variáveis
> abaixo **jamais** poderiam ter esse prefixo:

- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL` / `FROM_NAME`
- `ALLOWED_ORIGINS` / `ORIGENS_PERMITIDAS`
- `APP_URL` / `URL_DO_APLICATIVO`

---

## Etapa A — Antes do deploy (faça isso agora)

### A.1 — Acesse o painel da Vercel

1. Abra [vercel.com](https://vercel.com) → seu projeto `reset-7d` (ou nome equivalente)
2. Vá em **Settings → Environment Variables**

### A.2 — Adicione as variáveis novas

> Adicione cada variável abaixo **sem remover as antigas**.
> Marque **Production** e **Preview** em cada uma.

#### A.2.1 — `SUPABASE_URL` (obrigatória)
- **Nome:** `SUPABASE_URL`
- **Valor:** mesmo valor de `URL_SUPABASE` (URL pública do seu projeto Supabase)
  - Painel Supabase → Project Settings → API → **Project URL**
  - Formato: `https://xxxxxxxxxxx.supabase.co`
- **Ambientes:** ☑ Production ☑ Preview
- ⚠️ **Não remover `URL_SUPABASE` ainda**

#### A.2.2 — `SUPABASE_SERVICE_ROLE_KEY` (obrigatória, privada)
- **Nome:** `SUPABASE_SERVICE_ROLE_KEY`
- **Valor:** mesmo valor de `SUPABASE_SERVICE_KEY`
  - Painel Supabase → Project Settings → API → **service_role** (secret)
  - Começa com `eyJ...` ou `sbp_...`
- **Ambientes:** ☑ Production ☑ Preview
- 🔴 **NUNCA marcar como "sensitive" e então copiar para frontend**
- ⚠️ **Não remover `SUPABASE_SERVICE_KEY` ainda**

#### A.2.3 — `ALLOWED_ORIGINS` (recomendada)
- **Nome:** `ALLOWED_ORIGINS`
- **Valor:** URL do seu frontend em produção
  - Exemplo: `https://reset7d.vercel.app` ou seu domínio customizado
  - Para múltiplas origens, separe por vírgula: `https://reset7d.vercel.app,https://www.reset7d.com`
- **Ambientes:** ☑ Production ☑ Preview
  - Em Preview, pode usar a URL de preview do Vercel
- ⚠️ **Não remover `ORIGENS_PERMITIDAS` ainda**

#### A.2.4 — `APP_URL` (recomendada)
- **Nome:** `APP_URL`
- **Valor:** URL base do app (usada no link de e-mail de recuperação de senha)
  - Exemplo: `https://reset7d.vercel.app`
  - Deve ser a URL que o **usuário** acessa (sem `/api`)
- **Ambientes:** ☑ Production ☑ Preview
- ⚠️ **Não remover `URL_DO_APLICATIVO` ainda**

### A.3 — Confirme o estado final antes do deploy

No painel **Settings → Environment Variables**, você deve ter:

```
FROM_EMAIL              ← existia; manter
FROM_NAME               ← existia; manter
RESEND_API_KEY          ← existia; manter
JWT_SECRET              ← existia; manter
URL_SUPABASE            ← existia; manter (fallback)
SUPABASE_SERVICE_KEY    ← existia; manter (fallback)
ORIGENS_PERMITIDAS      ← existia; manter (fallback)
URL_DO_APLICATIVO       ← existia; manter (fallback)
SUPABASE_URL            ← NOVA ← adicionar agora
SUPABASE_SERVICE_ROLE_KEY ← NOVA ← adicionar agora
ALLOWED_ORIGINS         ← NOVA ← adicionar agora
APP_URL                 ← NOVA ← adicionar agora
```

Total esperado: **12 variáveis** (8 antigas + 4 novas).

---

## Etapa B — Deploy Preview

### B.1 — Fazer o deploy de Preview

No terminal (não use `--prod`):

```bash
vercel
```

Ou via GitHub: crie/atualize um Pull Request e aguarde o deploy automático.
Anote a URL de Preview gerada (ex.: `https://reset-7d-abc123.vercel.app`).

### B.2 — Checklist de testes no Preview

Execute cada item na URL de Preview. Marque `✅` quando passar.

#### Testes de autenticação
- [ ] Acessar a URL de Preview — app carrega sem tela branca
- [ ] Fazer **login** com usuário existente → dashboard aparece
- [ ] Fazer **cadastro** de novo usuário → confirmação sem erro
- [ ] Fazer **logout** → volta para tela de login
- [ ] Tentar login com senha errada → mensagem de erro (não 500)

#### Testes de recuperação de senha
- [ ] Clicar "Esqueci minha senha" → inserir e-mail → sucesso
- [ ] Receber e-mail de recuperação → link aponta para a URL do Preview (não `localhost:3001`)
- [ ] Clicar no link → tela de redefinição de senha aparece
- [ ] Redefinir senha → login com nova senha funciona

#### Testes de funcionalidade principal
- [ ] Dashboard carrega sem erro de CORS
- [ ] Dados do usuário aparecem corretamente
- [ ] Feed da comunidade carrega (se existir)
- [ ] Postar na comunidade funciona (se existir)
- [ ] Upload de foto funciona (se existir)

#### Testes de Supabase
- [ ] Abrir DevTools → Network → nenhuma chamada direta a `supabase.co` partindo do browser
- [ ] Todas as chamadas vão para `/api/*` (backend Express)
- [ ] Nenhum erro 500 relacionado a Supabase no console do browser

#### Verificação de segurança (DevTools → Network)
- [ ] Nenhuma resposta JSON contém `service_role`, `JWT_SECRET` ou `RESEND_API_KEY`
- [ ] Nenhum header de resposta vaza variáveis de ambiente

### B.3 — O que fazer se o Preview quebrar

| Sintoma | Causa provável | Ação |
|---|---|---|
| App não abre (tela branca) | `SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` ainda com nome errado | Verificar se ambas as novas vars estão em Production **e** Preview |
| Erro de CORS | `ALLOWED_ORIGINS` não inclui a URL do Preview | Adicionar URL de Preview em `ALLOWED_ORIGINS` (separada por vírgula) |
| Link de e-mail aponta para `localhost` | `APP_URL` não definida ou com nome errado | Verificar se `APP_URL` está adicionada e com a URL correta |
| Erro 401 em todas as rotas autenticadas | `JWT_SECRET` ausente ou com valor diferente do que gerou os tokens existentes | Verificar `JWT_SECRET` — **não alterar o valor**, apenas confirmar que está presente |
| Erro de Supabase | `SUPABASE_SERVICE_ROLE_KEY` com valor errado | Copiar valor exatamente de `SUPABASE_SERVICE_KEY` existente |

**Se nada funcionar:** Remova as variáveis novas da Vercel e faça Redeploy.
O código voltará a usar os nomes antigos como fallback — produção não é afetada.

---

## Etapa C — Deploy Production

> Só execute esta etapa após **todos os itens da Etapa B** estarem marcados.

### C.1 — Deploy para Production

```bash
vercel --prod
```

Ou via GitHub: faça merge do PR para `main`.

### C.2 — Checklist de testes em Production

Repita os mesmos testes da Etapa B na URL de produção real.

- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] E-mail de recuperação chega com link correto (não `localhost`)
- [ ] Dashboard carrega sem erro de CORS
- [ ] Nenhum erro 500 no console

---

## Etapa D — Limpeza (só após C concluída)

> **Espere pelo menos 24h após o deploy de produção** antes de remover as variáveis antigas.
> Isso garante que nenhum processo em andamento dependa dos nomes antigos.

### D.1 — Remover variáveis antigas da Vercel

No painel **Settings → Environment Variables**, remova (em ordem segura):

1. `URL_SUPABASE` — substituída por `SUPABASE_URL`
2. `SUPABASE_SERVICE_KEY` — substituída por `SUPABASE_SERVICE_ROLE_KEY`
3. `ORIGENS_PERMITIDAS` — substituída por `ALLOWED_ORIGINS`
4. `URL_DO_APLICATIVO` — substituída por `APP_URL`

Após remover cada uma, confirme que o app ainda responde (aguarde 30s e recarregue).

### D.2 — Abrir PR de limpeza de código

Após remover as variáveis antigas da Vercel, abra um segundo PR para limpar o código:

1. Em `backend/lib/env.js`, remova a função `envFallback` e os fallbacks dos pares:
   - `envFallback("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")` → `process.env.SUPABASE_SERVICE_ROLE_KEY`
   - `envFallback("SUPABASE_URL", "URL_SUPABASE")` → `process.env.SUPABASE_URL`
   - `envFallback("APP_URL", "URL_DO_APLICATIVO")` → `process.env.APP_URL`
   - `envFallback("ALLOWED_ORIGINS", "ORIGENS_PERMITIDAS")` → `process.env.ALLOWED_ORIGINS`
2. Simplificar `SERVER_ONLY_PAIRS` e `PUBLIC_PAIRS` de volta para arrays simples de strings.
3. Atualizar `backend/.env.example` removendo referências aos nomes antigos.
4. Fazer deploy e testar.

**Mensagem de commit sugerida:**
```
chore: remove env fallback shims after Vercel migration (Etapa D)
```

---

## Como validar que a service key não foi exposta

Execute estes comandos antes de qualquer commit ou deploy:

```bash
# 1. Confirmar que backend/.env não está rastreado pelo git
git ls-files backend/.env
# → (saída vazia = correto)

# 2. Confirmar que .env está no .gitignore
git check-ignore -v backend/.env
# → backend/.gitignore:5:.env	backend/.env  (correto)

# 3. Buscar por qualquer valor de secret no código (não no .env)
# Substitua <prefixo> pelos primeiros 6 caracteres de cada key antes de rodar
grep -r "eyJ\|sbp_\|re_\|sb_secret" --include="*.js" --include="*.ts" \
  --include="*.json" --include="*.html" --exclude-dir=node_modules .
# → (saída vazia = correto)

# 4. Confirmar que nenhum arquivo staged contém o valor real
git diff --cached | grep -i "service_role\|jwt_secret\|resend_api"
# → (saída vazia ou apenas .env.example com valores vazios = correto)
```

---

## Variáveis que NÃO devem existir na Vercel (nunca criar)

| Nome proibido | Motivo |
|---|---|
| `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` | Expõe service key ao browser |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Idem |
| `NEXT_PUBLIC_RESEND_API_KEY` | Expõe chave de e-mail ao browser |
| `NEXT_PUBLIC_JWT_SECRET` | Expõe secret de JWT ao browser |
| `NEXT_PUBLIC_DATABASE_URL` | Expõe conexão ao banco ao browser |
| `NEXT_PUBLIC_DIRECT_URL` | Idem |
| `NEXT_PUBLIC_STRIPE_SECRET_KEY` | Expõe chave de pagamento ao browser |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Expõe chave de IA ao browser |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | Idem |

> Lembre: neste projeto Express.js, `NEXT_PUBLIC_*` não tem efeito técnico.
> Esta lista é relevante caso o projeto migre para Next.js no futuro.
