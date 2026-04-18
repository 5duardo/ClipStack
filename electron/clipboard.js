const { clipboard, nativeImage } = require('electron');
const storage = require('./storage');

let lastText = '';
let lastImageHash = '';
let intervalId = null;
let onUpdate = null;

function hashImage(img) {
  if (!img || img.isEmpty()) return '';
  return img.toDataURL().slice(0, 256);
}

function tick() {
  try {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    if (image && !image.isEmpty()) {
      const h = hashImage(image);
      if (h && h !== lastImageHash) {
        lastImageHash = h;
        const dataURL = image.toDataURL();
        const clip = storage.insertImage(dataURL);
        if (clip && onUpdate) onUpdate(clip);
      }
    } else if (text && text !== lastText) {
      lastText = text;
      const clip = storage.insertText(text);
      if (clip && onUpdate) onUpdate(clip);
    }
  } catch (e) {
    console.error('clipboard tick error:', e);
  }
}

function start(cb) {
  onUpdate = cb;
  // Inicializar estado actual sin guardar
  lastText = clipboard.readText() || '';
  const img = clipboard.readImage();
  lastImageHash = hashImage(img);

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(tick, 500);
}

function stop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

function writeText(text) {
  lastText = text;
  clipboard.writeText(text);
}

function writeImageFromPath(filepath) {
  const img = nativeImage.createFromPath(filepath);
  if (img && !img.isEmpty()) {
    lastImageHash = hashImage(img);
    clipboard.writeImage(img);
    return true;
  }
  return false;
}

module.exports = { start, stop, writeText, writeImageFromPath };
