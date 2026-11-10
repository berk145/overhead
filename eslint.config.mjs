import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
export default defineConfig([
  ...nextVitals, ...nextTs,
  { files: ['src/features/quakes/**', 'src/features/hazards/**'], rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*'], message: 'quakes and hazards are leaf features' }] }] } },
  { files: ['src/features/globe/**'], rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*/*'], message: 'import only from a feature index' }] }] } },
  { files: ['src/components/**'], rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*'], message: 'components never import features' }] }] } },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
