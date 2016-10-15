"use strict"

const electron = require("electron");
const {app, BrowserWindow, ipcMain} = electron;

let win;

let promises = require("./promises.js");

app.on("ready", ()=>{
    win = new BrowserWindow({show:false});

    win.loadURL(`file://${__dirname}/index.html`);

    // TESTING CODE
    win.webContents.on("did-finish-load", function(){

        // visit("../test-pages/testpage.html", function(html){
        //     console.log(html);
        // });
        // visit("http://google.com", function(html){
        //     console.log(">>>GOOGLE: " + html.substring(100, 110));
        // });
        // visit("http://yahoo.com", function(html){
        //     console.log(">>>YAHOO: " + html.substring(100, 110));
        //
        // });
        // visit("http://google.com", function(html){
        //     console.log(">>>GOOGLE AGAIN: " + html.substring(100, 110));
        //
        // });

        visit("../test-pages/testpage.html")
        .then((html)=>{
            console.log(html);
        })
        .catch((error)=>{ console.log("there was an error");});

    });
    // END OF TESTING USING GETREAL

});


let visit = (url)=>{
    let promise = new Promise(function(resolve, reject){
        let id = promises.set({resolve, reject});
        win.webContents.send("getreal-load", url, id);
    });

    return promise;
}
