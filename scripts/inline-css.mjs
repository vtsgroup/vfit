#!/usr/bin/env node
/**
 * inline-css.mjs — Post-build: inline ALL CSS + deferred link restore
 *
 * Strategy (v5.7.6):
 *
 *   1. Inline ALL CSS as <style data-inline-css> → eliminates render-blocking
 *   2. Remove all <link rel="stylesheet"> tags from HTML
 *   3. Add tiny <script> that re-creates <link> via requestIdleCallback()
 *      → Deferred: Lighthouse doesn't see CSS in critical path
 *      → Links created by JS are NOT render-blocking
 *      → Inline <style> covers rendering → no FOUC
 *      → CSS links restore for client-side navigation only
 *
 * Why this works:
 *   - HTML parser <link rel="stylesheet"> = RENDER BLOCKING (bad)
 *   - JS requestIdleCallback + createElement = Deferred + NON-blocking (best)
 *   - Inline <style> covers all rendering → no FOUC
 *   - React uses inline styles → no hydration mismatch
 *   - Best of all worlds: instant render + happy React + clean Lighthouse
 *
 * History:
 *   v5.7.0: Inline all + remove links → Perf 93 (TBT 150ms from hydration mismatch)
 *   v5.7.1: Smart inline (≤10KiB only) → Perf 87 (render-blocking 150ms penalty)
 *   v5.7.2: Inline all + JS link restore → Perf 100 (no blocking, no mismatch)
 *   v5.7.6: Deferred restore via requestIdleCallback → removes CSS from dependency tree
 *
 * Compatible with: Next.js 15 · App Router · output: "export" · Cloudflare Pages
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const OUT_DIR = resolve('out')

// ── CSS file cache ──
const cssCache = new Map()

function getCssContent(href) {
  if (cssCache.has(href)) return cssCache.get(href)
  const filePath = join(OUT_DIR, href)
  if (!existsSync(filePath)) return null
  const content = readFileSync(filePath, 'utf8')
  cssCache.set(href, content)
  return content
}

// ── Recursively find all .html files ──
function getAllHtmlFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath))
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

// ── Build the tiny restore script ──
function buildRestoreScript(links) {
  // Minified: re-creates <link rel="stylesheet"> via JS (non-blocking!)
  // Uses requestIdleCallback to defer → keeps CSS out of Lighthouse critical path
  // Fallback: setTimeout 50ms for Safari (no rIC support)
  // React hydration: inline <style> covers rendering; links restore for client nav
  const entries = links.map(({ href, precedence }) =>
    `["${href}","${precedence}"]`
  ).join(',')

  return `<script data-css-hydration>(()=>{function r(){[${entries}].forEach(([h,p])=>{const l=document.createElement("link");l.rel="stylesheet";l.href=h;l.dataset.precedence=p;document.head.appendChild(l)})};typeof requestIdleCallback!=="undefined"?requestIdleCallback(r,{timeout:2000}):setTimeout(r,50)})()</script>`
}

// ── Process a single HTML file ──
function processHtml(htmlPath) {
  let html = readFileSync(htmlPath, 'utf8')

  // Match all <link rel="stylesheet" href="..." data-precedence="..."/>
  const linkRegex = /<link\s+rel="stylesheet"\s+href="(\/_next\/static\/css\/[^"]+\.css)"\s*data-precedence="([^"]+)"\s*[^>]*\/>/g

  const matches = [...html.matchAll(linkRegex)]
  if (matches.length === 0) return { count: 0 }

  const allCss = []
  const linkData = []

  for (const match of matches) {
    const href = match[1]
    const precedence = match[2]
    const content = getCssContent(href)

    if (!content) {
      console.warn(`  ⚠ CSS not found: ${href}`)
      continue
    }

    // Collect CSS content for inline
    allCss.push(content)
    linkData.push({ href, precedence })

    // Remove the <link> tag from HTML
    html = html.replace(match[0], '')
  }

  if (allCss.length === 0) return { count: 0 }

  // Build inline <style> with ALL CSS
  const inlineStyle = `<style data-inline-css>${allCss.join('\n')}</style>`

  // Build restore script (re-creates links via JS = non-blocking)
  const restoreScript = buildRestoreScript(linkData)

  // Insert both right before </head>
  html = html.replace('</head>', `${inlineStyle}${restoreScript}</head>`)

  writeFileSync(htmlPath, html, 'utf8')
  return { count: linkData.length }
}

// ── Main ──
console.log('\n⚡ Full CSS Inline + Hydration-Safe Link Restore (v5.7.2)...')

if (!existsSync(OUT_DIR)) {
  console.error('❌ out/ not found — run `next build` first')
  process.exit(1)
}

const htmlFiles = getAllHtmlFiles(OUT_DIR)
let totalProcessed = 0

for (const file of htmlFiles) {
  const { count } = processHtml(file)
  totalProcessed += count
}

// Report
const totalCssSize = [...cssCache.values()].reduce((sum, css) => sum + Buffer.byteLength(css, 'utf8'), 0)
console.log(`\n  📦 CSS files: ${cssCache.size} (${(totalCssSize / 1024).toFixed(1)} KiB total)`)
console.log(`  📄 HTML files: ${htmlFiles.length}`)
console.log(`  ✅ Links inlined + restored: ${totalProcessed}`)
console.log(`  🎯 Strategy: <style> inline (no render-blocking) + JS link restore (React-safe)`)
console.log('  ✨ Done!\n')
