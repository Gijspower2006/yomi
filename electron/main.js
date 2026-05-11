const { app, BrowserWindow, shell } = require('electron');
const { default: serve } = require('electron-serve');
const path = require('path');

const loadURL = serve({ directory: path.join(__dirname, '../dist') });

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    title: 'Yomi',
    backgroundColor: '#0C0F1D',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  loadURL(win);

  // Open external links in the system browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
