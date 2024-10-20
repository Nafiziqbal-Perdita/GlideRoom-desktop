const { app, BrowserWindow, ipcMain, desktopCapturer,screen } = require('electron');
const path = require('node:path');
const { mouse, ConsoleLogLevel }=require("@nut-tree-fork/nut-js")


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



// Function to get the display size based on displayId
function getDisplaySize(displayId) {
  const displays = screen.getAllDisplays();
  console.log('Available Displays:', displays); // Log available displays for debugging
  const display = displays.find(d => d.id.toString() === displayId); // Compare as strings
  
  if (display) {
    console.log(`Found Display: ID=${displayId}, Width=${display.bounds.width}, Height=${display.bounds.height}`);
    return { width: display.bounds.width, height: display.bounds.height };
  }
  console.warn(`Display with ID=${displayId} not found.`);
  return { width: 0, height: 0 }; // Return default if display not found
}






// IPC handler for screen capture requests
ipcMain.handle('request-screen-capture', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
  console.log('Available Sources:', sources); // Log sources for debugging

  const sourcesWithSize = await Promise.all(sources.map(async (source) => {
    // Check if the source is a screen source
    if (source.id.startsWith('screen:')) {
      const displayId = source.display_id; // Use display_id directly from the source
      const { width, height } = getDisplaySize(displayId);
      return { ...source, width, height };
    }
    return { ...source, width: undefined, height: undefined }; // Handle windows
  }));

  console.log('Sources with Size:', sourcesWithSize); // Log sources with sizes for debugging
  return sourcesWithSize; // Return available sources for screen sharing
});












// // IPC handler for screen capture requests
// ipcMain.handle('request-screen-capture', async () => {
//   const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
 

//   const sourcesWithSize = await Promise.all(sources.map(async (source) => {
//     // Check if the source is a screen source
//     if (source.id.startsWith('screen:')) {
//       const displayId = source.id.split(':')[1]; // Extract the display ID from the source id
//       const { width, height } = getDisplaySize(displayId);
//       return { ...source, width, height };
//     }
//     return { ...source, width: undefined, height: undefined }; // Handle windows
//   }));

//   console.log(sourcesWithSize);




//   // return sources; // Return available sources for screen sharing
//   return sourcesWithSize;
// });













// Listen for mouse position from the renderer 
ipcMain.on("sendMousePosition",async(event,pos)=>{
  // console.log('Mouse Position Received in Main:', pos); // Log the received position
  // Handle the received position here as needed
  // await mouse.move({x:pos.x,y:pos.y});
  console.log(`Mouse moved to (${pos.x}, ${pos.y})`);
  console.log(pos);
 
})