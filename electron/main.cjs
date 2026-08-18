const { app, BrowserWindow, session } = require("electron");
const path = require("path");

app.enableSandbox();

const createWindow = () => {
  const window = new BrowserWindow({
    width: 420,
    height: 860,
    minWidth: 360,
    minHeight: 720,
    title: "易定观象",
    backgroundColor: "#0b0805",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event) => event.preventDefault());

  window.loadFile(path.join(__dirname, "../dist/index.html"));
};

app.whenReady().then(() => {
  app.setName("易定观象");
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
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
