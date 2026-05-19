require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const crypto     = require("crypto");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");
const path       = require("path");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Supabase ──────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Segurança: cabeçalhos HTTP ────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "blob:"],
      connectSrc:  ["'self'"],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── Segurança: CORS restrito ──────────────────────────────────
const allowed = (process.env.ALLOWED_ORIGINS || "http://localhost:3001")
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
  const key = process.env.RESEND_API_KEY || "";
  return key.startsWith("re_") && key.length > 10;
}

// Sanitiza texto: remove tags HTML e limita tamanho
function sanitize(str, maxLen = 2000) {
  return (str || "").replace(/<[^>]*>/g, "").replace(/[^\S\n]+/g, " ").trim().slice(0, maxLen);
}

// Valida email
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Emojis permitidos nas reações
const ALLOWED_EMOJIS = new Set(["❤️","🔥","💪","💜","🌟","👏","✨","🎉"]);

// Gera JWT
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
}

// Middleware de autenticação JWT
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "UNAUTHORIZED", message: "Autenticação necessária." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "TOKEN_INVALID", message: "Sessão expirada. Faça login novamente." });
  }
}

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
app.post("/api/register", limiterAuth, async (req, res) => {
  const name     = sanitize(req.body?.name, 100);
  const email    = (req.body?.email || "").toLowerCase().trim().slice(0, 200);
  const password = req.body?.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "Preencha todos os campos." });
  }
  if (!RE_EMAIL.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "E-mail inválido." });
  }
  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ error: "INVALID_PASSWORD", message: "Senha deve ter entre 6 e 128 caracteres." });
  }

  const { data: existing } = await supabase
    .from("users").select("id").eq("email", email).maybeSingle();

  // Mesma mensagem para usuário existente e novo — evita enumeração de e-mails
  if (existing) {
    return res.status(409).json({ error: "EMAIL_EXISTS", message: "Este e-mail já está cadastrado." });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const { error } = await supabase.from("users").insert({ name, email, password_hash });
  if (error) {
    console.error("[DB] Register:", error.code);
    return res.status(500).json({ error: "DB_ERROR", message: "Erro ao criar conta." });
  }

  const token = signToken({ email, name });
  res.json({ success: true, name, email, token });
});

// ── Login ─────────────────────────────────────────────────────
app.post("/api/login", limiterAuth, async (req, res) => {
  const email    = (req.body?.email || "").toLowerCase().trim().slice(0, 200);
  const password = req.body?.password || "";

  if (!email || !password) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "Preencha e-mail e senha." });
  }

  const { data: user } = await supabase
    .from("users").select("id, name, email, password_hash").eq("email", email).maybeSingle();

  // Tempo constante para evitar timing attack (compara mesmo se user não existir)
  const dummyHash = "$2b$12$invalidhashfortimingreasonsonlyXXXXXXXXXXXXXXXXXXXXX";
  const hashToCompare = user ? user.password_hash : dummyHash;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "E-mail ou senha incorretos." });
  }

  const token = signToken({ email: user.email, name: user.name });
  res.json({ success: true, name: user.name, email: user.email, token });
});

// ── Alterar senha (autenticado) ───────────────────────────────
app.post("/api/change-password", requireAuth, limiterAuth, async (req, res) => {
  const currentPassword = req.body?.currentPassword || "";
  const newPassword     = req.body?.newPassword || "";

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "Preencha todos os campos." });
  }
  if (newPassword.length < 6 || newPassword.length > 128) {
    return res.status(400).json({ error: "INVALID_PASSWORD", message: "Nova senha deve ter entre 6 e 128 caracteres." });
  }

  const { data: user } = await supabase
    .from("users").select("password_hash").eq("email", req.user.email).maybeSingle();

  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return res.status(401).json({ error: "WRONG_PASSWORD", message: "Senha atual incorreta." });
  }

  const password_hash = await bcrypt.hash(newPassword, 12);
  await supabase.from("users").update({ password_hash }).eq("email", req.user.email);
  res.json({ success: true, message: "Senha alterada com sucesso." });
});

// ── Recuperação de senha ──────────────────────────────────────
app.post("/api/send-recovery-email", limiterEmail, async (req, res) => {
  const email = (req.body?.email || "").toLowerCase().trim().slice(0, 200);

  if (!email || !RE_EMAIL.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "E-mail inválido." });
  }
  if (!isResendConfigured()) {
    return res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: "Serviço de e-mail indisponível." });
  }

  const token     = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from("password_reset_tokens")
    .insert({ email, token, expires_at: expiresAt });

  if (dbError) {
    console.error("[DB] Token insert:", dbError.code);
    return res.status(500).json({ error: "DB_ERROR", message: "Erro interno. Tente novamente." });
  }

  const appOrigin = process.env.APP_URL || `http://localhost:${PORT}`;
  const resetLink = `${appOrigin}?reset=${token}`;

  const resend    = new Resend(process.env.RESEND_API_KEY);
  const fromName  = process.env.FROM_NAME  || "Reset 7D";
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to:   email,
      subject: "Recuperação de senha — Reset 7D",
      html: buildHTML(email, resetLink),
      text: buildText(email, resetLink),
    });

    if (error) {
      console.error("[Resend]", error.name);
      if (error.name === "validation_error" || (error.message || "").includes("domain")) {
        return res.status(403).json({ error: "DOMAIN_NOT_VERIFIED", message: "Domínio do remetente não verificado." });
      }
      return res.status(500).json({ error: "SEND_FAILED", message: "Falha ao enviar e-mail." });
    }

    console.log(`[Resend] Enviado → ${email} (${data?.id})`);
    res.json({ success: true, message: "E-mail enviado com sucesso." });
  } catch (err) {
    console.error("[Resend] Exception:", err.statusCode || "unknown");
    res.status(500).json({ error: "SEND_FAILED", message: "Falha ao enviar e-mail." });
  }
});

// ── Redefinição de senha ──────────────────────────────────────
app.post("/api/reset-password", async (req, res) => {
  const token       = (req.body?.token || "").trim().slice(0, 128);
  const newPassword = req.body?.newPassword || "";

  if (!token || !newPassword) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "Dados incompletos." });
  }
  if (newPassword.length < 6 || newPassword.length > 128) {
    return res.status(400).json({ error: "INVALID_PASSWORD", message: "Senha deve ter entre 6 e 128 caracteres." });
  }
  // Valida que token é apenas hex (32 bytes = 64 chars)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ error: "INVALID_TOKEN", message: "Token inválido." });
  }

  const { data: record } = await supabase
    .from("password_reset_tokens")
    .select("id, email, expires_at, used")
    .eq("token", token)
    .eq("used", false)
    .maybeSingle();

  if (!record || new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: "TOKEN_EXPIRED", message: "Link inválido ou expirado. Solicite um novo." });
  }

  // Marca como usado ANTES de alterar a senha (previne TOCTOU)
  const { error: updateErr } = await supabase
    .from("password_reset_tokens").update({ used: true }).eq("id", record.id);

  if (updateErr) {
    return res.status(400).json({ error: "TOKEN_EXPIRED", message: "Link inválido ou expirado." });
  }

  const password_hash = await bcrypt.hash(newPassword, 12);
  const { data: existingUser } = await supabase
    .from("users").select("id").eq("email", record.email).maybeSingle();

  if (existingUser) {
    await supabase.from("users").update({ password_hash }).eq("email", record.email);
  }

  res.json({ success: true, message: "Senha redefinida com sucesso." });
});

// ── Comunidade — leitura pública ──────────────────────────────
app.get("/api/community", async (_req, res) => {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_name, day, text, photo, reactions, comments, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[DB] Community get:", error.code);
    return res.status(500).json({ error: "DB_ERROR", message: "Erro ao carregar posts." });
  }
  res.json({ posts: data });
});

// ── Comunidade — escrita autenticada ─────────────────────────
app.post("/api/community", requireAuth, async (req, res) => {
  const day   = Math.max(1, Math.min(7, parseInt(req.body?.day) || 1));
  const text  = sanitize(req.body?.text, 1000);
  const photo = req.body?.photo || null;

  // Valida foto: deve ser data URL de imagem JPEG/PNG/WEBP
  if (photo && !/^data:image\/(jpeg|png|webp);base64,/.test(photo)) {
    return res.status(400).json({ error: "INVALID_PHOTO", message: "Formato de imagem inválido." });
  }
  if (!text && !photo) {
    return res.status(400).json({ error: "EMPTY_POST", message: "Post não pode ser vazio." });
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_email: req.user.email,
      user_name:  sanitize(req.user.name, 100),
      day, text,
      photo: photo || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[DB] Community post:", error.code);
    return res.status(500).json({ error: "DB_ERROR", message: "Erro ao criar post." });
  }
  res.json({ success: true, post: data });
});

// ── Reação (autenticada) ──────────────────────────────────────
app.patch("/api/community/:id/react", requireAuth, async (req, res) => {
  const emoji = req.body?.emoji || "";
  const { id } = req.params;

  if (!ALLOWED_EMOJIS.has(emoji)) {
    return res.status(400).json({ error: "INVALID_EMOJI", message: "Emoji não permitido." });
  }
  // Valida que id é UUID
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({ error: "INVALID_ID" });
  }

  const { data: post } = await supabase
    .from("community_posts").select("reactions").eq("id", id).maybeSingle();

  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  const reactions = { ...(post.reactions || {}), [emoji]: ((post.reactions || {})[emoji] || 0) + 1 };
  await supabase.from("community_posts").update({ reactions }).eq("id", id);
  res.json({ success: true, reactions });
});

// ── Comentário (autenticado) ──────────────────────────────────
app.post("/api/community/:id/comment", requireAuth, async (req, res) => {
  const text = sanitize(req.body?.text, 500);
  const { id } = req.params;

  if (!text) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "Comentário não pode ser vazio." });
  }
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({ error: "INVALID_ID" });
  }

  const { data: post } = await supabase
    .from("community_posts").select("comments").eq("id", id).maybeSingle();

  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  const name     = sanitize(req.user.name.split(" ")[0], 50);
  const comments = [...(post.comments || []), { u: name, t: text, ts: new Date().toISOString() }];
  await supabase.from("community_posts").update({ comments }).eq("id", id);
  res.json({ success: true });
});

// ── Export para Vercel / Start local ─────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n🚀  Reset 7D Backend — ${url}`);
    console.log(`🔒  Segurança:  JWT + Helmet + Rate Limit + CORS restrito`);
    console.log(`🗄️   Supabase:   ${process.env.SUPABASE_URL ? "✅" : "⚠️  SUPABASE_URL não definida"}`);
    console.log(`📧  Resend:     ${isResendConfigured() ? "✅" : "⚠️  RESEND_API_KEY ausente"}`);
  });
}

module.exports = app;
