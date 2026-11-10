import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({ test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.ts', 'src/**/*.test.tsx'], passWithNoTests: true }, resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } } })
