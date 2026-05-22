// env.js deve ser o PRIMEIRO import — carrega dotenv e valida variáveis obrigatórias
const { serverEnv, publicEnv } = require("./lib/env");

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const crypto     = require("crypto");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const { Resend } = require("resend");
const { supabaseAdmin: supabase } = require("./lib/supabase/admin");
const path       = require("path");

// Helpers de resposta HTTP — nunca use res.status(X).json() diretamente nas rotas
const { badRequest, unauthorized, forbidden, notFound, conflict,
        serverError, serviceUnavailable } = require("./lib/http");

// Middlewares: requireAuth valida JWT; validate* valida inputs com Zod
// requireAdmin está disponível em ./lib/middleware — adicionar quando rotas admin forem criadas
const { requireAuth, validateBody, validateParams } = require("./lib/middleware");

// Schemas Zod — um schema por rota que recebe dados do usuário
const {
  uuidParam,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  sendRecoveryEmailSchema,
  resetPasswordSchema,
  communityPostSchema,
  communityReactSchema,
  communityCommentSchema,
} = require("./lib/schemas");

// Storage helpers — upload seguro para Supabase Storage
const {
  COMMUNITY_BUCKET,
  validateImageFile,
  sanitizeFileName,
  buildUserStoragePath,
  uploadToStorage,
  getPublicStorageUrl,
} = require("./lib/storage");

// Logger seguro — nunca loga PII, tokens ou mensagens brutas de serviços externos
const { safeLog, safeError } = require("./lib/logger");

const app  = express();
const PORT = serverEnv.port;

// Vercel e outros proxies reversos: necessário para que req.ip retorne
// o IP real do cliente (X-Forwarded-For) em vez do IP do proxy.
// Sem isto o rate limiting aplica cotas por proxy, não por usuário.
app.set("trust proxy", 1);

// ── Segurança: cabeçalhos HTTP ────────────────────────────────
app.use(helmet({
  hsts: {
    maxAge: 63072000,       // 2 anos (recomendado para preload list)
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  contentSecurityPolicy: {
    // TODO: endurecer a CSP removendo 'unsafe-inline' e 'unsafe-eval'
    // após configurar nonces/hashes para scripts e estilos inline.
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                    "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "data:", "https://fonts.gstatic.com"],
      // Supabase Storage URL adicionado para permitir fotos da comunidade
      imgSrc:      ["'self'", "data:", "blob:",
                    ...(publicEnv.supabaseUrl ? [publicEnv.supabaseUrl] : [])],
      connectSrc:  ["'self'"],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      baseUri:        ["'self'"],
      frameAncestors: ["'none'"],
      formAction:     ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Permissions-Policy — Helmet v8 não cobre este header; adicionado manualmente
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});

// ── Segurança: CORS restrito ──────────────────────────────────
const allowed = serverEnv.allowedOrigins
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    // Permite qualquer subdomínio Vercel em produção
    if (origin.endsWith(".vercel.app")) return cb(null, true);
    cb(new Error("CORS bloqueado: origem não autorizada."));
  },
  credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────
// Limite de 2 MB (comporta fotos comprimidas + JSON)
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "..")));

// ── Rate limiting ─────────────────────────────────────────────
const limiterGlobal = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Muitas requisições. Aguarde e tente novamente." },
});

const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Muitas tentativas. Aguarde 15 minutos." },
});

const limiterEmail = rateLimit({
  windowMs: 5 * 60 * 1000, max: 3,
  keyGenerator: (req) => (req.body?.email || "").toLowerCase() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: { error: "RATE_LIMIT_EXCEEDED", message: "Muitas tentativas. Tente novamente em 5 minutos." },
});

app.use(limiterGlobal);

// ── Helpers ───────────────────────────────────────────────────
function isResendConfigured() {
  return serverEnv.resendApiKey.startsWith("re_") && serverEnv.resendApiKey.length > 10;
}

// Sanitiza texto: remove tags HTML e limita tamanho
function sanitize(str, maxLen = 2000) {
  return (str || "").replace(/<[^>]*>/g, "").replace(/[^\S\n]+/g, " ").trim().slice(0, maxLen);
}

// Gera JWT — assina com serverEnv.jwtSecret (server-only, nunca exposto)
function signToken(payload) {
  return jwt.sign(payload, serverEnv.jwtSecret, { expiresIn: "24h" });
}

// requireAuth e validate* vêm de ./lib/middleware (carregados acima)

// ── Email templates (internos — não expostos) ─────────────────
function buildHTML(toEmail, resetLink) {
  const name = sanitize(toEmail.split("@")[0], 60);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#140810;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#140810;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:rgba(255,240,245,0.07);border:1px solid rgba(255,200,220,0.12);
                    border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#f43f5e,#fb7185);padding:32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);letter-spacing:4px;text-transform:uppercase;">RESET 7D</p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">Recuperação de Senha</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 14px;color:#fdf2f8;font-size:16px;">Olá, <strong>${name}</strong>!</p>
            <p style="margin:0 0 24px;color:#fba8c4;font-size:15px;line-height:1.65;">
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para criar uma nova senha:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 32px;">
                  <a href="${resetLink}"
                     style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#fb7185);
                            color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;
                            padding:16px 42px;border-radius:12px;">
                    Redefinir minha senha
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#9c8a94;font-size:13px;">
              ⏱️ Este link expira em <strong style="color:#fba8c4;">30 minutos</strong>.
            </p>
            <p style="margin:0;color:#9c8a94;font-size:13px;">
              Se você não solicitou a recuperação de senha, ignore este e-mail.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(255,240,245,0.03);border-top:1px solid rgba(255,200,220,0.08);
                     padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#9c8a94;font-size:12px;">© 2026 Reset 7D · Todos os direitos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(toEmail, resetLink) {
  const name = sanitize(toEmail.split("@")[0], 60);
  return [
    `Olá, ${name}!`, "",
    "Recebemos uma solicitação para redefinir a senha da sua conta Reset 7D.", "",
    "Clique neste link para criar uma nova senha:", resetLink, "",
    "Este link expira em 30 minutos.", "",
    "Se você não solicitou a recuperação de senha, ignore este e-mail.", "",
    "— Equipe Reset 7D",
  ].join("\n");
}

// ── Health ────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Cadastro ──────────────────────────────────────────────────
// Pública. Zod valida e transforma (trim, lowercase, comprimento).
// user_id NÃO vem do frontend — gerado pelo Supabase (gen_random_uuid).
app.post("/api/register", limiterAuth, validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.validated.body;

  const { data: existing } = await supabase
    .from("users").select("id").eq("email", email).maybeSingle();

  if (existing) {
    return conflict(res, "EMAIL_EXISTS", "Este e-mail já está cadastrado.");
  }

  const password_hash = await bcrypt.hash(password, 12);
  const { error } = await supabase.from("users").insert({ name, email, password_hash });

  if (error) {
    safeError("[DB] Register", error.code);
    return serverError(res, "DB_ERROR", "Erro ao criar conta.");
  }

  const token = signToken({ email, name });
  res.status(201).json({ success: true, name, email, token });
});

// ── Login ─────────────────────────────────────────────────────
// Pública. A sessão (email/name) é derivada do registro encontrado no banco,
// nunca dos valores enviados pelo cliente diretamente.
app.post("/api/login", limiterAuth, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.validated.body;

  const { data: user } = await supabase
    .from("users").select("id, name, email, password_hash").eq("email", email).maybeSingle();

  // Tempo constante para evitar timing attack — compara mesmo se user não existir
  const dummyHash     = "$2b$12$invalidhashfortimingreasonsonlyXXXXXXXXXXXXXXXXXXXXX";
  const hashToCompare = user ? user.password_hash : dummyHash;
  const match         = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    return unauthorized(res, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
  }

  const token = signToken({ email: user.email, name: user.name });
  res.json({ success: true, name: user.name, email: user.email, token });
});

// ── Alterar senha (autenticado) ───────────────────────────────
// IDOR: o email do usuário vem exclusivamente do JWT (req.user.email).
// O body não tem campo email — impossível modificar senha de outro usuário.
app.post(
  "/api/change-password",
  requireAuth,
  limiterAuth,
  validateBody(changePasswordSchema),
  async (req, res) => {
    const { currentPassword, newPassword } = req.validated.body;

    // Deriva email da sessão autenticada — nunca do body
    const { data: user } = await supabase
      .from("users").select("password_hash").eq("email", req.user.email).maybeSingle();

    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return unauthorized(res, "WRONG_PASSWORD", "Senha atual incorreta.");
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
      .from("users").update({ password_hash }).eq("email", req.user.email);

    if (error) {
      safeError("[DB] ChangePassword", error.code);
      return serverError(res, "DB_ERROR", "Erro ao alterar senha.");
    }

    res.json({ success: true, message: "Senha alterada com sucesso." });
  }
);

// ── Recuperação de senha ──────────────────────────────────────
// Pública (rate limitada por e-mail + IP via Zod + limiterEmail).
// Não retorna erro diferente se o e-mail não existir — evita enumeração.
app.post(
  "/api/send-recovery-email",
  limiterEmail,
  validateBody(sendRecoveryEmailSchema),
  async (req, res) => {
    const { email } = req.validated.body;

    if (!isResendConfigured()) {
      return serviceUnavailable(res, "SERVICE_UNAVAILABLE", "Serviço de e-mail indisponível.");
    }

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from("password_reset_tokens")
      .insert({ email, token, expires_at: expiresAt });

    if (dbError) {
      safeError("[DB] Token insert", dbError.code);
      return serverError(res, "DB_ERROR", "Erro interno. Tente novamente.");
    }

    const resetLink = `${serverEnv.appUrl}?reset=${token}`;
    const resend    = new Resend(serverEnv.resendApiKey);

    try {
      const { data, error } = await resend.emails.send({
        from: `${serverEnv.fromName} <${serverEnv.fromEmail}>`,
        to:   email,
        subject: "Recuperação de senha — Reset 7D",
        html: buildHTML(email, resetLink),
        text: buildText(email, resetLink),
      });

      if (error) {
        safeError("[Resend]", error.name);
        if (error.name === "validation_error" || (error.message || "").includes("domain")) {
          return forbidden(res, "DOMAIN_NOT_VERIFIED", "Domínio do remetente não verificado.");
        }
        return serverError(res, "SEND_FAILED", "Falha ao enviar e-mail.");
      }

      // Não loga o email do destinatário — loga apenas o ID da mensagem Resend
      safeLog("[Resend] Enviado", data?.id || "no-id");
      res.json({ success: true, message: "E-mail enviado com sucesso." });
    } catch (err) {
      safeError("[Resend] Exception", err.statusCode || "unknown");
      return serverError(res, "SEND_FAILED", "Falha ao enviar e-mail.");
    }
  }
);

// ── Redefinição de senha ──────────────────────────────────────
// Pública (rate limitada). Zod valida formato do token (hex 64 chars).
// IDOR: email derivado do registro do token no banco — nunca do body.
// TOCTOU: marca token como `used` antes de atualizar a senha.
app.post(
  "/api/reset-password",
  limiterAuth,
  validateBody(resetPasswordSchema),
  async (req, res) => {
    const { token, newPassword } = req.validated.body;

    const { data: record } = await supabase
      .from("password_reset_tokens")
      .select("id, email, expires_at, used")
      .eq("token", token)
      .eq("used", false)
      .maybeSingle();

    if (!record || new Date(record.expires_at) < new Date()) {
      return badRequest(res, "TOKEN_EXPIRED", "Link inválido ou expirado. Solicite um novo.");
    }

    // Marca como usado ANTES de alterar a senha (previne TOCTOU / replay)
    const { error: updateErr } = await supabase
      .from("password_reset_tokens").update({ used: true }).eq("id", record.id);

    if (updateErr) {
      return badRequest(res, "TOKEN_EXPIRED", "Link inválido ou expirado.");
    }

    // email derivado do registro do banco — NÃO do req.body (IDOR seguro)
    const password_hash = await bcrypt.hash(newPassword, 12);
    const { data: existingUser } = await supabase
      .from("users").select("id").eq("email", record.email).maybeSingle();

    if (existingUser) {
      await supabase.from("users").update({ password_hash }).eq("email", record.email);
    }

    res.json({ success: true, message: "Senha redefinida com sucesso." });
  }
);

// ── Comunidade — leitura pública ──────────────────────────────
// Sem auth — feed público. user_email NÃO é retornado na select list.
app.get("/api/community", async (_req, res) => {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_name, day, text, photo, reactions, comments, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    safeError("[DB] Community get", error.code);
    return serverError(res, "DB_ERROR", "Erro ao carregar posts.");
  }
  res.json({ posts: data });
});

// ── Comunidade — escrita autenticada ─────────────────────────
// IDOR: user_email e user_name derivados do JWT — nunca do body.
// Foto: base64 validado por magic bytes → upload para Storage → URL salva no DB.
app.post(
  "/api/community",
  requireAuth,
  validateBody(communityPostSchema),
  async (req, res) => {
    const { day, text, photo: photoData } = req.validated.body;

    // Processar foto: validar conteúdo e fazer upload para Supabase Storage
    let photoUrl = null;
    if (photoData) {
      let validated;
      try {
        validated = validateImageFile(photoData);
      } catch (err) {
        return badRequest(res, "INVALID_PHOTO", err.message);
      }

      const { mime, buffer, ext } = validated;
      const filename    = sanitizeFileName("photo", ext);
      const storagePath = buildUserStoragePath(req.user.email, "community", filename);

      try {
        await uploadToStorage(COMMUNITY_BUCKET, storagePath, buffer, mime);
        photoUrl = getPublicStorageUrl(COMMUNITY_BUCKET, storagePath);
      } catch (_err) {
        // Não loga _err.message — pode conter paths internos ou config do Storage
        safeError("[Storage] Community upload", "upload_failed");
        return serverError(res, "UPLOAD_ERROR", "Erro ao salvar imagem.");
      }
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        // user_email e user_name sempre do JWT — nunca do body
        user_email: req.user.email,
        user_name:  sanitize(req.user.name, 100),
        day,
        text:  sanitize(text, 1000),
        photo: photoUrl,  // URL do Storage, nunca base64
      })
      .select("id, user_name, day, text, photo, reactions, comments, created_at")
      .single();

    if (error) {
      safeError("[DB] Community post", error.code);
      return serverError(res, "DB_ERROR", "Erro ao criar post.");
    }

    res.status(201).json({ success: true, post: data });
  }
);

// ── Reação (autenticada) ──────────────────────────────────────
// Qualquer usuário autenticado pode reagir a qualquer post (feature social).
// UUID validado pelo Zod; emoji validado contra allowlist estrita no schema.
// Não há IDOR: reações são públicas e incrementais por design.
app.patch(
  "/api/community/:id/react",
  requireAuth,
  validateParams(uuidParam),
  validateBody(communityReactSchema),
  async (req, res) => {
    const { id }    = req.validated.params;
    const { emoji } = req.validated.body;

    const { data: post } = await supabase
      .from("community_posts").select("reactions").eq("id", id).maybeSingle();

    if (!post) return notFound(res, "POST_NOT_FOUND", "Post não encontrado.");

    const reactions = {
      ...(post.reactions || {}),
      [emoji]: ((post.reactions || {})[emoji] || 0) + 1,
    };

    const { error } = await supabase
      .from("community_posts").update({ reactions }).eq("id", id);

    if (error) {
      safeError("[DB] React", error.code);
      return serverError(res, "DB_ERROR", "Erro ao registrar reação.");
    }

    res.json({ success: true, reactions });
  }
);

// ── Comentário (autenticado) ──────────────────────────────────
// Qualquer usuário autenticado pode comentar em qualquer post (feature social).
// Nome do comentarista derivado do JWT — nunca do body.
app.post(
  "/api/community/:id/comment",
  requireAuth,
  validateParams(uuidParam),
  validateBody(communityCommentSchema),
  async (req, res) => {
    const { id }   = req.validated.params;
    const { text } = req.validated.body;

    const { data: post } = await supabase
      .from("community_posts").select("comments").eq("id", id).maybeSingle();

    if (!post) return notFound(res, "POST_NOT_FOUND", "Post não encontrado.");

    // Nome derivado do JWT — nunca do body
    const name     = sanitize(req.user.name.split(" ")[0], 50);
    const comments = [
      ...(post.comments || []),
      { u: name, t: sanitize(text, 500), ts: new Date().toISOString() },
    ];

    const { error } = await supabase
      .from("community_posts").update({ comments }).eq("id", id);

    if (error) {
      safeError("[DB] Comment", error.code);
      return serverError(res, "DB_ERROR", "Erro ao adicionar comentário.");
    }

    res.status(201).json({ success: true });
  }
);

// ── Bloqueio preventivo de rotas admin ───────────────────────
// Nenhuma rota /api/admin/* existe ainda no sistema.
// Este handler captura qualquer tentativa de acesso — autenticada ou não —
// e retorna 403, garantindo que nenhum endpoint admin seja acidentalmente
// exposto antes de ter requireAuth + requireAdmin aplicados.
//
// Quando uma rota admin for criada, registrá-la ANTES deste bloco:
//   app.get("/api/admin/users", requireAuth, requireAdmin, handler);
//
// requireAdmin está disponível em ./lib/middleware e verifica role no banco.
// NUNCA aceitar isAdmin ou role vindos do client.
app.use("/api/admin", (_req, res) => {
  return forbidden(res, "FORBIDDEN", "Acesso negado.");
});

// ── Export para Vercel / Start local ─────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    safeLog("[Startup]", `Reset 7D Backend — ${url}`);
    safeLog("[Startup]", `Supabase: ${publicEnv.supabaseUrl ? "ok" : "SUPABASE_URL nao definida"}`);
    safeLog("[Startup]", `Resend: ${isResendConfigured() ? "ok" : "RESEND_API_KEY ausente"}`);
  });
}

module.exports = app;
