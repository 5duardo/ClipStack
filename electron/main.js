const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const storage = require('./storage');
const clipboardWatcher = require('./clipboard');
const shortcuts = require('./shortcuts');
const settings = require('./settings');

const isDev = process.env.NODE_ENV === 'development';
const LOGO_PATH = path.join(__dirname, '..', 'src', 'assets', 'logo.png');

let mainWindow = null;
let tray = null;

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
    resizable: false,
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

function createTray() {
  const icon = nativeImage.createFromPath(LOGO_PATH);
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
      label: 'Limpiar historial',
      click: () => {
        storage.clearAll();
        if (mainWindow) mainWindow.webContents.send('clips:updated', null);
      },
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
