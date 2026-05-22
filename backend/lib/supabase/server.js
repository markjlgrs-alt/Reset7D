"use strict";

// ── SERVER-ONLY GUARD ─────────────────────────────────────────
// Este arquivo usa SUPABASE_ANON_KEY e cria clientes Supabase para contexto
// de servidor. Não deve ser executado no browser.
if (typeof window !== "undefined") {
  throw new Error(
    "[SECURITY] backend/lib/supabase/server.js é server-only. " +
    "Nunca importe este arquivo em código client-side ou bundles de frontend."
  );
}

// Cliente Supabase com anon key — respeita Row Level Security (RLS).
// Use para operações em contexto de usuário autenticado via token.
// Para operações privilegiadas (bypassar RLS), use ./admin.js.
//
// Requer SUPABASE_ANON_KEY no backend/.env.
// Painel Supabase → Project Settings → API → anon (public).

const { createClient } = require("@supabase/supabase-js");
const { publicEnv } = require("../env");

// Factory por requisição — passa o token do usuário para o cliente.
// Supabase respeitará as políticas RLS associadas ao usuário autenticado.
function createServerClient(userAccessToken) {
  if (!publicEnv.supabaseAnonKey) {
    throw new Error(
      "[supabase/server] SUPABASE_ANON_KEY não definida. Adicione ao backend/.env."
    );
  }
  return createClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      global: {
        headers: userAccessToken
          ? { Authorization: `Bearer ${userAccessToken}` }
          : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

module.exports = { createServerClient };
