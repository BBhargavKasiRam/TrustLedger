import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from environment and .env files (frontend and project root)
  const envFrontend = loadEnv(mode, process.cwd(), '');
  const envRoot = loadEnv(mode, path.resolve(process.cwd(), '..'), '');

  // Consolidate candidate backend URLs in order of precedence
  const rawBackendUrl = (
    process.env.BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    process.env.API_URL ||
    process.env.VITE_API_URL ||
    envFrontend.BACKEND_URL ||
    envFrontend.VITE_BACKEND_URL ||
    envFrontend.API_URL ||
    envFrontend.VITE_API_URL ||
    envRoot.BACKEND_URL ||
    envRoot.VITE_BACKEND_URL ||
    envRoot.API_URL ||
    envRoot.VITE_API_URL ||
    ''
  ).trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '').replace(/\/api$/, '');

  console.log(`[Vite Config] Resolved target BACKEND_URL: "${rawBackendUrl || '(local proxy /api)'}"`);

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Expose BACKEND_ and API_ prefixed variables to client bundle
    envPrefix: ['VITE_', 'BACKEND_', 'API_'],
    define: {
      'import.meta.env.BACKEND_URL': JSON.stringify(rawBackendUrl),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(rawBackendUrl),
      'import.meta.env.VITE_API_URL': JSON.stringify(rawBackendUrl),
      'import.meta.env.API_URL': JSON.stringify(rawBackendUrl),
      '__BACKEND_URL__': JSON.stringify(rawBackendUrl),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/static': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        }
      }
    }
  }
})
