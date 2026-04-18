const { globalShortcut } = require('electron');

let currentAccelerator = null;
let currentCallback = null;

function register(accelerator, cb) {
  if (currentAccelerator) {
    globalShortcut.unregister(currentAccelerator);
  }
  currentCallback = cb || currentCallback;
  try {
    const ok = globalShortcut.register(accelerator, () => {
      if (currentCallback) currentCallback();
    });
    if (!ok) {
      console.error('No se pudo registrar el hotkey:', accelerator);
      return false;
    }
    currentAccelerator = accelerator;
    return true;
  } catch (e) {
    console.error('Error registrando hotkey:', e);
    return false;
  }
}

function unregisterAll() {
  globalShortcut.unregisterAll();
  currentAccelerator = null;
}

module.exports = { register, unregisterAll };
