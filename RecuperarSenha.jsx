// ════════════════════════════════════════════════════════════════
// RESET 7D — RECUPERAÇÃO DE SENHA (FLUXO COMPLETO)
// Adicione este bloco ao seu arquivo principal, após makeCSS()
// ════════════════════════════════════════════════════════════════

// ── 1. CSS EXTRA ─────────────────────────────────────────────────
// Cole o retorno desta função DENTRO de makeCSS(th), junto com o CSS existente:
//
//   const makeCSS = (th) => `
//     ...seu CSS atual...
//     ${makeRecoveryCSS(th)}
//   `;

const makeRecoveryCSS = (th) => `
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes checkPop{0%{transform:scale(0) rotate(-20deg);opacity:0;}65%{transform:scale(1.25) rotate(5deg);opacity:1;}100%{transform:scale(1) rotate(0deg);opacity:1;}}
@keyframes pulse-ring{0%{transform:scale(0.9);opacity:.8;}50%{transform:scale(1.05);opacity:1;}100%{transform:scale(0.9);opacity:.8;}}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.35);border-top:2px solid #fff;border-radius:50%;animation:spin .65s linear infinite;vertical-align:middle;}
.inp-wrap{position:relative;}
.eye-btn{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;font-size:15px;color:${th.text3};line-height:1;}
.eye-btn:hover{color:${th.text2};}
.pass-bar{height:5px;border-radius:99px;transition:width .45s ease,background .45s ease;}
.pass-bar-track{height:5px;border-radius:99px;background:${th.border};overflow:hidden;margin-top:8px;}
.step-track{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:28px;}
.step-seg{height:5px;border-radius:99px;transition:all .4s ease;}
.req-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
.req-icon{font-size:12px;width:16px;text-align:center;flex-shrink:0;}
.req-label{font-size:12px;transition:color .25s;}
.recovery-tip{background:${th.card2};border:1.5px solid ${th.border};border-radius:14px;padding:14px 16px;}
.resent-toast{background:${th.greenL};border:1px solid rgba(16,185,129,.35);border-radius:12px;padding:10px 14px;margin-bottom:12px;text-align:center;}
.step-list-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:9px;}
.step-num{width:22px;height:22px;border-radius:50%;background:${th.primaryL};border:1.5px solid ${th.border2};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:700;color:${th.primary};}
.check-circle{width:84px;height:84px;border-radius:50%;background:${th.greenL};border:2.5px solid ${th.green};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:38px;animation:checkPop .55s ease forwards,pulse-ring 2.5s ease-in-out 0.6s infinite;}
.email-badge{background:${th.primaryL};border:1.5px solid ${th.border2};border-radius:12px;padding:9px 18px;display:inline-block;margin-bottom:20px;}
.divider-text{display:flex;align-items:center;gap:10px;margin:14px 0;}
.divider-text::before,.divider-text::after{content:'';flex:1;height:1px;background:${th.border};}
.divider-text span{font-size:11px;color:${th.text3};white-space:nowrap;}
`;

// ── 2. COMPONENTES AUXILIARES ─────────────────────────────────────

// Barra de progresso de etapas (3 segmentos)
function StepIndicator({ step, th }) {
  const segs = [1, 2, 3];
  return (
    <div className="step-track">
      {segs.map((s, i) => (
        <div
          key={s}
          className="step-seg"
          style={{
            width: step === s ? "40px" : "20px",
            background: step > s ? th.green : step === s ? th.primary : th.border,
          }}
        />
      ))}
    </div>
  );
}

// Medidor de força de senha
function PasswordStrengthBar({ password, th }) {
  const getStrength = (pwd) => {
    if (!pwd) return null;
    const criteria = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
    ];
    const score = criteria.filter(Boolean).length;
    if (score <= 1) return { pct: 25, label: "Muito fraca", color: "#ef4444" };
    if (score === 2) return { pct: 50, label: "Razoável",   color: th.accent };
    if (score === 3) return { pct: 75, label: "Boa",        color: "#22c55e" };
    return              { pct: 100, label: "Forte 💪",    color: th.green };
  };

  const s = getStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <div className="pass-bar-track">
        <div className="pass-bar" style={{ width: `${s.pct}%`, background: s.color }} />
      </div>
      <p style={{ fontSize: "11px", color: s.color, fontWeight: "700", marginTop: "4px" }}>
        Senha {s.label}
      </p>
    </div>
  );
}

// ── 3. TELA 1 — ESQUECI MINHA SENHA ──────────────────────────────

function ForgotPasswordScreen({ th, onBack, onSubmit }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const validate = () => {
    if (!email.trim())                          { setError("Digite seu e-mail."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("E-mail inválido. Verifique e tente novamente."); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    // Simulação de requisição à API — substitua pelo seu endpoint real
    setTimeout(() => { setLoading(false); onSubmit(email.trim().toLowerCase()); }, 1800);
  };

  return (
    <div
      className="fade"
      style={{
        minHeight: "100vh", background: th.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        className="glass slide-up"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "26px", padding: "36px 28px" }}
      >
        <StepIndicator step={1} th={th} />

        {/* Voltar */}
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: th.text3, marginBottom: "22px",
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "13px", fontFamily: "'Nunito',sans-serif", padding: 0,
          }}
        >
          ← Voltar ao login
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "54px", marginBottom: "12px" }}>🔑</div>
          <h2
            className="serif"
            style={{ fontSize: "28px", color: th.text, marginBottom: "10px", lineHeight: "1.2" }}
          >
            Recuperar Senha
          </h2>
          <p style={{ fontSize: "14px", color: th.text3, lineHeight: "1.65" }}>
            Digite o e-mail vinculado à sua conta e enviaremos um link de recuperação.
          </p>
        </div>

        {/* Campo e-mail */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block", fontSize: "11px", fontWeight: "700",
              letterSpacing: "0.5px", color: th.text2, marginBottom: "7px",
            }}
          >
            E-MAIL CADASTRADO
          </label>
          <input
            className="inp"
            type="email"
            placeholder="seu@email.com"
            value={email}
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ fontSize: "15px" }}
          />
          {error && (
            <p style={{ fontSize: "12px", color: th.primary, marginTop: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Botão enviar */}
        <button
          className="btn-p"
          onClick={handleSubmit}
          disabled={loading}
          style={{ fontSize: "15px", padding: "14px", marginBottom: "20px" }}
        >
          {loading
            ? <><span className="spinner" style={{ marginRight: "8px" }} /> Enviando...</>
            : "Enviar link de recuperação →"
          }
        </button>

        {/* Dica */}
        <div className="recovery-tip">
          <p style={{ fontSize: "12px", color: th.text3, lineHeight: "1.65" }}>
            💡 <strong style={{ color: th.text2 }}>Não lembra o e-mail?</strong>{" "}
            Entre em contato pelo suporte que verificamos sua conta manualmente.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 4. TELA 2 — E-MAIL ENVIADO ────────────────────────────────────

function EmailSentScreen({ th, email, onBack, onResend, onSimulateLink }) {
  const [cooldown, setCooldown]     = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [justResent, setJustResent]  = useState(false);

  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    const count = resendCount + 1;
    setResendCount(count);
    setJustResent(true);
    onResend && onResend();
    startCooldown(count >= 2 ? 120 : 60);
    setTimeout(() => setJustResent(false), 3200);
  };

  return (
    <div
      className="fade"
      style={{
        minHeight: "100vh", background: th.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        className="glass slide-up"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "26px", padding: "36px 28px", textAlign: "center" }}
      >
        <StepIndicator step={2} th={th} />

        <div style={{ fontSize: "60px", marginBottom: "14px" }}>📬</div>

        <h2 className="serif" style={{ fontSize: "28px", color: th.text, marginBottom: "10px" }}>
          Verifique seu e-mail
        </h2>
        <p style={{ fontSize: "14px", color: th.text3, lineHeight: "1.65", marginBottom: "16px" }}>
          Enviamos as instruções de recuperação para:
        </p>

        <div className="email-badge">
          <span style={{ fontSize: "14px", color: th.primary, fontWeight: "700" }}>{email}</span>
        </div>

        {/* Próximos passos */}
        <div
          style={{
            background: th.card2, border: `1px solid ${th.border}`,
            borderRadius: "16px", padding: "18px 16px",
            marginBottom: "20px", textAlign: "left",
          }}
        >
          <p style={{ fontSize: "12px", color: th.text2, fontWeight: "700", marginBottom: "12px", letterSpacing: "0.4px" }}>
            PRÓXIMOS PASSOS:
          </p>
          {[
            "Abra o e-mail de recuperação",
            "Clique em 'Redefinir minha senha'",
            "Crie uma senha nova e segura",
            "Faça login normalmente",
          ].map((step, i) => (
            <div key={i} className="step-list-row">
              <div className="step-num">{i + 1}</div>
              <span style={{ fontSize: "13px", color: th.text3, lineHeight: "1.5" }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Toast de reenvio */}
        {justResent && (
          <div className="resent-toast fade">
            <p style={{ fontSize: "13px", color: th.green, fontWeight: "700" }}>
              ✓ E-mail reenviado com sucesso!
            </p>
          </div>
        )}

        {/* Botão reenviar */}
        <button
          className="btn-s"
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{ width: "100%", marginBottom: "10px", fontSize: "14px" }}
        >
          {cooldown > 0 ? `🔄 Reenviar em ${cooldown}s` : "🔄 Reenviar e-mail"}
        </button>

        <div className="divider-text">
          <span>ou para testar o fluxo</span>
        </div>

        {/* Botão demo — simula clique no link do e-mail */}
        <button
          className="btn-g"
          onClick={onSimulateLink}
          style={{ width: "100%", marginBottom: "18px", fontSize: "14px" }}
        >
          🔗 Acessar link de redefinição (demo)
        </button>

        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: th.text3, fontSize: "13px", textDecoration: "underline",
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          ← Voltar ao login
        </button>

        <p style={{ fontSize: "11px", color: th.text3, marginTop: "16px" }}>
          ⏱️ O link expira em <strong>30 minutos</strong> · Verifique também o spam
        </p>
      </div>
    </div>
  );
}

// ── 5. TELA 3 — NOVA SENHA ────────────────────────────────────────

function ResetPasswordScreen({ th, onSuccess, onCancel }) {
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});

  const requirements = [
    { label: "Mínimo 8 caracteres",       ok: password.length >= 8 },
    { label: "Letra maiúscula (A–Z)",      ok: /[A-Z]/.test(password) },
    { label: "Número (0–9)",              ok: /[0-9]/.test(password) },
    { label: "Caractere especial (!@#$)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const validate = () => {
    const e = {};
    if (password.length < 8)             e.password = "Mínimo 8 caracteres";
    else if (!/[A-Z]/.test(password) && !/[0-9]/.test(password))
                                          e.password = "Use letras maiúsculas ou números";
    if (!confirm)                         e.confirm = "Confirme sua nova senha";
    else if (password !== confirm)        e.confirm = "As senhas não conferem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    // Simulação — substitua pela chamada real à API
    setTimeout(() => { setLoading(false); onSuccess(); }, 1800);
  };

  const matchOk = confirm.length > 0 && password === confirm;

  return (
    <div
      className="fade"
      style={{
        minHeight: "100vh", background: th.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        className="glass slide-up"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "26px", padding: "36px 28px" }}
      >
        <StepIndicator step={3} th={th} />

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "54px", marginBottom: "12px" }}>🔐</div>
          <h2 className="serif" style={{ fontSize: "28px", color: th.text, marginBottom: "10px", lineHeight: "1.2" }}>
            Crie nova senha
          </h2>
          <p style={{ fontSize: "14px", color: th.text3, lineHeight: "1.65" }}>
            Escolha uma senha forte para proteger sua conta.
          </p>
        </div>

        {/* Campo nova senha */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: th.text2, marginBottom: "7px" }}>
            NOVA SENHA
          </label>
          <div className="inp-wrap">
            <input
              className="inp"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              autoComplete="new-password"
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              style={{ paddingRight: "44px" }}
            />
            <button
              className="eye-btn"
              type="button"
              onClick={() => setShowPass((v) => !v)}
              title={showPass ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          <PasswordStrengthBar password={password} th={th} />
          {errors.password && (
            <p style={{ fontSize: "12px", color: th.primary, marginTop: "5px" }}>⚠️ {errors.password}</p>
          )}
        </div>

        {/* Campo confirmar senha */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: th.text2, marginBottom: "7px" }}>
            CONFIRMAR SENHA
          </label>
          <div className="inp-wrap">
            <input
              className="inp"
              type={showConfirm ? "text" : "password"}
              placeholder="Digite novamente"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                paddingRight: "44px",
                borderColor: matchOk ? th.green : errors.confirm ? th.primary : undefined,
              }}
            />
            <button
              className="eye-btn"
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
          {matchOk && (
            <p style={{ fontSize: "12px", color: th.green, marginTop: "5px", fontWeight: "600" }}>✓ Senhas conferem</p>
          )}
          {errors.confirm && (
            <p style={{ fontSize: "12px", color: th.primary, marginTop: "5px" }}>⚠️ {errors.confirm}</p>
          )}
        </div>

        {/* Checklist de requisitos */}
        <div
          style={{
            background: th.card2, border: `1px solid ${th.border}`,
            borderRadius: "14px", padding: "14px 16px", marginBottom: "22px",
          }}
        >
          <p style={{ fontSize: "11px", color: th.text3, fontWeight: "700", letterSpacing: "0.4px", marginBottom: "10px" }}>
            REQUISITOS DE SEGURANÇA:
          </p>
          {requirements.map(({ label, ok }) => (
            <div key={label} className="req-row">
              <span className="req-icon" style={{ color: ok ? th.green : th.text3 }}>
                {ok ? "✓" : "○"}
              </span>
              <span
                className="req-label"
                style={{ color: ok ? th.green : th.text3, fontWeight: ok ? "600" : "400" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Botão salvar */}
        <button
          className="btn-p"
          onClick={handleSubmit}
          disabled={loading}
          style={{ fontSize: "15px", padding: "14px", marginBottom: "12px" }}
        >
          {loading
            ? <><span className="spinner" style={{ marginRight: "8px" }} /> Salvando...</>
            : "Salvar nova senha →"
          }
        </button>

        <button
          onClick={onCancel}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: th.text3, fontSize: "13px", textDecoration: "underline",
            fontFamily: "'Nunito',sans-serif", width: "100%",
          }}
        >
          ← Cancelar
        </button>
      </div>
    </div>
  );
}

// ── 6. TELA 4 — SENHA REDEFINIDA COM SUCESSO ─────────────────────

function PasswordResetSuccessScreen({ th, onLogin }) {
  return (
    <div
      className="fade"
      style={{
        minHeight: "100vh", background: th.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        className="glass slide-up"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "26px", padding: "44px 28px", textAlign: "center" }}
      >
        {/* Ícone animado */}
        <div className="check-circle">✓</div>

        <h2 className="serif" style={{ fontSize: "30px", color: th.text, marginBottom: "12px", lineHeight: "1.2" }}>
          Senha alterada!
        </h2>
        <p style={{ fontSize: "15px", color: th.text3, lineHeight: "1.75", marginBottom: "8px" }}>
          Sua senha foi redefinida com sucesso.
        </p>
        <p style={{ fontSize: "14px", color: th.text3, lineHeight: "1.65", marginBottom: "32px" }}>
          Agora você pode entrar na sua conta usando a nova senha.
        </p>

        {/* Dica de segurança */}
        <div
          style={{
            background: th.greenL, border: "1px solid rgba(16,185,129,.3)",
            borderRadius: "14px", padding: "14px 16px", marginBottom: "28px", textAlign: "left",
          }}
        >
          <p style={{ fontSize: "13px", color: th.green, fontWeight: "700", marginBottom: "6px" }}>
            🛡️ Dica de segurança
          </p>
          <p style={{ fontSize: "12px", color: th.text3, lineHeight: "1.6" }}>
            Nunca compartilhe sua senha. Use senhas únicas para cada serviço e considere usar um gerenciador de senhas.
          </p>
        </div>

        <button
          className="btn-p"
          onClick={onLogin}
          style={{ fontSize: "15px", padding: "14px", width: "100%" }}
        >
          Entrar agora →
        </button>
      </div>
    </div>
  );
}

// ── 7. ORQUESTRADOR DO FLUXO + TELA DE LOGIN ─────────────────────
//
// RecoveryFlow controla qual tela exibir dentro do fluxo de recuperação.
// LoginScreen inclui o link "Esqueci minha senha" que aciona o fluxo.

function RecoveryFlow({ th, onBackToLogin }) {
  // step: "forgot" → "sent" → "reset" → "success"
  const [step, setStep]   = useState("forgot");
  const [email, setEmail] = useState("");

  if (step === "forgot")
    return (
      <ForgotPasswordScreen
        th={th}
        onBack={onBackToLogin}
        onSubmit={(mail) => { setEmail(mail); setStep("sent"); }}
      />
    );

  if (step === "sent")
    return (
      <EmailSentScreen
        th={th}
        email={email}
        onBack={onBackToLogin}
        onResend={() => { /* log, analytics, etc */ }}
        onSimulateLink={() => setStep("reset")}
      />
    );

  if (step === "reset")
    return (
      <ResetPasswordScreen
        th={th}
        onSuccess={() => setStep("success")}
        onCancel={onBackToLogin}
      />
    );

  if (step === "success")
    return (
      <PasswordResetSuccessScreen
        th={th}
        onLogin={onBackToLogin}
      />
    );

  return null;
}

// ─── LoginScreen — tela de login com integração ao RecoveryFlow ───
//
// MODO DE USO:
//   Substitua sua tela de login existente por este componente,
//   ou copie apenas o bloco de estado e o link "Esqueci minha senha".
//
//   Parâmetros necessários:
//     th       → tema atual (ex.: T.dark ou T.light)
//     onLogin  → callback chamado após login bem-sucedido

function LoginScreen({ th, onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [recovering, setRecovering] = useState(false);

  // Se o usuário clicou em "Esqueci minha senha", exibe o fluxo de recuperação
  if (recovering)
    return <RecoveryFlow th={th} onBackToLogin={() => setRecovering(false)} />;

  const handleLogin = () => {
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    setError("");
    // Substitua pelo seu sistema de autenticação real
    setTimeout(() => {
      setLoading(false);
      // Simulação: qualquer senha funciona em demo
      onLogin && onLogin({ email });
    }, 1600);
  };

  return (
    <div
      className="fade"
      style={{
        minHeight: "100vh", background: th.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        className="glass slide-up"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "26px", padding: "40px 28px" }}
      >
        {/* Logo / header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px", height: "64px", borderRadius: "20px",
              background: `linear-gradient(135deg,${th.primary},#fb7185)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 14px",
              boxShadow: `0 8px 24px ${th.primaryL}`,
            }}
          >
            🔥
          </div>
          <h1 className="serif grad-text" style={{ fontSize: "30px", marginBottom: "6px" }}>
            Reset 7D
          </h1>
          <p style={{ fontSize: "14px", color: th.text3 }}>
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Campo e-mail */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: th.text2, marginBottom: "7px" }}>
            E-MAIL
          </label>
          <input
            className="inp"
            type="email"
            placeholder="seu@email.com"
            value={email}
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            style={{ fontSize: "15px" }}
          />
        </div>

        {/* Campo senha */}
        <div style={{ marginBottom: "6px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: th.text2, marginBottom: "7px" }}>
            SENHA
          </label>
          <div className="inp-wrap">
            <input
              className="inp"
              type={showPass ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ paddingRight: "44px", fontSize: "15px" }}
            />
            <button className="eye-btn" type="button" onClick={() => setShowPass((v) => !v)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Link "Esqueci minha senha" ← ponto de entrada do fluxo */}
        <div style={{ textAlign: "right", marginBottom: "18px" }}>
          <button
            onClick={() => setRecovering(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: th.primary, fontSize: "13px", fontWeight: "600",
              fontFamily: "'Nunito',sans-serif", padding: 0,
              textDecoration: "underline",
            }}
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p style={{ fontSize: "13px", color: th.primary, marginBottom: "12px", textAlign: "center" }}>
            ⚠️ {error}
          </p>
        )}

        {/* Botão entrar */}
        <button
          className="btn-p"
          onClick={handleLogin}
          disabled={loading}
          style={{ fontSize: "15px", padding: "14px" }}
        >
          {loading
            ? <><span className="spinner" style={{ marginRight: "8px" }} /> Entrando...</>
            : "Entrar →"
          }
        </button>

        <p style={{ fontSize: "12px", color: th.text3, textAlign: "center", marginTop: "20px", lineHeight: "1.6" }}>
          Ao entrar você concorda com os{" "}
          <span style={{ color: th.primary, cursor: "pointer", textDecoration: "underline" }}>
            termos de uso
          </span>
          .
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// INSTRUÇÕES DE INTEGRAÇÃO
// ════════════════════════════════════════════════════════════════
//
// 1. ADICIONE o CSS ao makeCSS():
//    const makeCSS = (th) => `
//      ...CSS existente...
//      ${makeRecoveryCSS(th)}
//    `;
//
// 2. ADICIONE os componentes acima (todos os function X) ao seu arquivo principal.
//
// 3. NO SEU APP PRINCIPAL, injete o LoginScreen onde quiser exibir o login:
//
//    // Exemplo de uso dentro do componente App:
//    const [screen, setScreen] = useState("login");  // ou "quiz", "home", etc.
//    const th = T[theme];  // seu tema atual
//
//    if (screen === "login") {
//      return <LoginScreen th={th} onLogin={() => setScreen("home")} />;
//    }
//
// 4. SE JÁ TEM TELA DE LOGIN: adicione apenas o estado `recovering`
//    e o link "Esqueci minha senha" conforme demonstrado em LoginScreen acima.
//    O RecoveryFlow é autossuficiente — basta renderizá-lo quando recovering === true.
//
// ════════════════════════════════════════════════════════════════
