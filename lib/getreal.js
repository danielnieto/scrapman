"use strict"

const electron = require("electron");
const {app, BrowserWindow, ipcMain} = electron;

let win;

app.on("ready", ()=>{
    win = new BrowserWindow({show:false});

    win.loadURL(`file://${__dirname}/index.html`);

    // TESTING CODE
    win.webContents.on("did-finish-load", function(){

        visit("../test-pages/testpage.html", function(html){
            console.log(html);
        });

    });
    // END OF TESTING USING GETREAL

});


let visit = (url, callback)=>{

    ipcMain.once("getreal-load", (event, arg)=>{
        console.log(arg);
    });

    win.webContents.send("getreal-load", url);
}
