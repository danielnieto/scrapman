"use strict"

const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const ipcManager_child = require("ipc-messages-manager").child;
let EventEmitter = require("events");
let state = new EventEmitter();

let win;

let promises = require("./promises.js");

// if Scrapman is being executed on Mac, hide its dock icon
if (app.dock) {
  app.dock.hide();
}

app.on("ready", () => {
    win = new BrowserWindow({
        show: false,
        webPreferences:{
            images: false
        }
    });

    win.loadURL(`file://${__dirname}/index.html`);

    win.webContents.on("did-finish-load", function() {
        //announce that electron instance is ready
        state.emit("ready");
    });

});

//load html from an html
let load = (url) => {
    let promise = new Promise(function(resolve, reject) {
        let id = promises.set({ resolve, reject });
        win.webContents.send("load", url, id);
    });

    return promise;
}

//Communication with the parent process

ipcManager_child.actions.on("notify-when-ready", (args, callback) => {
    state.on("ready", () => {
        // notify parent that scrapman instance is ready
        callback();
    });
});

ipcManager_child.actions.on("load", (args, cb) => {
    load(args.url).then((result) => {
        cb(result);
    });
});
