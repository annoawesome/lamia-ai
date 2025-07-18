import { app, BrowserWindow, Menu } from 'electron';
import dotenv from 'dotenv';
import fs from 'fs';

import { startServer } from './server.js';
import { getEnvVar } from './util/env.js';

function createBrowserWindow() {
    const browserWindow = new BrowserWindow({
        width: 1280,
        height: 800,
    });
    
    browserWindow.loadURL(new URL('/index.html', getEnvVar('LAMIA_URL')).href);
    Menu.setApplicationMenu(null);
}

function loadEnvFile(path: string) {
    if (fs.existsSync(path)) {
        dotenv.config({
            path: path
        });

        return true;
    }

    return false;
}

function loadEnv() {
    if (loadEnvFile('.env.local')) return;
    if (loadEnvFile('.env')) return;

    if (process.env.NODE_ENV === 'production' && loadEnvFile('.env.production.local')) return;
    if (process.env.NODE_ENV === 'production' && loadEnvFile('.env.production')) return;
    if (process.env.NODE_ENV === 'testing' && loadEnvFile('.env.test.local')) return;
    if (process.env.NODE_ENV === 'testing' && loadEnvFile('.env.test')) return;
    if (process.env.NODE_ENV === 'development' && loadEnvFile('.env.development.local')) return;
}

// Starts the server
function init() {
    loadEnv();
    startServer();
}

app.whenReady().then(() => {
    init();
    createBrowserWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBrowserWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});