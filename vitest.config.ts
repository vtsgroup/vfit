import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'edge-runtime',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'config/**/*.ts'],
      exclude: ['lib/email.ts', 'lib/email-resend.ts', 'lib/onesignal.ts', 'lib/asaas.ts'],
    },
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, './config'),
      '@lib': path.resolve(__dirname, './lib'),
      '@workers': path.resolve(__dirname, './workers'),
    },
  },
})
