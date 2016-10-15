"use strict"

const electron = require("electron");
const {app, BrowserWindow, ipcMain} = electron;

let win;

let promises = require("./promises.js");
let ready = false;

app.on("ready", ()=>{
    win = new BrowserWindow({show:false});

    win.loadURL(`file://${__dirname}/index.html`);

    win.webContents.on("did-finish-load", function(){

        ready = true;

    });

});


let visit = (url)=>{
    let promise = new Promise(function(resolve, reject){
        let id = promises.set({resolve, reject});
        win.webContents.send("getreal-load", url, id);
    });

    return promise;
}
