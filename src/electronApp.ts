import { app, BrowserWindow, Menu } from 'electron';

import { startServer } from './server.js';
import { getEnvVar } from './util/env.js';
import { fixPaths, loadEnv } from './util/appInit.js';

function createBrowserWindow() {
    const browserWindow = new BrowserWindow({
        width: 1280,
        height: 800,
    });
    
    browserWindow.loadURL(new URL('/index.html', getEnvVar('LAMIA_URL')).href);
    Menu.setApplicationMenu(null);
}

// Starts the server
function init() {
    loadEnv();
    fixPaths(app.getPath('userData'));
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