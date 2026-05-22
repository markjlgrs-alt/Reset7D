"use strict";

/**
 * Schemas Zod — Reset 7D Backend
 *
 * Cada rota que recebe dados do usuário usa um schema deste módulo.
 * Os schemas:
 *  - Validam tipo, formato e tamanho de cada campo.
 *  - Transformam valores (trim, toLowerCase) antes de chegar ao handler.
 *  - Rejeitam campos extras com .strict() onde aplicável.
 *  - Limitam strings para prevenir payloads excessivamente grandes.
 */

const { z } = require("zod");

// ── Campos reutilizáveis ──────────────────────────────────────

const emailField = z
  .string({ required_error: "E-mail obrigatório." })
  .trim()
  .toLowerCase()
  .email("E-mail inválido.")
  .max(200, "E-mail muito longo.");

// Senha: mínimo 6, máximo 128 — backend valida; não repetir regras visuais aqui
const passwordField = z
  .string({ required_error: "Senha obrigatória." })
  .min(6,   "Senha deve ter pelo menos 6 caracteres.")
  .max(128, "Senha deve ter no máximo 128 caracteres.");

// UUID v4: valida IDs de recursos vindos da URL (:id)
const uuidParam = z.object({
  id: z.string().uuid("ID de recurso inválido."),
});

// Foto como data URL base64 — JPEG, PNG ou WEBP
// Limite alinhado com storage.js: 5 MB decoded → ~6.7 MB base64.
// O handler chama validateImageFile() que verifica magic bytes e tamanho real.
// Este campo é apenas um pré-filtro de formato e tamanho de string.
const MAX_PHOTO_B64 = 6_800_000; // ~5 MB decoded após overhead base64

const photoField = z
  .string()
  .regex(
    /^data:image\/(jpeg|png|webp);base64,/,
    "Formato de imagem inválido. Use JPEG, PNG ou WEBP."
  )
  .max(MAX_PHOTO_B64, "Imagem muito grande. Máximo permitido: 5 MB.")
  .nullable()
  .optional();

// ── Emojis permitidos nas reações ─────────────────────────────
// Allowlist explícita — qualquer valor fora da lista é rejeitado pelo Zod.
const EMOJI_VALUES = ["❤️", "🔥", "💪", "💜", "🌟", "👏", "✨", "🎉"] ;

// ── Schemas por rota ──────────────────────────────────────────

// POST /api/register
const registerSchema = z
  .object({
    name:     z.string({ required_error: "Nome obrigatório." })
                .trim()
                .min(1, "Nome obrigatório.")
                .max(100, "Nome muito longo."),
    email:    emailField,
    password: passwordField,
  })
  .strict();

// POST /api/login
const loginSchema = z
  .object({
    email:    emailField,
    password: z.string({ required_error: "Senha obrigatória." })
               .min(1, "Senha obrigatória."),
  })
  .strict();

// POST /api/change-password
const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: "Senha atual obrigatória." })
                      .min(1, "Senha atual obrigatória."),
    newPassword:     passwordField,
  })
  .strict();

// POST /api/send-recovery-email
const sendRecoveryEmailSchema = z
  .object({
    email: emailField,
  })
  .strict();

// POST /api/reset-password
const resetPasswordSchema = z
  .object({
    // Token gerado com crypto.randomBytes(32).toString("hex") — sempre 64 chars hex
    token: z
      .string({ required_error: "Token obrigatório." })
      .regex(/^[a-f0-9]{64}$/, "Token inválido."),
    newPassword: passwordField,
  })
  .strict();

// POST /api/community
const communityPostSchema = z
  .object({
    day:   z.coerce.number().int().min(1).max(7).default(1),
    // text é opcional mas sanitizado — HTML stripped pelo handler
    text:  z.string().trim().max(1000, "Texto muito longo (máx. 1000 caracteres).").optional().default(""),
    photo: photoField,
  })
  .strict()
  .refine(
    (d) => (d.text && d.text.length > 0) || d.photo,
    { message: "Post não pode ser vazio.", path: ["text"] }
  );

// PATCH /api/community/:id/react
const communityReactSchema = z
  .object({
    emoji: z.enum(EMOJI_VALUES, {
      errorMap: () => ({ message: "Emoji não permitido." }),
    }),
  })
  .strict();

// POST /api/community/:id/comment
const communityCommentSchema = z
  .object({
    text: z
      .string({ required_error: "Comentário obrigatório." })
      .trim()
      .min(1, "Comentário não pode ser vazio.")
      .max(500, "Comentário muito longo (máx. 500 caracteres)."),
  })
  .strict();

module.exports = {
  uuidParam,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  sendRecoveryEmailSchema,
  resetPasswordSchema,
  communityPostSchema,
  communityReactSchema,
  communityCommentSchema,
};
