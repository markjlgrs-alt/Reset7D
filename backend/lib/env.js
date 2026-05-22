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

/**
 * Módulo centralizado de variáveis de ambiente — Reset 7D Backend
 *
 * Regras de segurança:
 *  - Variáveis server-only NUNCA são enviadas ao browser.
 *  - O app acessa env apenas por este módulo; process.env não é
 *    acessado diretamente no restante do código.
 *  - Se alguma variável obrigatória estiver ausente o processo
 *    termina com exit code 1 antes de qualquer rota ser registrada.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// ── Variáveis SERVER-ONLY ─────────────────────────────────────────
// Nunca exponha estes valores em respostas HTTP, logs públicos
// ou arquivos client-side.
const SERVER_ONLY_REQUIRED = [
  "SUPABASE_SERVICE_ROLE_KEY", // Supabase service role — acesso total ao banco
  "JWT_SECRET",                // Assina e verifica tokens de sessão
  "RESEND_API_KEY",            // Chave de envio de e-mail (Resend)
];

// ── Variáveis PÚBLICAS ────────────────────────────────────────────
// Seguras para uso em logs e mensagens de diagnóstico (não são secrets).
// Em um projeto Next.js equivaleriam a NEXT_PUBLIC_SUPABASE_URL.
const PUBLIC_REQUIRED = [
  "SUPABASE_URL", // URL base do projeto Supabase (não é secret)
];

// ── Verificação de inicialização ──────────────────────────────────
const missing = [...SERVER_ONLY_REQUIRED, ...PUBLIC_REQUIRED].filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);

if (missing.length > 0) {
  process.stderr.write(
    [
      "",
      "[env] FATAL — Variáveis de ambiente obrigatórias não definidas:",
      missing.map((k) => `  • ${k}`).join("\n"),
      "  → Copie backend/.env.example para backend/.env e preencha os valores.",
      "",
    ].join("\n")
  );
  process.exit(1);
}

// ── Exports ───────────────────────────────────────────────────────

/**
 * Variáveis SERVER-ONLY.
 * Acesse apenas em código de servidor (routes, middlewares, helpers).
 * Nunca inclua em resposta JSON enviada ao browser.
 */
const serverEnv = Object.freeze({
  // Supabase — acesso privilegiado (service role)
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Autenticação JWT
  jwtSecret: process.env.JWT_SECRET,

  // Serviço de e-mail
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail:    process.env.FROM_EMAIL  || "onboarding@resend.dev",
  fromName:     process.env.FROM_NAME   || "Reset 7D",

  // Configuração de servidor
  appUrl:         process.env.APP_URL           || "http://localhost:3001",
  allowedOrigins: process.env.ALLOWED_ORIGINS   || "http://localhost:3001",
  port:           Number(process.env.PORT)       || 3001,
});

/**
 * Variáveis PÚBLICAS.
 * Não contêm secrets — equivalem a NEXT_PUBLIC_* em Next.js.
 * Podem aparecer em logs e mensagens de diagnóstico.
 */
const publicEnv = Object.freeze({
  supabaseUrl:     process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null, // opcional — usado por supabase/server.js com RLS
});

module.exports = { serverEnv, publicEnv };
