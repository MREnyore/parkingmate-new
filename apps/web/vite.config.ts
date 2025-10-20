import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: path.resolve(__dirname, '../../'), // Load .env from root directory
  server: {
    host: true, // Listen on all local IPs (0.0.0.0)
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
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
          'common-components': ['./src/components/DeleteConfirmationDialog']
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally splitting
    chunkSizeWarningLimit: 1000
  }
})
