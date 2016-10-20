"use strict"

const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
let EventEmitter = require("events");
let state = new EventEmitter();

let win;

let promises = require("./promises.js");

app.dock.hide();

app.on("ready", () => {
    win = new BrowserWindow({
        show: false
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
