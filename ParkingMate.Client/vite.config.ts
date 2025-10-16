import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all local IPs (0.0.0.0)
    port: 5173, // Vite dev server port
    strictPort: true,
    proxy: {
      // Proxy API and auth requests to ServiceStack backend
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in dev
        ws: true, // Enable WebSocket proxying if needed
        rewrite: (path) => {
          console.log('Proxying API request:', path)
          return path
        }
      },
      '/auth': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => {
          console.log('Proxying auth request:', path)
          return path
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../ParkingMate/wwwroot'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'motion/react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],

          // Page chunks - group by functionality
          'auth-pages': [
            './src/pages/admin/LoginPage',
            './src/pages/customer/login/CustomerLoginPage',
            './src/pages/admin/RegisterPage',
            './src/pages/admin/ForgotPasswordPage'
          ],
          'customer-pages': [
            './src/pages/customer/registration/CustomerRegistrationPage',
            './src/pages/customer/manage-plates/ManagePlatesPage'
          ],
          'dashboard-pages': [
            './src/pages/admin/HomePage',
            './src/pages/admin/AccountPage',
            './src/pages/admin/ALPRPage'
          ],

          // Component chunks
          'plate-components': [
            './src/pages/customer/manage-plates/components/PlateCard',
            './src/pages/customer/manage-plates/components/PlateForm',
            './src/pages/customer/manage-plates/components/LicensePlate',
            './src/pages/customer/manage-plates/components/PlatesList'
          ],
          'common-components': [
            './src/components/DeleteConfirmationDialog',
            './src/components/ProtectedRegistrationRoute'
          ]
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally splitting
    chunkSizeWarningLimit: 1000
  }
})
