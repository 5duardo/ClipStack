# 📋 ClipStack — Clipboard Manager

> App de escritorio para Windows y macOS. Guarda, busca y organiza todo lo que copias.  
> Stack: Electron + Vite + React + SQLite | Open Source

---

## 🎯 Resumen del producto

ClipStack es un clipboard manager que vive en el system tray. Captura automáticamente todo lo que el usuario copia (texto e imágenes), lo almacena localmente en SQLite, y lo hace accesible en menos de un segundo con un hotkey global.

Sin nube. Sin cuentas. Todo en tu máquina.

---

## ✅ Features del MVP

| Feature | Descripción |
|---|---|
| Historial de texto | Guarda cada texto copiado con timestamp |
| Historial de imágenes | Guarda imágenes como base64 en SQLite |
| Pin / favoritos | Marca items para que no se eliminen del historial |
| Búsqueda instantánea | Filtra el historial mientras escribes |
| Hotkey global | `Ctrl+Shift+V` (Win) / `Cmd+Shift+V` (Mac) para abrir |
| System tray | Corre en segundo plano, sin aparecer en taskbar/dock |
| Auto-ocultar | La ventana se cierra al perder el foco |
| Copiar al hacer click | Click en un item lo copia y cierra la ventana |

---

## 🛠️ Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | Electron + Vite | Build rápido, HMR en dev |
| UI | React + Tailwind CSS | Productividad, familiar |
| Persistencia local | Archivos JSON + carpeta data/ | Simple, portable, sin dependencias |
| Imágenes | Archivos en data/images/ | Ligero, acceso directo |
| Hotkey global | electron.globalShortcut | API nativa de Electron |
| Clipboard watcher | electron.clipboard + polling | Cada 500ms |
| Build & distribución | electron-builder | Genera .exe y .dmg |

---

## 📁 Estructura de carpetas

```
clipstack/
├── electron/
│   ├── main.js            # Proceso principal, BrowserWindow, Tray
│   ├── clipboard.js       # Watcher: detecta cambios en el clipboard
│   ├── db.js              # SQLite: CRUD del historial
│   └── shortcuts.js       # Registro del hotkey global
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── ClipItem.jsx       # Componente de cada entrada
│   │   ├── SearchBar.jsx      # Input con filtrado en tiempo real
│   │   └── PinnedSection.jsx  # Sección separada de favoritos
│   └── hooks/
│       └── useClips.js        # Hook para leer historial vía IPC
├── assets/
│   └── tray-icon.png
├── package.json
├── vite.config.js
└── electron-builder.yml
```

---

## 🗃️ Schema SQLite

```
data/
├── clips.json          # Array con metadata de clips
└── images/
    ├── clip_001.png
    ├── clip_002.jpg
    └── ...
```

**Estructura clips.json:**
```json
[
  {
    "id": "uuid-001",
    "type": "text",
    "content": "texto copiado...",
    "preview": "texto copiado...",
    "pinned": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid-002",
    "type": "image",
    "content": "images/clip_002.png",
    "preview": "images/thumb_002.png",
    "pinned": true,
    "created_at": "2024-01-15T11:45:00Z"
  }
]
```

---

## 🔄 Flujo de datos

```
Usuario copia algo (Ctrl+C)
        ↓
clipboard.js detecta cambio (polling 500ms)
        ↓
¿Es distinto al último registro? 
  → SÍ: Guarda en archivo (texto → clips.json, imagen → data/images/)
  → NO: ignorar
        ↓
main.js envía evento IPC al renderer: 'clips:updated'
        ↓
useClips.js recibe el evento → actualiza el estado React
        ↓
UI muestra el nuevo item al tope del historial

──────────────────────────────────────────

Usuario presiona hotkey (Ctrl+Shift+V)
        ↓
Ventana aparece centrada, siempre encima
        ↓
SearchBar recibe el foco automáticamente
        ↓
Usuario escribe → búsqueda en tiempo real sobre SQLite
        ↓
Click en un item → clipboard.writeText/writeImage()
        ↓
Ventana se oculta (no se destruye)
```

---

## 🪟 Comportamiento de la ventana

- **Tipo**: `BrowserWindow` sin frame (`frame: false`)
- **Tamaño**: 680 × 500px, no redimensionable
- **Posición**: Centrada en pantalla al abrirse
- **Always on top**: `true` mientras está visible
- **Al perder foco**: se oculta con `win.hide()`
- **Taskbar/Dock**: oculta con `skipTaskbar: true`
- **Tray**: ícono con menú contextual (Abrir / Limpiar historial / Salir)

---

## ⌨️ Shortcuts

| Acción | Windows | macOS |
|---|---|---|
| Abrir / cerrar | `Ctrl+Shift+V` | `Cmd+Shift+V` |
| Navegar items | `↑` `↓` | `↑` `↓` |
| Copiar seleccionado | `Enter` | `Enter` |
| Cerrar ventana | `Escape` | `Escape` |

---

## 🚀 Setup inicial

```bash
# 1. Crear proyecto con template electron-vite
npm create electron-vite@latest clipstack -- --template react

cd clipstack

# 2. Instalar dependencias clave
# (sin SQLite - solo file system nativo de Node.js)
npm install -D electron-builder

# 3. Correr en desarrollo
npm run dev

# 4. Build para distribución
npm run build
```

### electron-builder.yml básico

```yaml
appId: com.clipstack.app
productName: ClipStack
directories:
  output: dist

win:
  target: nsis
  icon: assets/icon.ico

mac:
  target: dmg
  icon: assets/icon.icns
  category: public.app-category.productivity
```

---

## 🗺️ Roadmap post-MVP

### v1.1
- [ ] Límite configurable de historial (ej. últimos 500 items)
- [ ] Eliminar items individuales
- [ ] Soporte para RTF / HTML en clipboard

### v1.2
- [ ] Organización por colecciones / carpetas
- [ ] Tags en items
- [ ] Exportar historial (ya está en JSON)

### v1.3
- [ ] Tema claro / oscuro
- [ ] Atajos personalizables
- [ ] OCR básico en imágenes (Tesseract.js)

### v2.0
- [ ] Sincronización opcional entre dispositivos (E2E encriptada)
- [ ] Plugins / extensiones

---

## 📦 Distribución

- **GitHub Releases**: subir `.exe` y `.dmg` por cada versión
- **Auto-update**: `electron-updater` apuntando a GitHub Releases
- **Landing page**: página simple con descarga directa

---

## 📄 Licencia

MIT — libre para usar, modificar y distribuir.
