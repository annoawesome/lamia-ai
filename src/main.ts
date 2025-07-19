import { app, BrowserWindow, Menu } from 'electron';
import dotenv from 'dotenv';
import electronSquirrelStartup from 'electron-squirrel-startup';
import fs from 'fs';

import { envDependentPaths } from './util/paths.js';
import { startServer } from './server.js';
import { getEnvVar } from './util/env.js';
import path from 'path';

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

    // Electron Forge will copy the .env.production file to the resources path
    if (loadEnvFile(path.join(process.resourcesPath, '.env.production'))) return;
}

function fixPaths() {
    const lamiaAppDataDirectory = getEnvVar('LAMIA_USERDATA_DIRECTORY');

    if (getEnvVar('LAMIA_APP_CONTEXT') === 'Electron') {
        envDependentPaths.userData = () => app.getPath('userData');
    } else if (lamiaAppDataDirectory) {
        envDependentPaths.userData = () => lamiaAppDataDirectory;
    }
}

// Starts the server
function init() {
    loadEnv();
    fixPaths();
    startServer();
}

if (electronSquirrelStartup) app.quit();

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