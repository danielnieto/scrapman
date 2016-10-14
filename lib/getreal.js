"use strict"

const electron = require("electron");
const {app, BrowserWindow, ipcMain} = electron;

let win;

let callbacks = require("./callbacks.js");

app.on("ready", ()=>{
    win = new BrowserWindow({show:false});

    win.loadURL(`file://${__dirname}/index.html`);

    // TESTING CODE
    win.webContents.on("did-finish-load", function(){

        visit("../test-pages/testpage.html", function(html){
            console.log(html);
        });
        visit("http://google.com", function(html){
            console.log(">>>GOOGLE: " + html.substring(100, 110));
        });
        visit("http://yahoo.com", function(html){
            console.log(">>>YAHOO: " + html.substring(100, 110));

        });
        visit("http://google.com", function(html){
            console.log(">>>GOOGLE AGAIN: " + html.substring(100, 110));

        });


    });
    // END OF TESTING USING GETREAL

});


let visit = (url, callback)=>{
    let id = callbacks.set(callback);
    console.log(id);
    win.webContents.send("getreal-load", url, id);
}
