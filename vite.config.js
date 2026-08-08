import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In prod the PHP backend lives at /api/consult.php (see php-api/README.md).
      // Locally it's served from php-api/ root via `php -S localhost:8000`,
      // so strip the /api prefix before forwarding.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
