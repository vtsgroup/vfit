// ============================================
// Tests: Deferred GA4 loader
// ============================================

import { describe, expect, it } from 'vitest'
import { GA_ID, installDeferredGA4Script } from '../../src/components/analytics/deferred-ga4'

function createFakeRuntime(existingScript = false) {
  const appended: Array<{ src: string; async: boolean }> = []
  const win = {} as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  const doc = {
    querySelector: () => (existingScript ? { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}` } : null),
    createElement: () => ({ src: '', async: false }),
    head: {
      appendChild: (script: { src: string; async: boolean }) => {
        appended.push(script)
        return script
      },
    },
  }

  return { doc, win, appended }
}

describe('installDeferredGA4Script()', () => {
  it('exposes window.gtag and queues the GA4 config command', () => {
    const { doc, win, appended } = createFakeRuntime()

    installDeferredGA4Script(doc as never, win)

    expect(typeof win.gtag).toBe('function')
    expect(appended).toHaveLength(1)
    expect(appended[0]).toMatchObject({
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
      async: true,
    })
    expect(win.dataLayer?.at(-1)).toEqual(['config', GA_ID])
  })

  it('does not inject duplicate gtag scripts', () => {
    const { doc, win, appended } = createFakeRuntime(true)

    installDeferredGA4Script(doc as never, win)

    expect(typeof win.gtag).toBe('function')
    expect(appended).toHaveLength(0)
    expect(win.dataLayer?.at(-1)).toEqual(['config', GA_ID])
  })
})
