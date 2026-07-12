import { app, BrowserWindow, net, protocol, shell } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEVELOPMENT_URL = "http://localhost:5173";
const APP_PROTOCOL = "mentorapredict";

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function registerProductionProtocol(): void {
  protocol.handle(APP_PROTOCOL, (request) => {
    const webRoot = path.join(process.resourcesPath, "web");
    const url = new URL(request.url);
    const requestedPath = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname,
    );
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(webRoot, normalizedPath);

    if (!filePath.startsWith(webRoot)) {
      return new Response("Not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (!app.isPackaged) {
    void window.loadURL(DEVELOPMENT_URL);
    window.webContents.openDevTools();
    return;
  }

  void window.loadURL(`${APP_PROTOCOL}://app/index.html`);
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    registerProductionProtocol();
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
