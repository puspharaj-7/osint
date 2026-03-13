import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/hibp': { target: 'https://haveibeenpwned.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/hibp/, '') },
      '/api/whoisxml': { target: 'https://www.whoisxmlapi.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/whoisxml/, '') },
      '/api/ipinfo': { target: 'https://ipinfo.io', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/ipinfo/, '') },
      '/api/virustotal': { target: 'https://www.virustotal.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/virustotal/, '') },
      '/api/opensanctions': { target: 'https://api.opensanctions.org', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/opensanctions/, '') },
      '/api/hunter': { target: 'https://api.hunter.io', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/hunter/, '') },
      '/api/opencorporates': { target: 'https://api.opencorporates.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/opencorporates/, '') },
      '/api/abstract': { target: 'https://phonevalidation.abstractapi.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/abstract/, '') },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
