const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let SETTINGS_FILE;

const DEFAULTS = {
  hotkey: process.platform === 'darwin' ? 'Command+Alt+Z' : 'Control+Alt+Z',
  theme: 'dark', // 'dark' | 'light'
  language: 'es', // 'es' | 'en'
  launchOnStartup: false,
};

function ensureFile() {
  if (!SETTINGS_FILE) {
    SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULTS, null, 2), 'utf-8');
  }
}

function read() {
  ensureFile();
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error leyendo settings:', e);
    return { ...DEFAULTS };
  }
}

function write(partial) {
  ensureFile();
  const current = read();
  const next = { ...current, ...partial };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

module.exports = { read, write, DEFAULTS };
