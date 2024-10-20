const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  requestScreenCapture: () => ipcRenderer.invoke('request-screen-capture'),
  // Send screen size (width, height) to the main process
  sendScreenSize: (size) => ipcRenderer.send('send-screen-size', size), // size is an object like { width, height }
  
  sendMousePosition: (pos) => ipcRenderer.send('sendMousePosition', pos), 
  sendMouseClick: (pos) => ipcRenderer.send('sendMouseClick', pos), 
  keyEvent: (pos) => ipcRenderer.send('keyEvent', pos), 
});
