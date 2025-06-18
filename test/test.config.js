// ------------------------------
// test.config.js
// ------------------------------
// Vitest configuration so that all tests run in a browser‑like JSDOM
// environment and gain jest‑dom matchers.
// Put this file at project root or inside the /test folder.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js']
  }
})
