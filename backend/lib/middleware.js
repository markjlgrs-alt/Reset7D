"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo usa JWT_SECRET (via env.js) e supabase/admin.js (service_role key).
// Executar no browser exporia as chaves de assinatura e serviço.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/middleware.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

/**
 * Middlewares de autenticação e validação — Reset 7D Backend
 *
 * requireAuth   — verifica JWT; popula req.user com payload decodificado.
 * requireAdmin  — verifica JWT + role='admin' no banco (nunca do client).
 * validateBody  — valida req.body com schema Zod; popula req.validated.body.
 * validateParams — valida req.params com schema Zod; popula req.validated.params.
 *
 * Regras de segurança:
 *  - req.user é sempre derivado do JWT assinado pelo servidor.
 *    Nunca confie em user_id, email ou isAdmin vindos do req.body.
 *  - requireAdmin busca role no banco após validar o JWT.
 *    A coluna role nunca vem do client — é lida do registro do usuário.
 *  - req.validated.body contém dados já transformados (trim, toLowerCase, coerce).
 *    Use sempre req.validated.body nos handlers, nunca req.body diretamente.
 */

const jwt = require("jsonwebtoken");
const { serverEnv } = require("./env");
const { unauthorized, forbidden, badRequest } = require("./http");
const { supabaseAdmin } = require("./supabase/admin");
const { safeError } = require("./logger");

// ── Autenticação ──────────────────────────────────────────────

/**
 * Exige token JWT válido no cabeçalho Authorization: Bearer <token>.
 * Em caso de sucesso popula req.user = { email, name, iat, exp }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return unauthorized(res, "UNAUTHORIZED", "Autenticação necessária.");
  }

  try {
    req.user = jwt.verify(token, serverEnv.jwtSecret);
    next();
  } catch {
    return unauthorized(res, "TOKEN_INVALID", "Sessão expirada. Faça login novamente.");
  }
}

// ── Autorização de admin ──────────────────────────────────────

/**
 * Exige role = 'admin' buscado na tabela users do banco de dados.
 *
 * DEVE ser usado APÓS requireAuth (que já validou o JWT e populou req.user).
 *
 * Fluxo:
 *  1. req.user.email vem do JWT verificado por requireAuth — nunca do body.
 *  2. Busca o campo role no banco para esse email.
 *  3. Retorna 403 se: usuário não encontrado, role ausente, role !== 'admin'.
 *  4. Nunca aceita isAdmin, role ou qualquer indicador de admin do client.
 *
 * AVISO: a coluna 'role' na tabela users ainda não existe em produção.
 * Até ser criada e populada, este middleware sempre retorna 403 (fail-secure).
 * Ver SECURITY_AUDIT.md § "Admin Hardening — TODO" para a migration necessária.
 *
 * Uso em rotas:
 *   app.get("/api/admin/algo", requireAuth, requireAdmin, handler);
 */
async function requireAdmin(req, res, next) {
  // req.user deve ter sido populado por requireAuth antes deste middleware
  if (!req.user?.email) {
    return unauthorized(res, "UNAUTHORIZED", "Autenticação necessária.");
  }

  let record;
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", req.user.email)
      .maybeSingle();

    // Erro de DB ou coluna inexistente → nega por segurança
    // Não loga error.message — pode conter schema SQL interno
    if (error) {
      safeError("[requireAdmin] DB", error.code || "db_error");
      return forbidden(res, "FORBIDDEN", "Acesso negado.");
    }

    record = data;
  } catch (_err) {
    // Não loga _err.message — pode conter stack trace ou paths internos
    safeError("[requireAdmin] Exception", "internal_error");
    return forbidden(res, "FORBIDDEN", "Acesso negado.");
  }

  // Nunca assume admin por ausência de campo — exige 'admin' explícito
  if (!record || record.role !== "admin") {
    return forbidden(res, "FORBIDDEN", "Acesso negado.");
  }

  next();
}

// ── Validação de schema ───────────────────────────────────────

/**
 * Valida req.body contra um schema Zod.
 * Em caso de sucesso popula req.validated.body com os dados transformados.
 * Em caso de falha retorna 400 com a primeira mensagem de erro do schema.
 *
 * Uso:
 *   app.post("/api/rota", validateBody(minhaSchema), handler);
 */
function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const first = result.error.issues[0];
      return badRequest(res, "VALIDATION_ERROR", first.message);
    }
    req.validated = req.validated || {};
    req.validated.body = result.data;
    next();
  };
}

/**
 * Valida req.params contra um schema Zod.
 * Em caso de sucesso popula req.validated.params com os dados transformados.
 *
 * Uso:
 *   app.patch("/api/comunidade/:id/reagir",
 *     requireAuth,
 *     validateParams(uuidParam),
 *     handler);
 */
function validateParams(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.params ?? {});
    if (!result.success) {
      const first = result.error.issues[0];
      return badRequest(res, "VALIDATION_ERROR", first.message);
    }
    req.validated = req.validated || {};
    req.validated.params = result.data;
    next();
  };
}

module.exports = { requireAuth, requireAdmin, validateBody, validateParams };
