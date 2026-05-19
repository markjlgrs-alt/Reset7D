// ── Configuração ─────────────────────────────────────────────
const BACKEND_URL = window.location.hostname === "localhost" ? "http://localhost:3001" : "";

// ── Estado global ─────────────────────────────────────────────
let pendingResetToken = "";
let loggedInUser      = null;

// ── Elementos DOM ─────────────────────────────────────────────
const loginContainer    = document.getElementById("login-form");
const registerContainer = document.getElementById("register-form");
const forgotContainer   = document.getElementById("forgot-password-form");
const resetContainer    = document.getElementById("reset-password-form");
const dashboardEl       = document.getElementById("dashboard");

const loginForm    = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm   = document.getElementById("forgotPasswordForm");
const resetForm    = document.getElementById("resetPasswordForm");

const forgotLink            = document.getElementById("forgot-password-link");
const registerLink          = document.getElementById("register-link");
const backToLogin           = document.getElementById("back-to-login");
const backToLoginFromForgot = document.getElementById("back-to-login-from-forgot");
const backToLoginFromReset  = document.getElementById("back-to-login-from-reset");
const logoutBtn             = document.getElementById("logout");

const resetMessage        = document.getElementById("reset-message");
const resetConfirmMessage = document.getElementById("reset-confirm-message");

// ── Toast notification ────────────────────────────────────────
function showToast(msg, type = "success") {
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = "toast toast-" + type;
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f43f5e"};
    color:white; padding:12px 24px; border-radius:12px; font-size:14px;
    font-weight:600; z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,0.25);
    transition:opacity .3s; opacity:1; white-space:nowrap;
  `;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

// ── Loading ───────────────────────────────────────────────────
function setLoading(btn, loading, originalText) {
  btn.disabled  = loading;
  btn.textContent = loading ? "Aguarde..." : originalText;
}

// ── Navegação ─────────────────────────────────────────────────
function showForm(form) {
  [loginContainer, registerContainer, forgotContainer, resetContainer, dashboardEl]
    .forEach(el => el.classList.add("hidden"));
  form.classList.remove("hidden");
}

registerLink.addEventListener("click", e => { e.preventDefault(); showForm(registerContainer); });
backToLogin.addEventListener("click",  e => { e.preventDefault(); showForm(loginContainer); });
forgotLink.addEventListener("click",   e => { e.preventDefault(); showForm(forgotContainer); });
backToLoginFromForgot.addEventListener("click", e => { e.preventDefault(); showForm(loginContainer); });
backToLoginFromReset.addEventListener("click",  e => { e.preventDefault(); showForm(loginContainer); });
logoutBtn.addEventListener("click", () => { loggedInUser = null; showForm(loginContainer); });

// ── Login ─────────────────────────────────────────────────────
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email    = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const btn  = loginForm.querySelector("button[type=submit]");
  const orig = btn.textContent;

  setLoading(btn, true, orig);
  try {
    const res  = await fetch(`${BACKEND_URL}/api/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "E-mail ou senha incorretos.", "error");
      loginForm.classList.add("shake");
      setTimeout(() => loginForm.classList.remove("shake"), 400);
      return;
    }

    loggedInUser = data;
    showForm(dashboardEl);
    const nameEl = document.getElementById("dashboard-name");
    if (nameEl) nameEl.textContent = data.name || email;
  } catch {
    showToast("Não foi possível conectar ao servidor.", "error");
  } finally {
    setLoading(btn, false, orig);
  }
});

// ── Registro ──────────────────────────────────────────────────
registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("reg-email").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value;
  const btn  = registerForm.querySelector("button[type=submit]");
  const orig = btn.textContent;

  setLoading(btn, true, orig);
  try {
    const res  = await fetch(`${BACKEND_URL}/api/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Erro ao criar conta.", "error");
      return;
    }

    showToast("Conta criada com sucesso!", "success");
    setTimeout(() => showForm(loginContainer), 1200);
  } catch {
    showToast("Não foi possível conectar ao servidor.", "error");
  } finally {
    setLoading(btn, false, orig);
  }
});

// ── Esqueci a senha ───────────────────────────────────────────
forgotForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("reset-email").value.trim().toLowerCase();
  const btn   = forgotForm.querySelector("button[type=submit]");
  const orig  = btn.textContent;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Digite um e-mail válido.", "error");
    return;
  }

  setLoading(btn, true, orig);
  resetMessage.textContent = "";

  try {
    const res  = await fetch(`${BACKEND_URL}/api/send-recovery-email`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMap = {
        RESEND_NOT_CONFIGURED: "Resend não configurado. Verifique backend/.env.",
        DOMAIN_NOT_VERIFIED:   "Domínio do remetente não verificado no Resend.",
        INVALID_API_KEY:       "API Key inválida no Resend.",
        RATE_LIMIT_EXCEEDED:   "Muitas tentativas. Tente novamente em 5 minutos.",
      };
      throw new Error(errMap[data.error] || data.message || "Falha ao enviar e-mail.");
    }

    resetMessage.textContent = `✓ Link de recuperação enviado para ${email}. Verifique sua caixa de entrada (e o spam).`;
    resetMessage.style.color = "#10b981";
    showToast("E-mail enviado! Verifique sua caixa de entrada.", "success");
  } catch (err) {
    if (err.message === "Failed to fetch") {
      resetMessage.textContent = "Backend offline. Rode npm start em backend/.";
    } else {
      resetMessage.textContent = "⚠️ " + (err.message || "Erro ao enviar e-mail.");
    }
    resetMessage.style.color = "#ef4444";
  } finally {
    setLoading(btn, false, orig);
  }
});

// ── Redefinir senha ───────────────────────────────────────────
resetForm.addEventListener("submit", async e => {
  e.preventDefault();
  const newPassword     = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const btn  = resetForm.querySelector("button[type=submit]");
  const orig = btn.textContent;

  if (!pendingResetToken) {
    showToast("Sessão expirada. Solicite um novo link.", "error");
    showForm(forgotContainer);
    return;
  }

  if (newPassword.length < 6) {
    showToast("A senha deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("As senhas não conferem.", "error");
    resetConfirmMessage.textContent = "⚠️ As senhas não conferem.";
    resetConfirmMessage.style.color = "#ef4444";
    return;
  }

  setLoading(btn, true, orig);
  try {
    const res  = await fetch(`${BACKEND_URL}/api/reset-password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token: pendingResetToken, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.error === "TOKEN_EXPIRED"
        ? "Link expirado. Solicite um novo."
        : data.message || "Erro ao redefinir senha.";
      showToast(msg, "error");
      if (data.error === "TOKEN_EXPIRED" || data.error === "INVALID_TOKEN") {
        showForm(forgotContainer);
      }
      return;
    }

    pendingResetToken = "";
    resetConfirmMessage.textContent = "✓ Senha redefinida com sucesso!";
    resetConfirmMessage.style.color = "#10b981";
    showToast("Senha redefinida! Faça login com a nova senha.", "success");
    window.history.replaceState({}, "", window.location.pathname);
    setTimeout(() => showForm(loginContainer), 2000);
  } catch {
    showToast("Não foi possível conectar ao servidor.", "error");
  } finally {
    setLoading(btn, false, orig);
  }
});

// ── Token na URL (?reset=TOKEN) ───────────────────────────────
(function handleResetToken() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get("reset");
  if (!token) return;

  pendingResetToken = token;
  resetConfirmMessage.textContent = "Digite e confirme sua nova senha.";
  resetConfirmMessage.style.color = "#9c8a94";
  showForm(resetContainer);
  window.history.replaceState({}, "", window.location.pathname);
})();
