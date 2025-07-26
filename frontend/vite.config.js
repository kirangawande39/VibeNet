// Vite ka config define karte hain
import { defineConfig } from 'vite'

// React plugin ko import karte hain for JSX, fast refresh, etc.
import react from '@vitejs/plugin-react'

// Node.js ka 'path' module ka resolve function import karte hain,
// taaki file paths ko correct tarike se resolve kiya ja sake
import { resolve } from 'path'

// Vite ka configuration export karte hain
export default defineConfig({
  // React plugin ko use karna
  plugins: [react()],

  // Build ke samay kuch extra configuration
  build: {
    rollupOptions: {
      input: {
        // Default entry point (Vite isme se app start karega)
        main: resolve(__dirname, 'index.html'),

        // Firebase Cloud Messaging ke liye service worker file ka path
        // Ye file browser me register hogi for push notifications
        sw: resolve(__dirname, 'public/firebase-messaging-sw.js'),
      },
    },
  },
})
