import { app, BrowserWindow } from 'electron';
import { startServer } from './src/server.js';

function createBrowserWindow() {
    const browserWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });
    
    browserWindow.loadFile('public/index.html');
}

// Starts the server
function init() {
    startServer();
}

app.whenReady().then(() => {
    createBrowserWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBrowserWindow();
        }
    });
}).then(() => {
    init();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});