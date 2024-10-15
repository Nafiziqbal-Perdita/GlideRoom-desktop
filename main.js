const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('node:path');
const { mouse }=require("@nut-tree-fork/nut-js")


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure you have a preload script
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false, // Disable sandboxing if not needed
      nodeIntegration: false, // Keep this false for security
      webSecurity: true, // Ensure web security is enabled
      experimentalFeatures: true // Enable experimental features if necessary
    }
  });

  win.loadFile('./screens/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for screen capture requests
ipcMain.handle('request-screen-capture', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
  return sources; // Return available sources for screen sharing
});
// Listen for mouse position from the renderer 
ipcMain.on("sendMousePosition",async(event,pos)=>{
  // console.log('Mouse Position Received in Main:', pos); // Log the received position
  // Handle the received position here as needed
  await mouse.move({x:pos.x,y:pos.y});
  console.log(`Mouse moved to (${pos.x}, ${pos.y})`);
 
})