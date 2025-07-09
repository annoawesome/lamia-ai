import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: '../../dist/public',
        rollupOptions: {
            input: {
                index: 'index.html',
                register: 'register.html',
                login: 'login.html',
                home: 'home.html',
            }
        }
    },
});