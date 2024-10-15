const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  requestScreenCapture: () => ipcRenderer.invoke('request-screen-capture'),
});
