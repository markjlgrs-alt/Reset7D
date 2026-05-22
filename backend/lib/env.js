"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo carrega SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET e RESEND_API_KEY.
// Se executado no navegador, vaza todas as chaves privadas do sistema.
// O guard abaixo detecta contexto de browser e lança imediatamente.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/env.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

// Módulo centralizado de variáveis de ambiente — Reset 7D Backend
//
// Regras de segurança:
//  - Variáveis server-only NUNCA são enviadas ao browser.
//  - process.env só é lido neste arquivo (ESLint proíbe no restante).
//  - Se alguma variável obrigatória estiver ausente o processo
//    termina com exit code 1 antes de qualquer rota ser registrada.
//
// Compatibilidade temporária (remover após Etapa D do VERCEL_ENV_MIGRATION.md):
//  - Cada variável aceita nome novo PRIMEIRO; fallback para nome antigo da Vercel.
//  - Exemplo: SUPABASE_SERVICE_ROLE_KEY → fallback SUPABASE_SERVICE_KEY.

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// ── Função de compatibilidade ─────────────────────────────────────
// Tenta newName; se ausente ou vazio, tenta oldName.
// Remover esta função e os fallbacks após confirmar que os nomes novos
// estão configurados na Vercel e o app funciona em Preview + Production.
function envFallback(newName, oldName) {
  const v = process.env[newName];
  if (v && v.trim() !== "") return v.trim();
  if (!oldName) return undefined;
  const w = process.env[oldName];
  return (w && w.trim() !== "") ? w.trim() : undefined;
}

// ── Pares (nome_novo, fallback_nome_antigo) ───────────────────────
// SERVER-ONLY: jamais expor ao browser ou em respostas HTTP.
const SERVER_ONLY_PAIRS = [
  // novo                      → antigo (Vercel atual)
  ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"],   // acesso total ao banco
  ["JWT_SECRET",                 null],                     // assina tokens de sessão
  ["RESEND_API_KEY",             null],                     // envio de e-mail
];

// PÚBLICAS: seguras para logs; não são secrets.
const PUBLIC_PAIRS = [
  ["SUPABASE_URL", "URL_SUPABASE"],  // URL pública do projeto Supabase
];

// ── Verificação de inicialização ──────────────────────────────────
const missing = [
  ...SERVER_ONLY_PAIRS
    .filter(([n, o]) => !envFallback(n, o))
    .map(([n, o])    => o ? `${n}  (ou fallback: ${o})` : n),
  ...PUBLIC_PAIRS
    .filter(([n, o]) => !envFallback(n, o))
    .map(([n, o])    => o ? `${n}  (ou fallback: ${o})` : n),
];

if (missing.length > 0) {
  process.stderr.write(
    [
      "",
      "[env] FATAL — Variáveis de ambiente obrigatórias não definidas:",
      missing.map((k) => `  • ${k}`).join("\n"),
      "  → Copie backend/.env.example para backend/.env e preencha os valores.",
      "  → Em produção, configure as variáveis no painel da Vercel.",
      "  → Ver: VERCEL_ENV_MIGRATION.md para nomes corretos.",
      "",
    ].join("\n")
  );
  process.exit(1);
}

// ── Exports ───────────────────────────────────────────────────────

// Variáveis SERVER-ONLY.
// Use apenas em código de servidor (routes, middlewares, helpers de backend).
// Nunca inclua em resposta JSON enviada ao browser.
const serverEnv = Object.freeze({
  // Supabase — acesso privilegiado (bypassa RLS — não expor ao browser)
  supabaseServiceRoleKey: envFallback("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"),

  // Autenticação JWT — nunca expor
  jwtSecret: process.env.JWT_SECRET,

  // Resend — envio de e-mail
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail:    process.env.FROM_EMAIL || "onboarding@resend.dev",
  fromName:     process.env.FROM_NAME  || "Reset 7D",

  // Configuração de servidor
  // APP_URL → fallback URL_DO_APLICATIVO (nome antigo na Vercel)
  appUrl:         envFallback("APP_URL", "URL_DO_APLICATIVO")          || "http://localhost:3001",
  // ALLOWED_ORIGINS → fallback ORIGENS_PERMITIDAS (nome antigo na Vercel)
  allowedOrigins: envFallback("ALLOWED_ORIGINS", "ORIGENS_PERMITIDAS") || "http://localhost:3001",
  port:           Number(process.env.PORT) || 3001,
});

// Variáveis PÚBLICAS.
// Não contêm secrets. Podem aparecer em logs e mensagens de diagnóstico.
// Este projeto é Express.js puro (não Next.js): não há prefixo NEXT_PUBLIC_.
// Se migrar para Next.js no futuro, SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL.
const publicEnv = Object.freeze({
  // SUPABASE_URL → fallback URL_SUPABASE (nome antigo na Vercel)
  supabaseUrl:     envFallback("SUPABASE_URL", "URL_SUPABASE"),
  // SUPABASE_ANON_KEY — opcional; só necessária se usar RLS por usuário
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
});

module.exports = { serverEnv, publicEnv };
