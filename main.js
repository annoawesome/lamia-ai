import { app, BrowserWindow } from 'electron';
import { startServer } from './src/server.js';
import 'dotenv/config';

function createBrowserWindow() {
    const browserWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });
    
    browserWindow.loadURL('http://localhost:8080/index.html');
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