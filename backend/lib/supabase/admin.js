"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo usa SUPABASE_SERVICE_ROLE_KEY (bypassa RLS — acesso irrestrito).
// Executar no browser exporia a chave e todo o banco de dados ao cliente.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/supabase/admin.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

// ⚠️  SEGURANÇA — NUNCA importar este arquivo em código client-side.
// Este módulo usa a service_role key, que bypassa Row Level Security (RLS).
// Use apenas em routes de API, server actions ou jobs administrativos.
// Expor esta chave ao browser concede acesso irrestrito ao banco de dados.

const { createClient } = require("@supabase/supabase-js");
const { serverEnv, publicEnv } = require("../env");

const supabaseAdmin = createClient(
  publicEnv.supabaseUrl,
  serverEnv.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,   // servidor não persiste sessão entre requisições
      autoRefreshToken: false, // servidor não faz refresh automático de tokens
    },
  }
);

module.exports = { supabaseAdmin };
