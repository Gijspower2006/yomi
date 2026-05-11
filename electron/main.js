const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const DIST = path.join(__dirname, '../dist');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.svg':  'image/svg+xml',
  '.mp3':  'audio/mpeg',
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

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

  win.loadURL('app://localhost/');

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = path.join(DIST, pathname);

    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || 'application/octet-stream';
      return new Response(data, { headers: { 'Content-Type': contentType } });
    } catch {
      return new Response('Not found: ' + pathname, { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
