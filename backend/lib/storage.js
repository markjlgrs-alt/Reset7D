"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo importa supabase/admin.js (service_role key) e processa
// uploads com buffers em memória. Executar no browser exporia a chave de serviço.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/storage.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

const crypto = require("crypto");
const { supabaseAdmin } = require("./supabase/admin");

const COMMUNITY_BUCKET = "community-photos"; // public  — feed visível a todos
const PROFILE_BUCKET   = "profile-photos";   // private — acesso só via signed URL

// 5 MB limit on the decoded binary
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Base64 expands binary ~33 %; add small buffer for padding characters
const MAX_B64_SIZE = Math.ceil(MAX_FILE_SIZE * 4 / 3) + 16;

// First bytes that must be present for each MIME type (magic numbers)
const MAGIC = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png":  [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  // WEBP: first 4 bytes = "RIFF", bytes 8-11 = "WEBP"
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

/**
 * Validates a base64 data URL image.
 *
 * Checks (in order):
 *  1. String format — must be a data URL with allowed MIME type
 *  2. Base64 size   — fast reject before expensive decode
 *  3. Decoded size  — binary must not exceed MAX_FILE_SIZE
 *  4. Magic bytes   — file content must match the declared MIME
 *  5. WEBP marker   — bytes 8-11 must spell "WEBP" for WebP files
 *
 * Returns { mime, buffer, ext } on success; throws with a user-facing message
 * on any violation.
 */
function validateImageFile(dataUrl) {
  if (typeof dataUrl !== "string") throw new Error("Arquivo inválido.");

  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/,
  );
  if (!match) throw new Error("Formato inválido. Use JPEG, PNG ou WEBP.");

  const [, mime, b64] = match;

  if (b64.length > MAX_B64_SIZE)
    throw new Error("Imagem muito grande. Máximo permitido: 5 MB.");

  let buffer;
  try { buffer = Buffer.from(b64, "base64"); }
  catch { throw new Error("Dados da imagem corrompidos."); }

  if (buffer.length > MAX_FILE_SIZE)
    throw new Error("Imagem muito grande. Máximo permitido: 5 MB.");

  const sig = MAGIC[mime];
  for (let i = 0; i < sig.length; i++) {
    if (buffer[i] !== sig[i])
      throw new Error("Conteúdo da imagem não corresponde ao tipo declarado.");
  }

  if (mime === "image/webp") {
    if (buffer.length < 12 || buffer.slice(8, 12).toString("ascii") !== "WEBP")
      throw new Error("Arquivo WEBP inválido.");
  }

  return { mime, buffer, ext: MIME_TO_EXT[mime] };
}

/**
 * Sanitizes a filename for safe use in storage paths.
 *
 * - Strips directory traversal components (slashes, backslashes)
 * - Keeps only [a-zA-Z0-9_-]
 * - Appends a validated extension derived from the MIME type
 * - Limits total length to 52 characters
 */
function sanitizeFileName(originalName, ext) {
  const base = String(originalName || "photo")
    .replace(/.*[/\\]/g, "")          // strip path components
    .replace(/\.[^.]+$/, "")          // remove original extension
    .replace(/[^a-zA-Z0-9_-]/g, "-")  // keep only safe chars
    .replace(/-{2,}/g, "-")           // collapse repeated dashes
    .replace(/^-+|-+$/g, "")          // trim leading/trailing dashes
    .slice(0, 48)
    || "photo";
  return `${base}.${ext}`;
}

/**
 * Builds a safe Supabase Storage path scoped to a user.
 *
 * Uses a deterministic SHA-256 hash of the email (first 16 hex chars) so
 * the email is never embedded in the path or visible in public URLs.
 *
 * Pattern: {hash16}/{folder}/{timestamp}-{filename}
 *
 * IMPORTANT: userEmail MUST always come from req.user.email (verified JWT),
 * never from the request body.
 */
function buildUserStoragePath(userEmail, folder, filename) {
  const userHash = crypto
    .createHash("sha256")
    .update(userEmail.toLowerCase())
    .digest("hex")
    .slice(0, 16);

  const safeFolder   = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "misc";
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `${userHash}/${safeFolder}/${Date.now()}-${safeFilename}`;
}

/**
 * Uploads a Buffer to a Supabase Storage bucket.
 * Returns the storage path on success; throws on failure.
 */
async function uploadToStorage(bucket, storagePath, buffer, contentType) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
  return storagePath;
}

/**
 * Returns the public CDN URL for an object in a PUBLIC bucket.
 * Do NOT use this for private buckets — use createPrivateSignedUrl instead.
 */
function getPublicStorageUrl(bucket, storagePath) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Creates a time-limited signed URL for an object in a PRIVATE bucket.
 * Default expiry: 1 hour (3 600 s). Never use getPublicUrl for private content.
 */
async function createPrivateSignedUrl(bucket, storagePath, expiresInSeconds = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw new Error(`Erro ao gerar URL assinada: ${error.message}`);
  return data.signedUrl;
}

module.exports = {
  COMMUNITY_BUCKET,
  PROFILE_BUCKET,
  MAX_FILE_SIZE,
  MAX_B64_SIZE,
  validateImageFile,
  sanitizeFileName,
  buildUserStoragePath,
  uploadToStorage,
  getPublicStorageUrl,
  createPrivateSignedUrl,
};
