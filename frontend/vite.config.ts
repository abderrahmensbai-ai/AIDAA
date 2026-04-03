// ============================================================================
// VITE CONFIGURATION
// ============================================================================
// Configuration for Vite build tool

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ============================================================================
// EXPORT VITE CONFIG
// ============================================================================
// https://vitejs.dev/config/
export default defineConfig({
  // React plugin for JSX and HMR
  plugins: [react()],
  
  // Development server configuration
  server: {
    // Port for development server
    port: 5173,
    // Open browser automatically
    open: true,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        // Backend server URL
        target: 'http://localhost:5000',
        // Change origin to backend URL
        changeOrigin: true,
        // Don't rewrite paths
        rewrite: (path) => path,
      },
    },
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Source map for debugging
    sourcemap: true,
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks configuration
        manualChunks: {
          // React packages in separate chunk
          react: ['react', 'react-dom', 'react-router-dom'],
          // Axios in separate chunk
          axios: ['axios'],
        },
      },
    },
  },
});
