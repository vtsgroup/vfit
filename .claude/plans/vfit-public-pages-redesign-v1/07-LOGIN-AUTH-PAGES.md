# 07 — Redesign: Login e Páginas de Autenticação

> Especificação completa para todas as telas de auth do VFIT  
> VFIT | Abril 2026

---

## 🎯 Objetivo do Redesign

A página de login é **a primeira tela do produto** que um usuário vê após decidir se inscrever. Atualmente parece genérica — o redesign visa:

1. Reforçar a identidade VFIT antes do usuário entrar no produto
2. Reduzir fricção (menos campos, validação inline, loading states)
3. Aumentar confiança (social proof, CNPJ visível)
4. Mobile-first — maioria acessa pelo celular

---

## 🔐 Página de LOGIN (/login)

### Layout

```
Desktop (> 768px): Split-screen 60/40
┌─────────────────────────┬────────────────────┐
│                         │                    │
│   PAINEL DA MARCA       │   PAINEL DO FORM   │
│   (background escuro)   │   (card branco)    │
│                         │                    │
│   Logo VFIT             │   ENTRAR NO VFIT   │
│                         │                    │
│   "Seu negócio.         │   Email ________   │
│    Sua evolução."       │   Senha ________   │
│                         │                    │
│   • 2.500+ personais    │   [ENTRAR]         │
│   • IA nativa           │                    │
│   • Cobranças automáticas│  Esqueceu a senha?│
│                         │                    │
│   [Número animado]      │  ─── ou ───        │
│   personais ativos agora│                    │
│                         │  [Google Sign In]  │
│                         │                    │
│                         │  Não tem conta?    │
│                         │  Criar conta grátis│
└─────────────────────────┴────────────────────┘

Mobile (≤ 768px): Card único centralizado, brand panel oculto
```

### HTML Completo

```html
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entrar | VFIT</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
</head>
<body class="auth-page">

  <!-- Painel da Marca (desktop only) -->
  <aside class="auth-brand-panel" aria-hidden="true">
    <div class="auth-brand-content">

      <!-- Logo -->
      <svg class="auth-logo" width="120" height="38" viewBox="0 0 128 40" fill="none" aria-label="VFIT">
        <path d="M5 7 L18 31 L31 7" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 7 L18 22 L25 7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="27" font-family="Cabinet Grotesk,sans-serif" font-weight="800" font-size="24" letter-spacing="-0.5" fill="white">VFIT</text>
      </svg>

      <h1 class="auth-brand-headline">
        Seu negócio.<br>
        <span class="text-green">Sua evolução.</span>
      </h1>

      <p class="auth-brand-sub">
        A plataforma que mais cresce entre personal trainers no Brasil.
      </p>

      <!-- Bullets de benefícios -->
      <ul class="auth-benefits">
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Treinos personalizados com IA
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Cobranças automáticas via PIX
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Avaliações físicas e relatórios
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Gamificação para reter alunos
        </li>
      </ul>

      <!-- Social Proof -->
      <div class="auth-social-proof">
        <span class="auth-counter" data-target="2500">2.500</span>+
        <span class="auth-counter-label">personais ativos agora</span>
      </div>

    </div>
  </aside>

  <!-- Painel do Formulário -->
  <main class="auth-form-panel">
    <div class="auth-card">

      <!-- Logo mobile only -->
      <svg class="auth-logo-mobile" width="100" height="32" viewBox="0 0 128 40" fill="none" aria-label="VFIT">
        <path d="M5 7 L18 31 L31 7" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 7 L18 22 L25 7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="27" font-family="Cabinet Grotesk,sans-serif" font-weight="800" font-size="24" letter-spacing="-0.5" fill="currentColor">VFIT</text>
      </svg>

      <h2 class="auth-form-title">Entrar no VFIT</h2>
      <p class="auth-form-sub">Bem-vindo de volta 👋</p>

      <form class="auth-form" id="loginForm" novalidate>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input
              class="form-input"
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            >
          </div>
          <span class="form-error" id="emailError" role="alert" aria-live="polite"></span>
        </div>

        <!-- Senha -->
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label" for="password">Senha</label>
            <a href="/forgot-password" class="form-label-link">Esqueceu a senha?</a>
          </div>
          <div class="input-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              class="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="Sua senha"
              autocomplete="current-password"
              required
            >
            <button type="button" class="input-toggle-password" aria-label="Mostrar senha" id="togglePassword">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <span class="form-error" id="passwordError" role="alert" aria-live="polite"></span>
        </div>

        <!-- Botão Submit -->
        <button type="submit" class="btn btn-primary btn-full" id="submitBtn">
          <span class="btn-text">Entrar</span>
          <svg class="btn-spinner hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </button>

        <!-- Divisor -->
        <div class="auth-divider">
          <span>ou continue com</span>
        </div>

        <!-- Google -->
        <button type="button" class="btn btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar com Google
        </button>

      </form>

      <p class="auth-footer-link">
        Ainda não tem conta?
        <a href="/register">Criar conta grátis →</a>
      </p>

      <p class="auth-legal">
        Ao entrar, você concorda com os
        <a href="/termos" target="_blank">Termos de Uso</a> e
        <a href="/privacidade" target="_blank">Política de Privacidade</a>
      </p>

    </div>
  </main>

</body>
</html>
```

### CSS da Página de Login

```css
/* === AUTH LAYOUT === */
.auth-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: var(--color-bg);
  font-family: var(--font-body, 'Satoshi', sans-serif);
}

/* === BRAND PANEL === */
.auth-brand-panel {
  background:
    radial-gradient(ellipse 80% 60% at 0% 50%, rgba(22,163,74,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 80% at 100% 10%, rgba(22,163,74,0.06) 0%, transparent 50%),
    #0a0a0a;
  padding: var(--space-16) var(--space-12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.auth-brand-content {
  max-width: 420px;
  z-index: 1;
}
.auth-logo { margin-bottom: var(--space-10); }
.auth-brand-headline {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 800;
  color: #f2f2f2;
  line-height: 1.15;
  margin-bottom: var(--space-4);
}
.text-green { color: #16a34a; }
.auth-brand-sub {
  font-size: 1rem;
  color: #888888;
  margin-bottom: var(--space-8);
  line-height: 1.6;
}
.auth-benefits {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-10);
}
.auth-benefits li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.9375rem;
  color: #cccccc;
}
.auth-social-proof {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  background: rgba(22,163,74,0.1);
  border: 1px solid rgba(22,163,74,0.2);
  border-radius: var(--radius-xl);
  width: fit-content;
}
.auth-counter {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: #22c55e;
}
.auth-counter-label {
  font-size: 0.875rem;
  color: #888888;
}

/* === FORM PANEL === */
.auth-form-panel {
  background: var(--color-surface, #111111);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  border-left: 1px solid rgba(255,255,255,0.06);
}
.auth-card { width: 100%; max-width: 380px; }
.auth-logo-mobile { display: none; margin-bottom: var(--space-8); }
.auth-form-title {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f2f2f2;
  margin-bottom: var(--space-1);
}
.auth-form-sub {
  font-size: 0.9375rem;
  color: #888888;
  margin-bottom: var(--space-8);
}
.auth-form { display: flex; flex-direction: column; gap: var(--space-5); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: 0.875rem; font-weight: 600; color: #999999; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; }
.form-label-link { font-size: 0.8125rem; color: #16a34a; text-decoration: none; }
.form-label-link:hover { color: #22c55e; }

/* Input */
.input-wrapper { position: relative; }
.form-input {
  width: 100%;
  background: #161616;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: #f2f2f2;
  font-size: 0.9375rem;
  min-height: 44px;
  transition: border-color 180ms, box-shadow 180ms;
}
.form-input::placeholder { color: #444444; }
.form-input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
}
.form-input.error { border-color: #ef4444; }
.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #555555;
  pointer-events: none;
}
.input-toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #555555;
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-1);
  min-height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.input-toggle-password:hover { color: #888888; }
.form-error { font-size: 0.8125rem; color: #f87171; min-height: 1rem; }

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Satoshi', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  transition: all 180ms cubic-bezier(0.16,1,0.3,1);
  text-decoration: none;
}
.btn-primary { background: #16a34a; color: #fff; }
.btn-primary:hover { background: #22c55e; box-shadow: 0 0 20px rgba(22,163,74,0.3); }
.btn-full { width: 100%; }
.btn-google {
  width: 100%;
  background: transparent;
  color: #f2f2f2;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
}
.btn-google:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.18); }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.btn-spinner { animation: spin 0.8s linear infinite; }
.btn-spinner.hidden { display: none; }

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: #444444;
  font-size: 0.8125rem;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.06);
}

/* Footer links */
.auth-footer-link {
  text-align: center;
  font-size: 0.875rem;
  color: #888888;
  margin-top: var(--space-6);
}
.auth-footer-link a { color: #16a34a; text-decoration: none; font-weight: 600; }
.auth-footer-link a:hover { color: #22c55e; }
.auth-legal {
  text-align: center;
  font-size: 0.75rem;
  color: #444444;
  margin-top: var(--space-4);
  line-height: 1.5;
}
.auth-legal a { color: #666666; text-decoration: underline; }

/* === MOBILE === */
@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-brand-panel { display: none; }
  .auth-form-panel { padding: var(--space-6) var(--space-4); align-items: flex-start; padding-top: var(--space-12); }
  .auth-logo-mobile { display: block; }
}
```

### JavaScript de Validação

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // Toggle senha
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.setAttribute('aria-label', type === 'password' ? 'Mostrar senha' : 'Ocultar senha');
  });

  // Validação inline
  function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add('error');
    document.getElementById(errorId).textContent = message;
  }
  function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove('error');
    document.getElementById(errorId).textContent = '';
  }

  document.getElementById('email').addEventListener('blur', (e) => {
    const val = e.target.value.trim();
    if (!val) showError('email', 'emailError', 'Email é obrigatório');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) showError('email', 'emailError', 'Email inválido');
    else clearError('email', 'emailError');
  });

  // Loading state no submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = submitBtn;
    btn.querySelector('.btn-text').textContent = 'Entrando...';
    btn.querySelector('.btn-spinner').classList.remove('hidden');
    btn.disabled = true;
    // Aqui: chamar API de login
    // Em caso de erro: resetar estado do botão e mostrar erro inline
  });
});
```

---

## 📋 Checklist de Todas as Páginas Auth

| Página | Rota | Prioridade | Status |
|--------|------|------------|--------|
| Login | `/login` | 🔴 Alta | Redesign completo |
| Cadastro Personal | `/register` | 🔴 Alta | Fluxo 3 etapas |
| Cadastro Aluno | `/register?type=student` | 🟡 Média | Fluxo simplificado |
| Cadastro c/ plano | `/register?plan=pro` | 🟡 Média | Plano pré-selecionado |
| Esqueci senha | `/forgot-password` | 🔴 Alta | Tela simples |
| Nova senha | `/reset-password` | 🔴 Alta | Com validação de força |
| Verificar email | `/verify-email` | 🟡 Média | Criar se não existe |
| Onboarding | `/welcome` | 🟡 Média | Melhorar fluxo |

---

## 🔑 Esqueci Senha (/forgot-password)

```
Layout: Card centralizado simples (sem split screen)
Conteúdo:
- Logo VFIT
- H1: "Recuperar acesso"
- Subtítulo: "Informe seu email para receber o link de redefinição"
- Campo: Email
- Botão: "Enviar link de redefinição"
- Estado de sucesso: mensagem inline verde com instrução
- Link: "← Voltar para o login"
```

---

## 💪 Nova Senha (/reset-password)

```
Layout: Card centralizado simples
Conteúdo:
- Logo VFIT
- H1: "Criar nova senha"
- Campo: Nova senha (com indicador de força)
- Campo: Confirmar nova senha
- Indicador de força de senha:
  Fraca → Média → Forte → Muito forte
  (baseado em comprimento + caracteres especiais + números)
- Botão: "Redefinir senha"
- Estado de sucesso: "Senha redefinida! Redirecionando..."
```

### Indicador de Força

```javascript
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ['', 'Fraca', 'Média', 'Forte', 'Muito forte'];
  const colors = ['', '#ef4444', '#f59e0b', '#16a34a', '#22c55e'];
  return { score: Math.min(score, 4), label: levels[Math.min(score,4)], color: colors[Math.min(score,4)] };
}
```
