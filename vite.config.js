import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const ignoredDirs = ['.venv', 'backend', 'dist', 'node_modules', '.git'];

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Only src/ and the config files matter for the dev server. Skipping
      // the Python side and loose files dropped in the project root (e.g.
      // screenshots) also avoids Windows EBUSY crashes when the watcher
      // touches a file another program still has open.
      ignored: (path) => {
        const rel = relative(root, path);
        if (!rel || rel.startsWith('..')) return false;
        const parts = rel.split(sep);
        if (ignoredDirs.includes(parts[0])) return true;
        return parts.length === 1 && /\.(png|jpe?g|gif|webp|bmp|zip)$/i.test(rel);
      },
    },
    proxy: {
      // The FastAPI backend (see backend/README.md) serves /api/* itself,
      // so requests are forwarded as-is. Run it locally with
      // `python -m uvicorn backend.main:app --port 8000`.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
