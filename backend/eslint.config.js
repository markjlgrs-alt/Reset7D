// eslint.config.js — Reset 7D Backend (ESLint v9 flat config)
//
// Objetivos de segurança:
//  1. Garantir que apenas lib/env.js leia process.env (centralização de secrets).
//  2. Detectar uso de eval (execução de código arbitrário).
//  3. Estilo consistente (eqeqeq, no-unused-vars).
//
// NOTA: Este projeto é um backend Express.js puro, não Next.js.
// Os conceitos "use client" e o pacote npm "server-only" não se aplicam.
// A proteção server-only é feita via runtime guard (typeof window !== "undefined")
// em cada arquivo de backend.

"use strict";

const js = require("@eslint/js");

// Globals Node.js — aplicados a todos os arquivos
const NODE_GLOBALS = {
  require:      "readonly",
  module:       "readonly",
  exports:      "writable",
  __dirname:    "readonly",
  __filename:   "readonly",
  process:      "readonly",
  console:      "readonly",
  Buffer:       "readonly",
  setTimeout:   "readonly",
  clearTimeout: "readonly",
  setInterval:  "readonly",
  clearInterval:"readonly",
  Promise:      "readonly",
  URL:          "readonly",
  URLSearchParams:"readonly",
  window:       "readonly",   // existe no guard de runtime (typeof window)
};

module.exports = [
  // Ignora node_modules globalmente
  { ignores: ["node_modules/**", "eslint.config.js"] },

  // Base recomendada
  {
    ...js.configs.recommended,
    files: ["**/*.js"],
  },

  // ── Config base: globals Node.js para todos os arquivos ────────────────────
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType:  "commonjs",
      globals:     NODE_GLOBALS,
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern:  "^_",   // args prefixados com _ são aceitos
          caughtErrors:       "all",
          caughtErrorsIgnorePattern: "^_", // catch (_err) aceito
          varsIgnorePattern:  "^_",
        },
      ],
      "eqeqeq":         ["error", "always"],
      "no-eval":        "error",
      "no-implied-eval":"error",
      "no-console":     "off",
    },
  },

  // ── Regra de segurança: apenas lib/env.js pode ler process.env ────────────
  // Todos os outros arquivos devem importar serverEnv / publicEnv de lib/env.js.
  // Isso garante que secrets passem pela validação de startup.
  // Exceções:
  //  - lib/env.js: é quem centraliza as leituras
  //  - lib/logger.js: lê NODE_ENV (não é secret; exceção documentada)
  {
    files: ["**/*.js"],
    ignores: [
      "node_modules/**",
      "lib/env.js",     // único arquivo autorizado a ler secrets de process.env
      "lib/logger.js",  // lê NODE_ENV (não é secret — ver comentário em logger.js)
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Bloqueia process.env.QUALQUER_COISA
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            "[SECURITY] Acesse variáveis de ambiente APENAS via require('./lib/env'). " +
            "process.env direto não passa pela validação de startup e pode expor secrets.",
        },
      ],
    },
  },
];
