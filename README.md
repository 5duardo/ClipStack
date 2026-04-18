# ClipStack

Clipboard manager para Windows y macOS. Todo local, sin nube, sin SQLite.

## Stack
- Electron + Vite + React + Tailwind CSS
- Persistencia: archivos JSON + carpeta `data/images/` en `userData` de Electron

## Setup

```bash
npm install
npm run dev
```

El primer `npm install` descarga Electron (~100 MB). El comando `npm run dev` levanta Vite y Electron en paralelo.

## Build

```bash
npm run build
```

Genera instalador `.exe` (Windows) o `.dmg` (macOS) en `dist/`.

## Releases automáticos (GitHub)

- El workflow `/.github/workflows/release.yml` publica release automáticamente cuando haces push de un tag `v*`.
- Usa `electron-builder` con `--publish always` y sube instalador + metadata para auto-update.
- Requiere permisos de `contents: write` (ya configurado en el workflow).

Ejemplo:

```bash
git tag v0.1.1
git push origin v0.1.1
```

## Auto-update

- La app usa `electron-updater` en `electron/main.js`.
- En producción verifica updates contra GitHub Releases y, si hay update, descarga e instala al cerrar/reiniciar app.

## Uso

- **Hotkey global:** `Ctrl+Shift+V` (Win) / `Cmd+Shift+V` (Mac)
- **Navegar:** `↑` `↓`
- **Copiar:** `Enter` (cierra la ventana y copia al portapapeles)
- **Cerrar:** `Esc` o click fuera
- **System tray:** click derecho para menú

## Datos

Los clips se guardan en:
- **Windows:** `%APPDATA%\ClipStack\data\`
- **macOS:** `~/Library/Application Support/ClipStack/data/`

Contenido:
- `clips.json` — metadata e historial de texto
- `images/` — capturas guardadas como PNG

## Licencia

MIT
