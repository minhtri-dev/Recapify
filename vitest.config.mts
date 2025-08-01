import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import './env.config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: process.env.CI
      ? ['__tests__/ci/**/*.test.ts'] // Only include CI tests when CI is true
      : ['__tests__/**/*.test.ts'], // Include all tests locally
    environment: 'jsdom',
  },
})
