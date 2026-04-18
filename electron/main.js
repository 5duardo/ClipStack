const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const storage = require('./storage');
const clipboardWatcher = require('./clipboard');
const shortcuts = require('./shortcuts');
const settings = require('./settings');

// Expose app version via IPC for renderer
ipcMain.handle('app:version', () => app.getVersion());

const isDev = process.env.NODE_ENV === 'development';

function resolveIconPath() {
  const candidates = [
    path.join(__dirname, '..', 'src', 'assets', 'logo.ico'),
    path.join(process.resourcesPath || '', 'app.asar', 'src', 'assets', 'logo.ico'),
    path.join(process.resourcesPath || '', 'app', 'src', 'assets', 'logo.ico'),
  ];

  return candidates.find((p) => p && fs.existsSync(p)) || candidates[0];
}

const LOGO_PATH = resolveIconPath();

let mainWindow = null;
let tray = null;

function sendUpdateStatus(status, data = null) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', { status, data });
  }
}

function initAutoUpdater() {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (e) => {
    console.error('Auto-update error:', e);
    sendUpdateStatus('error', e?.message || 'Unknown error');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info?.version || 'unknown');
    sendUpdateStatus('available', { version: info?.version });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
    sendUpdateStatus('not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus('downloading', { percent: Math.round(progress.percent) });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info?.version || 'unknown');
    sendUpdateStatus('downloaded', { version: info?.version });
  });

  autoUpdater.checkForUpdatesAndNotify().catch((e) => {
    console.error('Error checking updates:', e);
  });
}

function applyLaunchOnStartup(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      openAsHidden: true,
    });
  } catch (e) {
    console.error('No se pudo actualizar inicio con el sistema:', e);
  }
}

function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 680;
  const winHeight = 500;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: Math.floor((sw - winWidth) / 2),
    y: Math.floor((sh - winHeight) / 2),
    icon: LOGO_PATH,
    frame: false,
    resizable: true,
    minWidth: 400,
    minHeight: 350,
    skipTaskbar: false,
    alwaysOnTop: true,
    show: isDev, // en dev, visible al inicio para debug
    transparent: false,
    backgroundColor: '#171717',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        shell.openExternal(parsed.toString());
      }
    } catch {
      // ignore invalid urls
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        e.preventDefault();
        shell.openExternal(parsed.toString());
      }
    } catch {
      // ignore invalid urls
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist-renderer', 'index.html'));
  }

  mainWindow.on('blur', () => {
    if (!isDev) mainWindow.hide();
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

function showWindow() {
  if (!mainWindow) return;
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const [w, h] = mainWindow.getSize();
  mainWindow.setPosition(Math.floor((sw - w) / 2), Math.floor((sh - h) / 2));
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('window:shown');
}

function openSettingsWindow() {
  if (!mainWindow) return;
  showWindow();
  mainWindow.webContents.send('window:open-settings');
}

function createTray() {
  let icon = nativeImage.createFromPath(LOGO_PATH);
  if (icon.isEmpty()) {
    icon = nativeImage.createFromNamedImage('application-icon');
  }
  try {
    tray = new Tray(icon);
  } catch (e) {
    console.error('No se pudo crear Tray:', e);
    return;
  }
  tray.setToolTip('ClipStack');

  const menu = Menu.buildFromTemplate([
    { label: 'Abrir ClipStack', click: showWindow },
    { type: 'separator' },
    {
      label: 'Ajustes',
      click: openSettingsWindow,
    },
    { type: 'separator' },
    { label: 'Salir', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', toggleWindow);
}

function registerIpc() {
  ipcMain.handle('clips:get', () => storage.readAll());

  ipcMain.handle('clips:copy', (_e, id) => {
    const clips = storage.readAll();
    const clip = clips.find((c) => c.id === id);
    if (!clip) return false;
    if (clip.type === 'text') {
      clipboardWatcher.writeText(clip.content);
    } else if (clip.type === 'image') {
      clipboardWatcher.writeImageFromPath(clip.content);
    }
    if (mainWindow) mainWindow.hide();
    return true;
  });

  ipcMain.handle('clips:togglePin', (_e, id) => storage.togglePin(id));
  ipcMain.handle('clips:remove', (_e, id) => { storage.remove(id); return true; });
  ipcMain.handle('clips:clearAll', () => { storage.clearAll(); return true; });
  ipcMain.handle('window:hide', () => { if (mainWindow) mainWindow.hide(); });
  ipcMain.handle('clips:imageDataURL', (_e, filepath) => storage.getImageAsDataURL(filepath));
  ipcMain.handle('external:open', async (_e, url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
      await shell.openExternal(parsed.toString());
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('settings:get', () => settings.read());
  ipcMain.handle('settings:set', (_e, partial) => {
    const next = settings.write(partial);
    if (partial.hotkey) {
      shortcuts.register(next.hotkey, toggleWindow);
    }
    if (Object.prototype.hasOwnProperty.call(partial, 'launchOnStartup')) {
      applyLaunchOnStartup(next.launchOnStartup);
    }
    if (mainWindow) mainWindow.webContents.send('settings:updated', next);
    return next;
  });
  ipcMain.handle('window:close', () => { app.isQuitting = true; app.quit(); });
  ipcMain.handle('window:minimize', () => { if (mainWindow) mainWindow.hide(); });

  ipcMain.handle('updater:check', async () => {
    if (isDev) {
      sendUpdateStatus('not-available');
      return { available: false };
    }
    try {
      sendUpdateStatus('checking');
      const result = await autoUpdater.checkForUpdates();
      return { available: !!result?.downloadPromise, version: result?.updateInfo?.version };
    } catch (e) {
      sendUpdateStatus('error', e?.message || 'Check failed');
      return { available: false, error: e?.message };
    }
  });
}

app.whenReady().then(() => {
  // Evitar segunda instancia
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(LOGO_PATH);
  }

  createWindow();
  createTray();
  registerIpc();
  initAutoUpdater();
  const s = settings.read();
  applyLaunchOnStartup(s.launchOnStartup);
  shortcuts.register(s.hotkey, toggleWindow);

  clipboardWatcher.start((clip) => {
    if (mainWindow) mainWindow.webContents.send('clips:updated', clip);
  });
});

app.on('second-instance', () => {
  showWindow();
});

app.on('window-all-closed', (e) => {
  // Mantener app viva en tray
  e.preventDefault();
});

app.on('will-quit', () => {
  shortcuts.unregisterAll();
  clipboardWatcher.stop();
});
