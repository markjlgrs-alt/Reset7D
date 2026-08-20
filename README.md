# RESET 7D — Projeto único (App + Backend + Funil de Vendas)

## Estrutura do projeto

```
Reset 7D/
├── app.html                    ← APP PRINCIPAL (React single-file, tudo dentro)
├── backend/                    ← API real (Express + Supabase): login, registro,
│                                  recuperação de senha, comunidade, cupons
├── funil-de-vendas/
│   ├── landing-page/           ← landing page (deploy Vercel próprio)
│   └── quiz/                   ← reservado para o quiz do funil (a anexar)
├── _arquivo/                   ← versões antigas, duplicados e material solto
├── README.md                   ← este arquivo
├── CHANGELOG.md                ← histórico de versões do app.html
├── ESTRUTURA_DO_CODIGO.md      ← mapa interno do app.html
└── vercel.json / package.json  ← config de deploy
```

## Stack

- **React 18** via CDN (sem build step)
- **Babel** standalone (transpila JSX no browser)
- **Recharts** via CDN (gráficos de evolução)
- **CSS** inline + `<style>` injetado dinamicamente por tema
- **Backend**: Node/Express (`backend/server.js`) + Supabase, JWT, e-mail (Resend/SendGrid)

## Como editar no Claude Code

1. Abra a pasta `Reset 7D/` no Claude Code
2. O arquivo de trabalho do app é **`app.html`** — toda a lógica de tela está nele
3. O código React fica dentro de `<script type="text/babel">...</script>`
4. A API real fica em `backend/server.js` — rode `iniciar.ps1` para subir o backend local em `http://localhost:3001`
5. Para validar a sintaxe do `app.html` sem o Claude Code, rode no terminal:
   ```bash
   npx @babel/core --presets @babel/preset-react,@babel/preset-env app.html
   ```

## Arquitetura do código

O arquivo está organizado em seções separadas por comentários `// ──`:

| Seção | O que faz |
|-------|-----------|
| `THEMES` | Paletas dark/light com todas as cores |
| `makeCSS(th)` | CSS dinâmico gerado pelo tema |
| `STRINGS` | Todas as traduções PT/EN/ES |
| `PC` | Dados de protocolo (7 dias, receitas, vídeos, ciência) |
| `DB` | Camada de persistência (localStorage) |
| `CL_THEMES` / `CL_PC` | Calça Larga 21D (produto secundário) |
| `Componentes` | Av, Spinner, XPBadge, AnimNum, etc |
| `*Tab` | Cada aba: HomeTab, MissionTab, ContentTab... |
| `Dashboard` | Container principal com header e tab bar |
| `App` | Root: autenticação, roteamento de tela |

## Temas

- **Dark** (padrão): fundo escuro + orbes animados
- **Light**: paleta `#60293C #8A4468 #F2F2F2 #898589 #B9788C`

## Idiomas suportados

🇧🇷 Português · 🇺🇸 English · 🇪🇸 Español

## Produtos no app

- **RESET 7D** — 7 dias de protocolo de saúde feminina
- **Calça Larga 21D** — protocolo complementar (tema verde-sálvia)

## Backend (real, já conectado)

O `app.html` já chama o backend real em `backend/server.js` via `window.BACKEND_URL`
(aponta para `localhost:3001` em dev, e para o próprio domínio em produção).
Progresso de missão/XP/fotos continua em `localStorage`, mas login, registro,
recuperação de senha, troca de senha, comunidade e validação de acesso passam pela API.

Endpoints em uso:
- `GET /api/health`
- `POST /api/register` — cadastro
- `POST /api/login` — autenticação
- `POST /api/change-password`
- `POST /api/send-recovery-email` — recuperação de senha
- `POST /api/reset-password`
- `GET /api/my-access` — verifica acesso liberado
- `GET /api/community` — lista de posts
- `POST /api/community` — criar post
- `PATCH /api/community/:id/react` — reagir
- `POST /api/community/:id/comment` — comentar

Endpoint existente no backend mas ainda não chamado pelo front (`app.html`):
- `POST /api/validate-coupon`
