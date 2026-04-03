# Melhorias — Treino Ativo

> Propostas para a experiência de execução de treino em tempo real, o momento de maior valor percebido pelo aluno.

---

## 1. Offline-First com IndexedDB e Sync Queue

**Prioridade:** 🔴 Alta | **Esforço:** G | **Sprint sugerida:** 43–44

**Problema:** Academias frequentemente têm sinal ruim. Se o aluno perder conexão durante um treino, os dados do treino em andamento são perdidos ao recarregar a página.

**Proposta:** Armazenar o estado do treino em andamento no IndexedDB local. Ações realizadas offline (série completada, tempo de descanso, peso registrado) vão para uma fila de sync. Ao recuperar conexão, a fila é processada automaticamente.

**Implementação:**

```
src/lib/offline/
├── workout-store.ts       # IndexedDB wrapper (usando idb library)
├── sync-queue.ts          # Fila de ações pendentes
└── sync-worker.ts         # Background sync via Service Worker
```

- Detectar conectividade com `navigator.onLine` + evento `online`
- UI: banner discreto "Você está offline — treino sendo salvo localmente"
- Sync automático ao reconectar, com feedback "3 ações sincronizadas"
- Conflito: timestamp do cliente prevalece (treino foi feito, servidor apenas registra)

---

## 2. Voice Commands Básicos

**Prioridade:** 🟢 Baixa | **Esforço:** M | **Sprint sugerida:** 45+

**Problema:** Durante um exercício com peso, o aluno não consegue usar as mãos para interagir com o celular.

**Proposta:** Comandos de voz básicos usando Web Speech API (sem custo extra, nativa no browser) para as ações mais comuns do treino.

**Comandos suportados:**
- "Próximo" → avançar para próxima série
- "Pausar" → pausar timer
- "Continuar" → retomar timer
- "Descanso" → iniciar timer de descanso

**Implementação:**
- `use-voice-commands.ts` — encapsula `SpeechRecognition` com fallback graceful
- Ativar/desativar via toggle na tela de treino ativo
- Feedback visual ao reconhecer comando (toast discreto)
- Suporte apenas em Chrome/Edge mobile inicialmente; Safari sem suporte (mostrar aviso)

---

## 3. Apple Watch / Wear OS — Companion App (Roadmap)

**Prioridade:** 🟢 Baixa | **Esforço:** G | **Sprint sugerida:** 46+ (roadmap)

**Problema:** Usuários com smartwatch precisam tirar o celular do bolso para marcar séries.

**Proposta:** App companion para Apple Watch (watchOS) e Wear OS com funcionalidades básicas do treino ativo: série atual, timer de descanso, marcar série como completa.

**Dependências:**
- Apple Watch: necessário Xcode + Swift/SwiftUI + Apple Developer account
- Wear OS: necessário Android Studio + Kotlin + Play Console account
- Comunicação: via Bluetooth (WatchConnectivity / Wearable DataLayer API)

**Nota:** Este item requer avaliação estratégica antes de entrar em roadmap. Considerar React Native + Expo se quiser base de código unificada.

---

## 4. Rest Timer Sonoro e com Vibração

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** O timer de descanso atual é apenas visual. O aluno precisa ficar olhando a tela para saber quando o descanso acabou.

**Proposta:** Ao expirar o timer de descanso, emitir um som curto e vibrar o dispositivo. Configurável pelo usuário (som, vibração, ambos ou nenhum).

**Implementação:**
- Som: arquivo `.mp3` curto (bip ou campainha) em R2 ou bundle estático
- `new Audio('/sounds/rest-end.mp3').play()` — respeitar `autoplay policy` (necessário interação prévia)
- Vibração: `navigator.vibrate([200, 100, 200])` (Chrome Android + Samsung)
- Configuração salva em `localStorage['workout-timer-preferences']`
- Fallback silencioso se API não disponível (iOS Safari não suporta vibração)

---

## 5. Auto-detect End of Set via Acelerômetro

**Prioridade:** 🟢 Baixa | **Esforço:** G | **Sprint sugerida:** 45+

**Problema:** Marcar série manualmente interrompe o ritmo do treino. Ideal seria detecção automática.

**Proposta:** Usar o acelerômetro do celular (Device Motion API) para detectar padrão de repetições e sugerir automaticamente "Série concluída?".

**Implementação:**
- `use-accelerometer.ts` — acessa `DeviceMotionEvent` com pedido de permissão (iOS 13+)
- Algoritmo de detecção de padrão: janela deslizante de 3s, detectar oscilação periódica
- Não auto-confirmar — apenas sugerir via bottom sheet discreto: "Detectamos N repetições. Confirmar?"
- Feature flag para rollout gradual (complexidade alta, falsos positivos esperados)

---

## 6. Supersets e Drop-sets UI

**Prioridade:** 🟡 Média | **Esforço:** G | **Sprint sugerida:** 43

**Problema:** A UI de treino ativo não suporta estruturas avançadas de treino como supersets (dois exercícios sem descanso) e drop-sets (reduzir peso progressivamente sem pausa).

**Proposta:** Adicionar suporte visual e de fluxo para supersets e drop-sets na execução do treino.

**Superset:**
- Dois exercícios agrupados, executados sem timer de descanso entre eles
- UI: indicador "SUPERSET A" e "SUPERSET B" com cor diferenciada
- Descanso apenas após completar o par

**Drop-set:**
- Múltiplas séries do mesmo exercício com peso decrescente
- UI: série atual + seta para baixo indicando redução de peso
- Campo de peso editável entre séries

**Implementação:**
- Novo campo `type: 'normal' | 'superset' | 'dropset'` nos modelos de série do workout
- `workers/api/templates.ts` — suporte a grupos de exercícios
- Componentes `superset-group.tsx` e `dropset-series.tsx`

---

## 7. Foto Before/After Dentro do Treino

**Prioridade:** 🟢 Baixa | **Esforço:** M | **Sprint sugerida:** 44

**Problema:** Registro fotográfico de progresso é feito fora do contexto de treino, sem associação temporal.

**Proposta:** Ao finalizar um treino, oferecer opção de tirar/enviar foto de progresso. Fotos ficam associadas à data do treino no histórico de progresso.

**Implementação:**
- `<input type="file" accept="image/*" capture="environment">` para câmera nativa
- Upload para Cloudflare R2 via endpoint dedicado `POST /progress/photos`
- Processamento: resize client-side antes do upload (Canvas API, max 1024px)
- Galeria de fotos na tela de progresso do aluno com linha do tempo
- Permissão: apenas o próprio aluno e seu personal treinam ver as fotos

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Offline-first (IndexedDB + sync queue) | 🔴 Alta | G | 43–44 |
| 2 | Voice commands básicos | 🟢 Baixa | M | 45+ |
| 3 | Apple Watch / Wear OS (roadmap) | 🟢 Baixa | G | 46+ |
| 4 | Rest timer sonoro + vibração | 🟡 Média | P | 41 |
| 5 | Auto-detect end of set via acelerômetro | 🟢 Baixa | G | 45+ |
| 6 | Supersets e drop-sets UI | 🟡 Média | G | 43 |
| 7 | Foto before/after dentro do treino | 🟢 Baixa | M | 44 |
