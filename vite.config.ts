import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Replaced `process.cwd()` with `''` to avoid a TypeScript type error.
  // `loadEnv` will resolve this relative to the project root, which is the same behavior.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    define: {
      // This makes the environment variable available in the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
