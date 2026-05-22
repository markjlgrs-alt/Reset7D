"use strict";

/**
 * Helpers de resposta HTTP — Reset 7D Backend
 *
 * Centraliza todos os status de erro para garantir que detalhes
 * internos (stack traces, nomes de tabelas, queries) nunca vazem
 * ao cliente. O campo `error` é um código de máquina; `message`
 * é a string legível ao usuário.
 *
 * Uso:
 *   return badRequest(res, "INVALID_EMAIL", "E-mail inválido.");
 *   return unauthorized(res);           // usa default
 *   return forbidden(res);
 */

function badRequest(res, code = "BAD_REQUEST", message = "Requisição inválida.") {
  return res.status(400).json({ error: code, message });
}

function unauthorized(res, code = "UNAUTHORIZED", message = "Autenticação necessária.") {
  return res.status(401).json({ error: code, message });
}

function forbidden(res, code = "FORBIDDEN", message = "Acesso negado.") {
  return res.status(403).json({ error: code, message });
}

function notFound(res, code = "NOT_FOUND", message = "Recurso não encontrado.") {
  return res.status(404).json({ error: code, message });
}

function conflict(res, code = "CONFLICT", message = "Conflito de dados.") {
  return res.status(409).json({ error: code, message });
}

// Nunca inclua `err` no response — apenas logue no servidor.
function serverError(res, code = "INTERNAL_ERROR", message = "Erro interno. Tente novamente.") {
  return res.status(500).json({ error: code, message });
}

function serviceUnavailable(res, code = "SERVICE_UNAVAILABLE", message = "Serviço indisponível.") {
  return res.status(503).json({ error: code, message });
}

module.exports = {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  serviceUnavailable,
};
