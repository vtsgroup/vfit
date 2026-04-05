# 🔐 Biometric Quick Unlock + 🥗 Role Nutricionista — TRACKING

> **Versão**: 0.2.0
> **Última atualização**: 2026-04-05
> **Sprint**: Feature Sprint — Biometria + Nutricionista (Sprint 1-3 parcial)

---

## 📋 Resumo do Plano

### Feature 1: Biometric Quick Unlock
Permitir que após o primeiro login, o usuário ative biometria (fingerprint/FaceID) para desbloquear o app rapidamente nas próximas vezes, sem precisar digitar email/senha novamente.

**Abordagem técnica**: O projeto já possui infraestrutura WebAuthn completa (`@simplewebauthn`). Internamente, o "biometric unlock" usa WebAuthn com `authenticatorAttachment: "platform"` (biometria do dispositivo), mas a UX é apresentada ao usuário como "Login com Biometria" — simples e direto. **NÃO é passkey roaming** (chave sincronizada entre dispositivos).

**Componentes novos:**
1. **BiometricLockScreen** — Tela de desbloqueio que aparece ao abrir o app
2. **BiometricEnrollPrompt** — Prompt melhorado pós-login para ativar biometria
3. **Biometric settings** — Toggle simplificado em Configurações
4. **Auto-trigger** — Ao abrir app, se biometria ativa, prompt automático

### Feature 2: Role Nutricionista
Adicionar `nutricionista` como novo tipo de profissional (igual `personal`), com dashboard focado em nutrição.

**Escopo:**
- DB: Novo user_type `'nutritionist'`, tabela `nutritionists`
- Backend: Registro, login, profile, endpoints de nutrição
- Frontend: Dashboard com sidebar, páginas de pacientes, planos alimentares, avaliações nutricionais
- Admin: Simulação como nutricionista

---

## 🎯 Tasks

### Sprint 1 — Biometric Quick Unlock

- [x] **T1.1** BiometricLockScreen component (tela de desbloqueio ao abrir app) ✅
- [ ] **T1.2** Modificar AuthProvider/SplashScreen para gate biométrico
- [ ] **T1.3** BiometricEnrollPrompt melhorado (pós-login, UX simplificada)
- [ ] **T1.4** Toggle de biometria em Settings (on/off simples)
- [x] **T1.5** Auto-trigger WebAuthn ao abrir app (sem clique) ✅
- [x] **T1.6** Fallback: botão "Usar senha" no lock screen ✅
- [ ] **T1.7** Testar em TWA/PWA/browser

### Sprint 2 — Nutricionista: Fundação

- [x] **T2.1** Migration SQL: ALTER user_type CHECK, CREATE TABLE nutritionists ✅
- [x] **T2.2** Update types.ts: UserType, JWTPayload, Variables ✅
- [ ] **T2.3** Backend: POST /auth/register/nutritionist
- [ ] **T2.4** Backend: GET /auth/me → support nutritionist profile
- [x] **T2.5** Auth middleware: requireType('nutritionist') ✅
- [x] **T2.6** Frontend types: auth-store UserType + NutritionistProfile ✅
- [x] **T2.7** AuthGuard: suporte 'nutritionist' ✅
- [ ] **T2.8** Complete profile flow para nutricionista (CRN em vez de CREF)

### Sprint 3 — Nutricionista: Dashboard & Nav

- [x] **T3.1** Sidebar: nutritionistNavigation (novo array de navegação) ✅
- [x] **T3.2** Mobile nav: nutritionist items ✅
- [x] **T3.3** Admin simulation: adicionar mode 'nutritionist' ✅
- [ ] **T3.4** Dashboard home: NutritionistDashboard component (backend pronto, falta frontend)
- [x] **T3.5** Página: /dashboard/patients (gestão de pacientes) ✅
- [x] **T3.6** Página: /dashboard/meal-plans (planos alimentares) ✅
- [x] **T3.7** Página: /dashboard/nutrition-assessments (avaliações nutricionais) ✅
- [ ] **T3.8** Hooks: useNutritionistDashboard, usePatients, useMealPlans

### Sprint 4 — Nutricionista: Features Específicas

- [x] **T4.1** Backend: CRUD patients (equivalente a students) ✅
- [x] **T4.2** Backend: CRUD meal_plans ✅
- [x] **T4.3** Backend: CRUD nutrition_assessments ✅
- [x] **T4.4** DB: Tabelas meal_plans, nutrition_assessments, patients ✅
- [ ] **T4.5** Frontend: Criador de plano alimentar
- [ ] **T4.6** Frontend: Avaliação nutricional (medidas, BIA, recordatório)
- [ ] **T4.7** Frontend: Página do paciente (visão consolidada)
- [ ] **T4.8** Planos/Pricing para nutricionistas

---

## 📊 Progresso

`18/31 (58%)`

---

## 🚀 Deploys

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| 0.2.0 | S1-S4 parcial | 2026-04-05 | 0f1d0bf8 | 19 |
