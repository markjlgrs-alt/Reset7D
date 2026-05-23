# AUTH_SECURITY_CHECKLIST.md — Verificações manuais no painel Supabase

> Data: 2026-05-22 | Branch: `security-hardening`
>
> **Contexto:** O app usa JWT customizado — NÃO usa Supabase Auth para login/sessão de usuários.
> Por isso, as configurações de Auth do Supabase afetam principalmente o painel de controle
> e eventuais integrações futuras — não o fluxo de login atual dos usuários do app.

---

## Como acessar as configurações de Auth

1. Abrir [supabase.com](https://supabase.com) → seu projeto
2. Menu lateral → **Authentication**

---

## Checklist — Configurações de Auth

### A — Site URL e Redirect URLs

**Onde:** Authentication → **URL Configuration**

- [ ] **Site URL:** Definir como a URL de produção do app.
  - Exemplo: `https://reset7d.vercel.app`
  - **Por que:** Supabase usa esta URL como base para links de confirmação de e-mail e magic links. Mesmo não usando Supabase Auth hoje, manter configurado evita que um atacante aproveite a URL padrão.

- [ ] **Redirect URLs:** Adicionar apenas as URLs que o app usa como destino pós-auth.
  - Exemplo: `https://reset7d.vercel.app/**`
  - Não adicionar `*` ou origens de terceiros.
  - **Por que:** Previne redirecionamento aberto (open redirect) em flows futuros.

---

### B — Email Confirmation

**Onde:** Authentication → **Providers** → **Email**

- [ ] **Email Confirm:** Estado atual: provavelmente **desabilitado** (app usa JWT próprio, não Supabase Auth).
  - **Decisão de produto necessária:** Se usuários fizerem login via Supabase Auth no futuro, ativar confirmação de e-mail é recomendado para prevenir cadastros com e-mails falsos.
  - **NÃO ativar agora** sem revisar o fluxo de cadastro — quebraria o cadastro atual se não integrado corretamente.

- [ ] **Double Confirm Email Changes:** Deixar habilitado se estiver disponível.
  - Envia confirmação para o e-mail antigo E o novo antes de trocar.

---

### C — MFA (Multi-Factor Authentication)

**Onde:** Authentication → **Multi-Factor Authentication**

- [ ] **MFA da conta Supabase (sua conta de admin):**
  - ✅ **Ativar MFA na sua conta** em [app.supabase.com](https://app.supabase.com) → Account Settings → Security.
  - Protege o acesso ao painel do Supabase (banco, Storage, configurações).

- [ ] **MFA para usuários do app:**
  - ⚠️ **NÃO ativar MFA obrigatório para usuários comuns** sem decisão de produto.
  - O app usa JWT customizado — MFA Supabase não se aplica ao fluxo atual de usuários.
  - Se MFA for implementado no futuro, deve ser feito via TOTP customizado no backend, não via Supabase Auth.

---

### D — SMTP e E-mails de Auth

**Onde:** Authentication → **Email Templates** e **SMTP Settings**

- [ ] **SMTP customizado:** Se o Supabase enviar e-mails (confirmação, magic link), configurar SMTP próprio em vez do relay padrão do Supabase.
  - O app usa Resend para e-mails de recuperação de senha (via backend próprio).
  - E-mails de Auth do Supabase (se habilitados) são separados — podem usar outro SMTP.

- [ ] **Templates de e-mail:** Se Email Confirmation for ativado no futuro, personalizar os templates com a identidade visual do Reset 7D.

---

### E — Rate Limits

**Onde:** Authentication → **Rate Limits** (se disponível no seu plano)

- [ ] Verificar se o Supabase tem rate limits de Auth configurados.
  - O app já implementa rate limiting próprio no backend (Express `express-rate-limit`).
  - Limits do Supabase são uma camada adicional de proteção.

---

### F — Providers habilitados

**Onde:** Authentication → **Providers**

- [ ] Verificar quais providers OAuth estão habilitados (Google, GitHub, etc.).
  - Se o app não usa OAuth via Supabase, **desabilitar todos os providers OAuth não utilizados**.
  - Providers habilitados sem uso aumentam a superfície de ataque desnecessariamente.

- [ ] Confirmar que apenas **Email** está habilitado (e Phone se usado).

---

### G — Security Advisor

**Onde:** Project Settings → **Advisors** → **Security Advisor** (ou similar — varia por versão)

Ou via SQL Editor:

```sql
-- Verificar configurações de segurança recomendadas pelo Supabase
SELECT *
FROM pg_extension
WHERE extname IN ('pgcrypto', 'uuid-ossp');
-- Confirmar que extensões de criptografia estão ativas

-- Verificar se RLS está ativo nas tabelas (pós-migration)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Todas as tabelas devem ter rowsecurity = true
```

- [ ] Executar o Security Advisor do Supabase (se disponível) e verificar recomendações.
- [ ] Resolver alertas de prioridade Alta antes de qualquer novo deploy.

---

### H — Service Role Key

- [ ] Confirmar que a `service_role` key **não está** exposta em:
  - Variáveis de ambiente do frontend (Vercel)
  - Logs públicos
  - Código commitado no repositório
- [ ] Verificar no painel Supabase → Project Settings → API se a chave mostrada como `service_role` corresponde ao valor configurado na Vercel como `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Nunca compartilhar** a service_role key em tickets de suporte, screenshots ou mensagens.

---

### I — Anon Key

- [ ] Verificar se a `anon` key está exposta desnecessariamente.
  - A anon key do Supabase é considerada "pública" por design — pode aparecer em código frontend.
  - **Neste projeto**, a anon key não é usada no browser (não há Supabase client no browser).
  - Se a anon key vazar, as RLS policies recém-criadas bloqueiam o acesso a todas as tabelas.

---

### J — Database Password

- [ ] Database Password está definida e forte?
  - Supabase Dashboard → Project Settings → Database → Database password.
- [ ] Nenhuma senha padrão ou fácil.
- [ ] Se usar conexão direta ao banco (ex: Prisma, Drizzle), garantir que a senha está apenas na variável `DATABASE_URL` (server-only).

---

## Verificações de conformidade pós-migration

Executar no SQL Editor após aplicar as migrations:

```sql
-- 1. Confirmar RLS ativo em todas as tabelas públicas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Confirmar que não há policies perigosas (USING (true)) em tabelas privadas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
ORDER BY tablename, policyname;
-- Resultado esperado: 0 linhas (nenhuma policy com USING (true) nas tabelas privadas)

-- 3. Confirmar policies de Storage
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 4. Verificar se há usuários com role='admin' (deve ter pelo menos 1 ou nenhum)
-- NÃO execute em produção se não quiser revelar o número de admins
-- Execute apenas localmente ou em ambiente controlado
-- SELECT COUNT(*) FROM public.users WHERE role = 'admin';
```

---

## Ações que requerem decisão de produto

| Ação | Impacto | Status |
|---|---|---|
| Ativar Email Confirmation | Quebraria cadastro atual se não integrado | Decisão pendente |
| MFA para usuários comuns | Mudança de UX significativa | Não fazer por ora |
| Migrar para Supabase Auth | Ativa `auth.uid()` — habilita policies owner-based | Roadmap futuro |
| Provider OAuth (Google, GitHub) | Novo fluxo de login | Decisão de produto |

---

## Resumo rápido

| Item | Status |
|---|---|
| MFA da conta Supabase (admin) | ✅ Fazer agora |
| Site URL configurada | ✅ Fazer agora |
| Providers OAuth desnecessários desabilitados | ✅ Verificar e desabilitar |
| Service role key exclusivamente server-side | ✅ Confirmado no código |
| RLS ativo em todas as tabelas | ✅ Migration criada |
| Email Confirmation | ⏳ Decisão de produto |
| MFA obrigatório para usuários | ❌ Não implementar sem decisão |
