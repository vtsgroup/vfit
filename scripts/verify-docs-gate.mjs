#!/usr/bin/env node

import { execSync } from 'node:child_process'

const DOCS_REQUIRED_PATTERNS = [
  /^src\//,
  /^workers\//,
  /^lib\//,
  /^config\//,
  /^migrations\//,
  /^scripts\//,
  /^wrangler\.toml$/,
  /^wrangler\.pages\.toml$/,
  /^package\.json$/,
  /^next\.config\.ts$/,
  /^tsconfig\.workers\.json$/,
]

const DOC_PATH_REGEX = /^docs\//
const CHANGELOG_PATH = 'docs/CHANGELOG.md'

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function getBaseRef() {
  const baseRef = process.env.GITHUB_BASE_REF

  if (baseRef) {
    return `origin/${baseRef}`
  }

  try {
    sh('git rev-parse --verify HEAD~1')
    return 'HEAD~1'
  } catch {
    return null
  }
}

function getChangedFiles() {
  if (!process.env.GITHUB_ACTIONS) {
    try {
      const localDiff = sh('git diff --name-only HEAD')
      if (!localDiff) return []
      return localDiff
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean)
    } catch {
      return []
    }
  }

  const baseRef = getBaseRef()

  if (!baseRef) {
    return []
  }

  let diffOutput = ''

  try {
    if (baseRef.startsWith('origin/')) {
      const remoteBranch = baseRef.replace('origin/', '')
      sh(`git fetch --no-tags --depth=200 origin ${remoteBranch}`)
      diffOutput = sh(`git diff --name-only ${baseRef}...HEAD`)
    } else {
      diffOutput = sh(`git diff --name-only ${baseRef}...HEAD`)
    }
  } catch {
    return []
  }

  if (!diffOutput) return []

  return diffOutput
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
}

function hasDocsRequiredChange(filePath) {
  return DOCS_REQUIRED_PATTERNS.some((regex) => regex.test(filePath))
}

function main() {
  const changedFiles = getChangedFiles()

  if (changedFiles.length === 0) {
    console.log('[docs:gate] Sem mudanças detectadas para validação. Gate aprovado.')
    return
  }

  const docsChanged = changedFiles.filter((file) => DOC_PATH_REGEX.test(file))
  const codeChanged = changedFiles.filter((file) => !DOC_PATH_REGEX.test(file))
  const docsRequiredChanged = changedFiles.filter(hasDocsRequiredChange)

  if (codeChanged.length === 0) {
    console.log('[docs:gate] Apenas arquivos de docs mudaram. Gate aprovado.')
    return
  }

  if (docsRequiredChanged.length === 0) {
    console.log('[docs:gate] Mudanças sem impacto técnico relevante detectadas. Gate aprovado.')
    return
  }

  const changelogUpdated = changedFiles.includes(CHANGELOG_PATH)

  const errors = []

  if (docsChanged.length === 0) {
    errors.push('Nenhum arquivo em docs/ foi atualizado para uma mudança técnica relevante.')
  }

  if (!changelogUpdated) {
    errors.push('docs/CHANGELOG.md não foi atualizado junto com mudança técnica relevante.')
  }

  if (errors.length > 0) {
    console.error('[docs:gate] Gate reprovado.')
    for (const err of errors) {
      console.error(`- ${err}`)
    }
    console.error('- Arquivos relevantes alterados:')
    for (const file of docsRequiredChanged) {
      console.error(`  - ${file}`)
    }
    process.exit(1)
  }

  console.log('[docs:gate] Gate aprovado: docs e changelog atualizados.')
}

main()
