import {app, BrowserWindow, ipcMain, Menu} from "electron";
import path from "path";
// import db from 'sqlite';
const ROOT_PATH = "file://" + path.join($dirname, "/../");
// db.open('./db.sqlite', { cached: true })

function isDev() {
    return (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath));
}
app.on("ready", () => {
    var mainWindow = new BrowserWindow({width: 960, height: 680});
    if (isDev()) {
        // if (process.platform == 'darwin') {
        // BrowserWindow.addDevToolsExtension(process.env.HOME + `/Library/Application
        // Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/3.1
        // . 2_0`); } else if (process.platform == 'win32') {
        // BrowserWindow.addDevToolsExtension(process.env.HOME +
        // `/AppData/Local/Google/Chrome/User
        // Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/3.1.2_0`); }
        mainWindow.openDevTools();
        Menu.setApplicationMenu(null);
    }
    mainWindow.loadURL(`${ROOT_PATH}/web/index.html`);
});
app.on("window-all-closed", function () {
    app.quit();
});