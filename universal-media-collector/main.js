'use strict';
// Universal Media Collector — Electron entry. One window, sandboxed renderer,
// no remote content, no navigation. Subsystems live in main/ and are wired
// through main/ipc.js; this file owns only the window and app lifecycle.
const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const { createSettings } = require('./main/settings');
const { createLibrary } = require('./main/library');
const { DownloadManager } = require('./main/download-manager');
const { registerIpc } = require('./main/ipc');

const argv = new Set(process.argv.slice(1));
const SMOKE = argv.has('--smoke');
const SELFTEST = argv.has('--selftest');
if (process.env.UMC_PROFILE) app.setPath('userData', path.join(app.getPath('temp'), process.env.UMC_PROFILE));

let win = null;
const log = { info: (...a) => console.log('[umc]', ...a), warn: (...a) => console.warn('[umc]', ...a), error: (...a) => console.error('[umc]', ...a) };

function create() {
  const userData = app.getPath('userData');
  const settings = createSettings(userData, log);
  const library = createLibrary(userData, log);
  const dm = new DownloadManager({ settings, library, log });

  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 820, minHeight: 560, backgroundColor: '#0b0d13', title: settings.get().appName, show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, allowRunningInsecureContent: false, preload: path.join(__dirname, 'preload.js') },
  });
  win.once('ready-to-show', () => win.show());
  // the renderer is a local file and must stay one: no navigation, no popups
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('console-message', (_e, _level, msg) => { if (SMOKE || SELFTEST || process.env.UMC_LOG) console.log('[renderer]', msg); });
  if (SMOKE) win.webContents.on('did-finish-load', () => setTimeout(() => app.quit(), SELFTEST ? 4000 : 1500));

  registerIpc({ win, settings, library, dm, log, shell, app, version: app.getVersion() });
  dm.on('queue', (q) => { if (!win.isDestroyed()) win.webContents.send('umc:queue', q); });
  dm.on('job', (j) => { if (!win.isDestroyed()) win.webContents.send('umc:job', j); });

  const query = SELFTEST ? { selftest: '1' } : undefined;
  win.loadFile(path.join(__dirname, 'index.html'), query ? { query } : undefined);
}

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (e) => e.preventDefault());
});
