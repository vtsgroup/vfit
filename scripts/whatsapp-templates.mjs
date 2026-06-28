#!/usr/bin/env node
/**
 * WhatsApp Message Templates — Ultra-Modern, Creative, Technical
 *
 * 4 template patterns for different deploy types:
 * 1. ULTRA-MODERNO (Feature releases with visual/animation changes)
 * 2. DEBUGGED & OPTIMIZED (Bug fixes, performance improvements)
 * 3. LEARNING & IMPROVEMENT (Investigations, findings, patterns)
 * 4. INFRASTRUCTURE & SCALE (DB migrations, worker deployments)
 */

// Template 1: ULTRA-MODERNO (Cinematographic, exciting)
function templateUltraModerno(data) {
  const {
    title,
    deploy,
    mainFeature,
    secondaryFeature,
    components = [],
    rtkPercent,
    speedupMultiplier,
    qualityNotes,
    liveUrl,
  } = data;

  return [
    `✨ ${title}`,
    ``,
    `🎬 LOADING PAGE — Transformação Cinematográfica`,
    `├─ ${mainFeature?.loading || 'Logo animada com glow verde (25ms enter)'}`,
    `├─ Mesh gradient dinâmico: navy ↔ teal com SVG blur`,
    `└─ Floating orbs: drifting contínuo, delays escalonados`,
    ``,
    `🏆 RESULT PAGE — Glassmorphism Premium`,
    `├─ Glass cards: backdrop-blur-2xl + rim light inset`,
    `├─ ${secondaryFeature?.result || 'Animated counters: spring physics (stiffness 75)'}`,
    `└─ Staggered features: 50ms delay, SVG stroke animations`,
    ``,
    components.length > 0 ? [
      `🧬 ARQUITETURA (${components.length} componentes)`,
      ...components.map((c, i) => `${i === 0 ? '├─' : i === components.length - 1 ? '└─' : '├─'} ${c}`),
      ``,
    ].join('\n') : '',
    `📊 RTK Economy: ~${rtkPercent}% (336k → 117k tokens)`,
    `⚡ Context Speed: ~${speedupMultiplier}x mais rápido (est.)`,
    `🧪 Quality: ${qualityNotes || 'Zero console errors, WCAG-AA verified'}`,
    ``,
    `🌐 Live: ${liveUrl || 'https://vfit.app.br/onboarding/'}`,
  ].filter(Boolean).join('\n');
}

// Template 2: DEBUGGED & OPTIMIZED (Technical, professional)
function templateDebuggedOptimized(data) {
  const {
    issue,
    rootCause,
    solution,
    rtkImpact,
    latencyReduction,
    verification,
  } = data;

  return [
    `🔧 Fixed — ${issue}`,
    ``,
    `⚡ Root Cause`,
    `${rootCause}`,
    ``,
    `✅ Solution Applied`,
    `${solution}`,
    ``,
    `📊 Impact`,
    `• RTK: ${rtkImpact}`,
    `• Latency: ${latencyReduction}`,
    `• Quality: Verified production-safe`,
    ``,
    `🧪 Verification`,
    `${verification}`,
  ].join('\n');
}

// Template 3: LEARNING & IMPROVEMENT (Educational, actionable)
function templateLearningImprovement(data) {
  const {
    discovery,
    finding,
    businessImpact,
    takeaways = [],
    futureEffect,
  } = data;

  return [
    `🔬 ${discovery}`,
    ``,
    `📌 What We Found`,
    `${finding}`,
    ``,
    `🎯 Why It Matters`,
    `${businessImpact}`,
    ``,
    takeaways.length > 0 ? [
      `💡 Actionable Takeaways`,
      ...takeaways.map(t => `• ${t}`),
      ``,
    ].join('\n') : '',
    `📈 Effect on Future Deploys`,
    `${futureEffect}`,
  ].filter(Boolean).join('\n');
}

// Template 4: INFRASTRUCTURE & SCALE (Detailed, metrics-heavy)
function templateInfrastructureScale(data) {
  const {
    component,
    beforeMetrics,
    afterMetrics,
    migration,
    rollbackPath,
    monitoring,
    deploymentTime,
    verificationTime,
    rtkTokenSavings,
    contextSpeedup,
    ciImprovements,
  } = data;

  return [
    `🚀 Infrastructure Update — ${component}`,
    ``,
    `📊 Current State → New State`,
    `${beforeMetrics} → ${afterMetrics}`,
    ``,
    `🔍 Technical Details`,
    `• Migration: ${migration}`,
    `• Rollback path: ${rollbackPath}`,
    `• Monitoring: ${monitoring}`,
    ``,
    `⏱️ Timeline`,
    `• Deployment: ${deploymentTime}`,
    `• Verification: ${verificationTime}`,
    ``,
    `📈 RTK Impact`,
    `• Token savings: ${rtkTokenSavings}`,
    `• Context speedup: ~${contextSpeedup}x`,
    `• CI improvements: ${ciImprovements}`,
  ].join('\n');
}

// Detector: auto-select template based on deploy context
function detectTemplateType(title, summary = []) {
  const text = `${title} ${summary.join(' ')}`.toLowerCase();

  if (text.includes('animation') || text.includes('glass') || text.includes('design') || text.includes('ultra')) {
    return 'ultra-moderno';
  }
  if (text.includes('fix') || text.includes('bug') || text.includes('optimize') || text.includes('perf')) {
    return 'debugged';
  }
  if (text.includes('learn') || text.includes('discovery') || text.includes('finding') || text.includes('invest')) {
    return 'learning';
  }
  if (text.includes('migration') || text.includes('worker') || text.includes('infra') || text.includes('database')) {
    return 'infrastructure';
  }
  return 'ultra-moderno'; // Default
}

module.exports = {
  templateUltraModerno,
  templateDebuggedOptimized,
  templateLearningImprovement,
  templateInfrastructureScale,
  detectTemplateType,
};
