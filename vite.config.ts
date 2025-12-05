import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      base: '/', // Always use absolute paths for Cloudflare Pages
      publicDir: 'Public', // Specify the public directory
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Gzip compression for all assets
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 1024, // Only compress files larger than 1KB
          deleteOriginFile: false,
        }),
        // Brotli compression (better than gzip, supported by Cloudflare)
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 1024,
          deleteOriginFile: false,
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY), // OpenRouter API key
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Split SVG icons into a separate chunk for better caching
              if (id.includes('/Public/Icons/')) {
                return 'icons';
              }
            },
            assetFileNames: (assetInfo) => {
              // Keep SVGs in assets folder with hash for cache busting
              if (assetInfo.name?.endsWith('.svg')) {
                return 'assets/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
          },
        },
        // Increase chunk size warning limit for icon bundle
        chunkSizeWarningLimit: 1000,
      },
      assetsInlineLimit: 0, // Don't inline assets, but bundle them for fast loading
    };
});
