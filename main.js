const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  screen,
} = require("electron");
const path = require("node:path");
const {
  mouse,
  Button,
  ConsoleLogLevel,
  right,
  Keyboard,
  Key,
  keyboard,
} = require("@nut-tree-fork/nut-js");

let height;
let width;
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Ensure you have a preload script
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false, // Disable sandboxing if not needed
      nodeIntegration: false, // Keep this false for security
      webSecurity: true, // Ensure web security is enabled
      experimentalFeatures: true, // Enable experimental features if necessary
    },
  });

  win.loadFile("./screens/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handler for screen capture requests
ipcMain.handle("request-screen-capture", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
  });

  return sources; // Return available sources for screen sharing
});

// Handle incoming screen size data
ipcMain.on("send-screen-size", (event, size) => {
  height = size.height;
  width = size.width;
  console.log(`Received screen size: ${width}x${height}`);
  // You can now use `size.width` and `size.height` as needed
  // Example: Adjusting the window size
});

// Listen for mouse position from the renderer
ipcMain.on("sendMousePosition", async (event, pos) => {
  if (pos.width !== 0 && pos.height !== 0) {
    const ratioX = width / pos.width;
    const ratioY = height / pos.height;
    const hostX = pos.x * ratioX;
    const hostY = pos.y * ratioY;
    console.log(hostX, hostY);
    await mouse.move({ x: hostX, y: hostY });
  } else {
    console.log("Error: pos.width or pos.height is zero");
  }

  console.log(`Mouse moved to (${pos.x}, ${pos.y})`);
  console.log(pos);
});





ipcMain.on("keyEvent", async (event, keyData) => {
  console.log(keyData);

  const { key, code } = keyData;

  try {
    if (key === "Enter") {
      await keyboard.type(Key.Enter); // Using lowercase `keyboard`
    } else if (key === "Escape") {
      await keyboard.type(Key.Escape); // Using lowercase `keyboard`
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      // For single letter keys, use direct typing
      await keyboard.type(key); // Type letters directly using `keyboard.type`
    } else if (Key[key]) {
      // For other keys like arrows, function keys, etc.
      await keyboard.pressKey(Key[key]);
      await keyboard.releaseKey(Key[key]);
    } else {
      console.log("Unhandled key event:", keyData);
    }
  } catch (error) {
    console.error("Error typing key:", error);
  }
});






ipcMain.on("sendMouseClick", async (event, clickData) => {
  console.log("Mouse click received in main.js:", clickData);
  // Handle the mouse click data (e.g., simulate a click using robotjs or another method)

  try {
    if (clickData.click === 0) {
      // left
      await mouse.click(Button.LEFT);
    }
    if (clickData.click === 2) {
      // right
      await mouse.click(Button.RIGHT);
    }
  } catch (error) {
    console.log(error);
  }
});
