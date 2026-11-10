import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins:
    [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://13.201.85.159:3000', // Your Backend IP
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // Rewrite the Origin header to match the target to bypass backend CORS checks
            proxyReq.setHeader('Origin', 'http://13.201.85.159:3000');
          });
        },
      },
    },
  },
})
