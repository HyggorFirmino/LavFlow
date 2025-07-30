import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        host: true,
        port: 5173
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.MAXPAN_API_URL': JSON.stringify(env.VITE_MAXPAN_API_URL),
        'process.env.MAXPAN_BEARER_TOKEN': JSON.stringify(env.MAXPAN_BEARER_TOKEN)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
