import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react({
        include: "**/*.{jsx,js,tsx,ts}", // ≈Ã»«— Vite ⁄·Ï „⁄«·Ã… JS ﬂ‹ JSX
    }),],

    base: './',

    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:5001',
                changeOrigin: true,
                secure: false,
            },
            '/notificationHub': {
                target: 'https://localhost:5001',
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    },

    build: {
        sourcemap: true,
        minify: false, // „ƒﬁ « ·· ‘ŒÌ’
    },
});