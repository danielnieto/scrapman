"use strict"

const path = require("path");
const spawn = require("child_process").spawn
const electronPath = require("electron");


var getRealPath = path.join(__dirname, './lib/getreal.js');

let child = spawn(electronPath, [getRealPath], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
let getRealIsReady = false;
let actionsQueue = [];

const ipcManager_parent = require("ipc-messages-manager").parent;

ipcManager_parent.send(child, "notify-when-ready", null, function() {
    getRealIsReady = true;
    executeQueue();
});

// add action to queue
let queueAction = (action, params, callback) => {
    actionsQueue.push({ action, params, callback });
}

let executeQueue = () => {
    // execute all pending actions, this will be executed once the "getReal"(Electron) instance is ready
    actionsQueue.forEach((action) => {
        // send the actual message to the child
        ipcManager_parent.send(child, action.action, action.params, function(result) {
            action.callback(result);
        });
    });

    // clean up the queue
    actionsQueue = [];
}

let load = (url, callback) => {
    if (getRealIsReady) {
        // if getReal instance is ready, immediately send the message to child
        ipcManager_parent.send(child, "load", {url}, function(result) {
            callback(result);
        });
    } else {
        // if the getReal instance is not ready yet, then add the function to the queue
        queueAction("load", {url}, callback);
    }
}

module.exports = {
    load
}
