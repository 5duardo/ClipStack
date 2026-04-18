const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

// Lazy para no ejecutar antes de app.ready
let DATA_DIR, IMAGES_DIR, CLIPS_FILE;

function ensureDirs() {
  if (!DATA_DIR) {
    DATA_DIR = path.join(app.getPath('userData'), 'data');
    IMAGES_DIR = path.join(DATA_DIR, 'images');
    CLIPS_FILE = path.join(DATA_DIR, 'clips.json');
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(CLIPS_FILE)) fs.writeFileSync(CLIPS_FILE, '[]', 'utf-8');
}

function readAll() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(CLIPS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo clips.json:', e);
    return [];
  }
}

function writeAll(clips) {
  ensureDirs();
  fs.writeFileSync(CLIPS_FILE, JSON.stringify(clips, null, 2), 'utf-8');
}

function uuid() {
  return crypto.randomBytes(8).toString('hex');
}

function insertText(text) {
  const clips = readAll();
  // Evitar duplicado inmediato
  const lastNonPinned = clips.find((c) => !c.pinned);
  if (lastNonPinned && lastNonPinned.type === 'text' && lastNonPinned.content === text) {
    return null;
  }
  const clip = {
    id: uuid(),
    type: 'text',
    content: text,
    preview: text.slice(0, 120),
    pinned: false,
    created_at: new Date().toISOString(),
  };
  clips.unshift(clip);
  writeAll(clips);
  return clip;
}

function insertImage(dataURL) {
  const clips = readAll();
  const lastNonPinned = clips.find((c) => !c.pinned);
  if (lastNonPinned && lastNonPinned.type === 'image' && lastNonPinned.hash === hashString(dataURL)) {
    return null;
  }
  const id = uuid();
  const base64 = dataURL.replace(/^data:image\/\w+;base64,/, '');
  const filename = `clip_${id}.png`;
  const filepath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));

  const clip = {
    id,
    type: 'image',
    content: filepath,
    preview: dataURL.slice(0, 200),
    hash: hashString(dataURL),
    pinned: false,
    created_at: new Date().toISOString(),
  };
  clips.unshift(clip);
  writeAll(clips);
  return clip;
}

function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function togglePin(id) {
  const clips = readAll();
  const clip = clips.find((c) => c.id === id);
  if (!clip) return null;
  clip.pinned = !clip.pinned;
  writeAll(clips);
  return clip;
}

function remove(id) {
  const clips = readAll();
  const clip = clips.find((c) => c.id === id);
  if (clip && clip.type === 'image' && fs.existsSync(clip.content)) {
    try { fs.unlinkSync(clip.content); } catch (e) { /* ignore */ }
  }
  const next = clips.filter((c) => c.id !== id);
  writeAll(next);
}

function clearAll() {
  const clips = readAll();
  // Conservar pinneados
  const pinned = clips.filter((c) => c.pinned);
  const toDelete = clips.filter((c) => !c.pinned);
  for (const c of toDelete) {
    if (c.type === 'image' && fs.existsSync(c.content)) {
      try { fs.unlinkSync(c.content); } catch (e) { /* ignore */ }
    }
  }
  writeAll(pinned);
}

function getImageAsDataURL(filepath) {
  if (!fs.existsSync(filepath)) return null;
  const buffer = fs.readFileSync(filepath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

module.exports = {
  readAll,
  insertText,
  insertImage,
  togglePin,
  remove,
  clearAll,
  getImageAsDataURL,
};
