"use strict"

const path = require("path");
const spawn = require("child_process").spawn
const electron = require("electron");

// get the electron executable path to spawn a child process with it,
// normally "require('electron')" will return its path, but if it's executed
// on an Electron context (i.e. using Scrapman within another Electron app)
// "require('electron')" will return the current Electron instance,
// if this is the case then get the path from the instance itself.
let electronPath = typeof electron === "string" ? electron : electron.app.getPath("exe");

var scrapmanPath = path.join(__dirname, './lib/scrapman.js');

let child = spawn(electronPath, [scrapmanPath], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
let scrapmanIsReady = false;
let onceReadyActionsQueue = [];
let actionsQueue = [];
let currentConcurrentOperations = 0;

let config = {
    maxConcurrentOperations: 50
}

const ipcManager_parent = require("ipc-messages-manager").parent;

let killChild = ()=>{ child.kill("SIGINT");}

// when parent process is exiting, then also kill the child process
process.on('exit', killChild);
process.on('SIGINT', killChild);
process.on('SIGTERM', killChild);
process.on('SIGQUIT', killChild);
process.on('SIGHUP', killChild);
process.on('SIGBREAK', killChild);

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
        // try to send the message to the child
        executeAction(action.action, action.params, action.callback);
    });

    // clean up the queue
    onceReadyActionsQueue = [];
}

let executeRemainingQueuedActions = () => {
    if(actionsQueue.length > 0){
        let queuedAction = actionsQueue.shift();
        executeAction(queuedAction.action, queuedAction.params, queuedAction.callback);
    }
}

//this function limits concurrent execution of several actions,
//to prevent the Three Stooges Syndrome (clogging above 50 concurrent operations)
let executeAction = (action, params, callback) => {
    // check if more concurrent operations can be executed
    if(currentConcurrentOperations < config.maxConcurrentOperations){

        // increment the "councurrent operations" counter
        currentConcurrentOperations++;

        // send the actual message to the child
        ipcManager_parent.send(child, action, params, function(results){
            callback(results);
            // once this concurrent operation finished, decrement the "concurrent oprations" counter
            currentConcurrentOperations--;
            // if there are pending operations on queue to be performed, then process them.
            executeRemainingQueuedActions();
        });

    }else{
        // all concurrent slots are occupied, queue this operation.
        actionsQueue.push({action, params, callback});
    }
}

let load = (url, callback) => {
    if (scrapmanIsReady) {
        // if scrapman instance is ready, try to send the action to the child
        executeAction("load", {url}, callback);
    } else {
        // if the scrapman instance is not ready yet, then add the function
        // to the queue that will get executed once it's ready
        queueOnceReadyAction("load", {url}, callback);
    }
}

let configure = (newConfig)=>{
    config = Object.assign({}, config, newConfig);
}

module.exports = {
    load,
    configure
}
