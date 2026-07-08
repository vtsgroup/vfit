// ============================================
// check-splash-export.mjs — Build regression gate (plano splash-boot)
// ============================================
//
// Valida que a splash está PRÉ-RENDERIZADA no HTML estático exportado.
// Foi exatamente a ausência de 'vsp-root' em out/welcome.html e out/dashboard.html
// que causava o welcome vazando / tela escura no boot do TWA/PWA (bug 2026-07-08).
// Roda no postbuild (após inline-css.mjs). Falha = build inválido.

import { readFileSync } from 'node:fs'

// [arquivo, markers obrigatórios]: vsp-root = splash pré-renderizada;
// bc-jumbo = conteúdo do welcome resolvido no HTML (garantia sem-JS em produção).
const TARGETS = [
  ['out/welcome.html', ['vsp-root', 'bc-jumbo']],
  ['out/dashboard.html', ['vsp-root']],
]

let failed = false

for (const [file, markers] of TARGETS) {
  let html = ''
  try {
    html = readFileSync(file, 'utf8')
  } catch {
    console.error(`❌ splash-check: ${file} não encontrado — o export estático rodou?`)
    failed = true
    continue
  }
  for (const marker of markers) {
    if (!html.includes(marker)) {
      console.error(
        `❌ splash-check: ${file} sem '${marker}' — regressão do boot TWA/PWA (splash/conteúdo não pré-renderizado)`
      )
      failed = true
    } else {
      console.log(`✅ splash-check: ${file} contém '${marker}'`)
    }
  }
}

if (failed) process.exit(1)
