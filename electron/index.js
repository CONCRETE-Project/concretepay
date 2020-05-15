const { app, BrowserWindow, Menu } = require("electron");
const isDevMode = require("electron-is-dev");
const path = require("path");

let mainWindow;
const menuTemplateDev = [
    {
        label: "Application",
        submenu: [
            { type: "separator" },
            {
                label: "Quit",
                accelerator: "Command+Q",
                click: function () {
                    app.quit();
                },
            },
        ],
    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:",
            },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:",
            },
        ],
    },
];

async function createWindow() {
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1200,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(
                __dirname,
                "node_modules",
                "@capacitor",
                "electron",
                "dist",
                "electron-bridge.js"
            ),
        },
        // titleBarStyle: 'hiddenInset', // we need to update the app to account for this. Add extra padding to the top of the app. It looks sick
        // useContentSize: true
    });
    mainWindow.setResizable(true);

    if (isDevMode) {
        Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
        mainWindow.webContents.openDevTools();
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.webContents.on("dom-ready", () => {
        mainWindow.show();
    });
}

//app.on('ready', createWindow);
app.whenReady().then(createWindow);
// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
