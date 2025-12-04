import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/types': path.resolve(__dirname, './src/types'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-charts': ['recharts'],
                    'vendor-utils': ['papaparse', 'date-fns', 'lucide-react'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                },
            },
        },
    },
})
