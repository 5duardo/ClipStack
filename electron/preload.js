const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipstack', {
  getClips: () => ipcRenderer.invoke('clips:get'),
  copyClip: (id) => ipcRenderer.invoke('clips:copy', id),
  togglePin: (id) => ipcRenderer.invoke('clips:togglePin', id),
  remove: (id) => ipcRenderer.invoke('clips:remove', id),
  clearAll: () => ipcRenderer.invoke('clips:clearAll'),
  hideWindow: () => ipcRenderer.invoke('window:hide'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeApp: () => ipcRenderer.invoke('window:close'),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  getImageDataURL: (filepath) => ipcRenderer.invoke('clips:imageDataURL', filepath),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
  onSettingsUpdated: (cb) => {
    const listener = (_e, payload) => cb(payload);
    ipcRenderer.on('settings:updated', listener);
    return () => ipcRenderer.removeListener('settings:updated', listener);
  },
  onUpdated: (cb) => {
    const listener = (_e, payload) => cb(payload);
    ipcRenderer.on('clips:updated', listener);
    return () => ipcRenderer.removeListener('clips:updated', listener);
  },
  onShown: (cb) => {
    const listener = () => cb();
    ipcRenderer.on('window:shown', listener);
    return () => ipcRenderer.removeListener('window:shown', listener);
  },
  onOpenSettings: (cb) => {
    const listener = () => cb();
    ipcRenderer.on('window:open-settings', listener);
    return () => ipcRenderer.removeListener('window:open-settings', listener);
  },
});
