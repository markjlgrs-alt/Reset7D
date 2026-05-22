"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo lê process.env.NODE_ENV e usa process.stdout/stderr.
// process não existe no browser; incluir este módulo num bundle client causaria erro.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/logger.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

/**
 * Logger seguro — Reset 7D Backend
 *
 * Regras:
 *  - Nunca logar: emails, tokens JWT, passwords, hashes, chaves de API,
 *    respostas brutas do banco, headers de autenticação, stack traces.
 *  - Em produção: saída JSON estruturada mínima (tag + code).
 *  - Em desenvolvimento: mais detalhes, mas secrets ainda redacted.
 *  - safeError recebe apenas o error.code (não error.message) de erros
 *    externos (Supabase, Resend) para evitar vazar schema ou configuração.
 *  - devDetail só aparece quando NODE_ENV !== 'production', e ainda
 *    passa pelos filtros de redação.
 */

const IS_PROD = process.env.NODE_ENV === "production";

// ── Padrões de redação ────────────────────────────────────────
// Cada pattern substitui dados sensíveis antes de qualquer escrita em log.
const REDACT = [
  // Emails
  { re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  sub: "[email]"       },
  // JWT (três segmentos base64url)
  { re: /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*/g, sub: "[jwt]"      },
  // Bearer token em headers
  { re: /Bearer\s+[A-Za-z0-9\-_.]+/gi,                           sub: "Bearer [token]" },
  // Supabase service role key  (sb_secret_...)
  { re: /sb_secret_[A-Za-z0-9_-]+/g,                             sub: "[service_key]"  },
  // Resend API key (re_...)
  { re: /re_[A-Za-z0-9_]{10,}/g,                                 sub: "[api_key]"      },
  // Token hexadecimal de 64 chars (reset de senha, etc.)
  { re: /\b[a-f0-9]{64}\b/g,                                     sub: "[hex_token]"    },
  // Hashes bcrypt
  { re: /\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g,                  sub: "[bcrypt_hash]"  },
];

function redact(value) {
  if (typeof value !== "string") return String(value ?? "");
  return REDACT.reduce((s, { re, sub }) => s.replace(re, sub), value);
}

function ts() {
  return new Date().toISOString();
}

/**
 * Log informacional seguro.
 * @param {string} tag    Identificador do módulo/operação, ex: "[Resend]"
 * @param {string} msg    Mensagem — será redacted antes de logar
 */
function safeLog(tag, msg) {
  const clean = redact(String(msg ?? ""));
  if (IS_PROD) {
    process.stdout.write(JSON.stringify({ ts: ts(), tag, msg: clean }) + "\n");
  } else {
    console.log(`[${ts()}] ${tag}: ${clean}`);
  }
}

/**
 * Log de erro seguro.
 * @param {string}      tag       Identificador do módulo/operação
 * @param {string}      code      Código de erro curto (error.code, error.name, status code)
 * @param {string|null} devDetail Detalhe extra — só exibido em dev, nunca em prod
 *
 * Passe APENAS error.code ou error.name como `code`.
 * NUNCA passe error.message, req.body, ou qualquer objeto de usuário.
 */
function safeError(tag, code, devDetail = null) {
  const safeCode = redact(String(code ?? "unknown"));

  if (IS_PROD) {
    process.stderr.write(JSON.stringify({ ts: ts(), level: "error", tag, code: safeCode }) + "\n");
  } else {
    const detail = devDetail !== null && devDetail !== undefined ? ` — ${redact(String(devDetail))}` : "";
    console.error(`[${ts()}] ERROR ${tag}: ${safeCode}${detail}`);
  }
}

module.exports = { safeLog, safeError };
