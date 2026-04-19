# 📋 ClipStack

<p align="center">
  <strong>Clipboard manager para Windows y macOS</strong><br>
  Todo local. Sin nube. Sin cuentas. Sin complicaciones.
</p>

<p align="center">
  <a href="#-descarga"><img src="https://img.shields.io/badge/Descargar-.exe%20(Windows)-0078D4?style=flat-square&logo=windows&logoColor=white" alt="Windows Download"></a>
  <a href="#-descarga"><img src="https://img.shields.io/badge/Descargar-.dmg%20(macOS)-000000?style=flat-square&logo=apple&logoColor=white" alt="macOS Download"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencia-MIT-green?style=flat-square" alt="License MIT"></a>
</p>

---

## ✨ ¿Qué es ClipStack?

ClipStack es una **aplicación de escritorio** que captura automáticamente todo lo que copias (texto e imágenes) y te permite acceder al historial completo en segundos.

**Diseñado exclusivamente como aplicación instalable:**
- **Windows:** Instalador `.exe` tradicional
- **macOS:** Disco imagen `.dmg`

No requiere navegador. No es una extensión web. Es una app nativa que corre en segundo plano y se activa con un atajo de teclado.

---

## 🚀 Descarga

### Opción 1: Instalador oficial (Recomendado)

Descarga la última versión desde [GitHub Releases](../../releases/latest):

| Plataforma | Archivo | Tamaño |
|------------|---------|--------|
| Windows 10/11 | `ClipStack-Setup-X.X.X.exe` | ~70 MB |
| macOS 11+ | `ClipStack-X.X.X.dmg` | ~80 MB |

**Instalación:**
1. Descarga el archivo correspondiente a tu sistema operativo
2. Ejecuta el instalador (Windows) o arrastra a Aplicaciones (macOS)
3. La app se inicia automáticamente en el system tray

### Opción 2: Compilar desde el código fuente

Solo para desarrolladores o usuarios avanzados:

```bash
# Clonar repositorio
git clone https://github.com/5duardo/ClipStack.git
cd ClipStack

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir instalador (.exe o .dmg)
npm run build
```

---

## 🎯 Características principales

| Feature | Descripción |
|---------|-------------|
| 📝 **Historial de texto** | Guarda cada texto copiado con timestamp |
| 🖼️ **Historial de imágenes** | Captura screenshots y copias de imagen |
| 📌 **Favoritos** | Marca items importantes para que no se eliminen |
| 🔍 **Búsqueda instantánea** | Filtra el historial mientras escribes |
| ⌨️ **Hotkey global** | `Ctrl+Shift+V` (Win) / `Cmd+Shift+V` (Mac) |
| 🖥️ **System tray** | Corre en segundo plano, sin aparecer en taskbar |
| 🔄 **Auto-update** | Se actualiza automáticamente desde GitHub Releases |

---

## ⌨️ Atajos de teclado

| Acción | Windows | macOS |
|--------|---------|-------|
| Abrir / Cerrar | `Ctrl + Shift + V` | `Cmd + Shift + V` |
| Navegar items | `↑` `↓` | `↑` `↓` |
| Copiar seleccionado | `Enter` | `Enter` |
| Cerrar ventana | `Esc` | `Esc` |

---

## 🏗️ Stack técnico

- **Framework:** Electron + Vite + React
- **Estilos:** Tailwind CSS
- **Persistencia:** Archivos JSON locales + carpeta `data/images/`
- **Distribución:** electron-builder + GitHub Releases
- **Auto-update:** electron-updater

---

## 📁 Ubicación de datos

Los clips se almacenan localmente en tu máquina:

- **Windows:** `%APPDATA%\ClipStack\data\`
- **macOS:** `~/Library/Application Support/ClipStack/data/`

**Contenido:**
- `clips.json` — Metadata e historial de texto
- `images/` — Imágenes guardadas como PNG

---

## 🔄 Releases automáticos

Este proyecto usa GitHub Actions para publicar releases automáticamente:

1. Crea un tag de versión: `git tag v0.1.0`
2. Súbelo: `git push origin v0.1.0`
3. GitHub Actions compila y publica el `.exe` y `.dmg` automáticamente

Ver `.github/workflows/release.yml` para la configuración completa.

---

## 📄 Licencia

MIT — Libre para usar, modificar y distribuir.

---

<p align="center">
  <sub>Hecho con ❤️ para usuarios que valoran la privacidad y la velocidad.</sub>
</p>
