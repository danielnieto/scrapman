"use strict"

const path = require("path");
const spawn = require("child_process").spawn
const electronPath = require("electron");


var scrapmanPath = path.join(__dirname, './lib/scrapman.js');

let child = spawn(electronPath, [scrapmanPath], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
let scrapmanIsReady = false;
let onceReadyActionsQueue = [];

const ipcManager_parent = require("ipc-messages-manager").parent;

ipcManager_parent.send(child, "notify-when-ready", null, function() {
    scrapmanIsReady = true;
    executeOnceReadyQueue();
});

// add action to once ready queue
let queueOnceReadyAction = (action, params, callback) => {
    onceReadyActionsQueue.push({ action, params, callback });
}

let executeOnceReadyQueue = () => {
    // execute all pending actions, this will be executed once the "scrapman"(Electron) instance is ready
    onceReadyActionsQueue.forEach((action) => {
        // send the actual message to the child
        ipcManager_parent.send(child, action.action, action.params, function(result) {
            action.callback(result);
        });
    });

    // clean up the queue
    onceReadyActionsQueue = [];
}

let load = (url, callback) => {
    if (scrapmanIsReady) {
        // if scrapman instance is ready, immediately send the message to child
        ipcManager_parent.send(child, "load", {url}, function(result) {
            callback(result);
        });
    } else {
        // if the scrapman instance is not ready yet, then add the function to the queue
        queueOnceReadyAction("load", {url}, callback);
    }
}

module.exports = {
    load
}
