const { app, BrowserWindow } = require('electron');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

/** @type {import('node:child_process').ChildProcess | null} */
let backendProcess = null;

function waitForServer(url, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(attempt, 250);
      });
    };

    attempt();
  });
}

function startBackendIfNeeded() {
  if (process.env.START_BACKEND === 'false') return;

  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend');
  const backendEntry = path.join(backendDir, 'dist', 'src', 'main.js');
  if (!fs.existsSync(backendEntry)) {
    // Backend might be started externally (dev) or not built yet.
    return;
  }

  const userDataDir = app.getPath('userData');
  const jwtSecretFile = path.join(userDataDir, 'jwt-secret.txt');
  let jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    try {
      jwtSecret = fs.readFileSync(jwtSecretFile, 'utf8').trim();
    } catch {
      // ignore
    }
  }

  if (!jwtSecret) {
    jwtSecret = crypto.randomBytes(32).toString('hex');
    try {
      fs.mkdirSync(userDataDir, { recursive: true });
      fs.writeFileSync(jwtSecretFile, jwtSecret, { encoding: 'utf8' });
    } catch {
      // ignore
    }
  }

  const defaultWebDistDir = app.isPackaged
    ? path.join(process.resourcesPath, 'point-of-sale', 'dist')
    : path.join(__dirname, '..', 'point-of-sale', 'dist');

  const nodeBinary = app.isPackaged
    ? process.execPath
    : (process.env.NODE_BINARY || 'node');

  backendProcess = spawn(nodeBinary, [backendEntry], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: process.env.PORT ?? '8000',
      HOST: process.env.HOST ?? '127.0.0.1',
      ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
      JWT_SECRET: jwtSecret,
      DB_PATH: process.env.DB_PATH ?? path.join(userDataDir, 'pos.sqlite'),
      WEB_DIST_DIR: process.env.WEB_DIST_DIR ?? defaultWebDistDir,
    },
    stdio: 'inherit',
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    win.loadURL(rendererUrl);
    win.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  const host = process.env.HOST ?? '127.0.0.1';
  const port = process.env.PORT ?? '8000';
  const url = `http://${host}:${port}`;

  // Backend may take a moment to boot; wait briefly.
  waitForServer(url, 15000)
    .then(() => win.loadURL(url))
    .catch(() => win.loadURL(url));
}

app.whenReady().then(() => {
  startBackendIfNeeded();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
