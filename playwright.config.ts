import { defineConfig } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  use: {
    baseURL: baseURL ?? 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: baseURL ? undefined : { command: 'npm run build && npm start', port: 3000, timeout: 180_000 },
})
