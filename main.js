import { app, BrowserWindow } from 'electron';
import { startServer } from './src/server.js';
import 'dotenv/config';
import { getEnvVar } from './src/util/fsdb.js';

function createBrowserWindow() {
    const browserWindow = new BrowserWindow({
        width: 1280,
        height: 800,
    });
    
    browserWindow.loadURL(new URL('/index.html', getEnvVar('LAMIA_URL')).href);
}

// Starts the server
function init() {
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