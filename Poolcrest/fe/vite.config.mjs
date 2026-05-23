import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  resolve: {
    alias: {
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
      utils: fileURLToPath(new URL("./src/utils", import.meta.url)),
      hooks: fileURLToPath(new URL("./src/hooks", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: [],
    // Add proxy for Django backend API calls
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // Forward cookies and credentials
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward all cookies from frontend to backend
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
              console.log('🔄 Proxy forwarding cookies to backend:', req.headers.cookie.split(';')[0] + '...');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward Set-Cookie headers from backend to frontend
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              // Avoid logging cookie contents (may include JWTs)
              console.log('🍪 Proxy received Set-Cookie from backend:', setCookieHeader.length, 'cookies');
              // Modify cookies to work on localhost:4028
              const modifiedCookies = setCookieHeader.map(cookie => {
                // Remove domain restriction for development
                return cookie.replace(/Domain=[^;]+;?\s*/gi, '');
              });
              proxyRes.headers['set-cookie'] = modifiedCookies;
            }
          });
        }
      },
      // WebSocket proxy to Django Channels (use HTTP target; ws:true enables WS upgrade)
      "/ws": {
        target: "http://localhost:8000",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
